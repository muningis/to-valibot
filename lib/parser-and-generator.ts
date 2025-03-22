import { any, object, record, string, parse, array, InferOutput, optional, check, pipe } from 'valibot';
import { parse as parseYaml } from 'yaml';

import { appendSchema, capitalize, normalizeTitle } from './utils/basic';
import { topologicalSort } from './utils/topological-sort';

import type {
  JSONSchema,
  JSONSchemaArray,
  JSONSchemaBoolean,
  JSONSchemaNumber,
  JSONSchemaObject,
  JSONSchemaString,
} from './types';
import { ActionNode, AnyNode, SchemaNode, actionEmail, actionIsoDateTime, actionMaxLength, actionMaxValue, actionMinLength, actionMinValue, actionMultipleOf, actionRegex, actionUUID, actionUniqueItems, methodPipe, schemaNodeArray, schemaNodeBoolean, schemaNodeLiteral, schemaNodeNull, schemaNodeNumber, schemaNodeObject, schemaNodeOptional, schemaNodeReference, schemaNodeString, schemaNodeUnion } from './schema-nodes';


const OpenAPISchema = object({
  components: object({
    schemas: record(string(), any()),
  }),
});

const JSONSchemaSchema = object({
  $schema:  string(),
  title: string(),
  type: string(),
  definitions: optional(record(string(), pipe(any(), check<JSONSchema>(() => true)))), 
  properties: pipe(any(), check<Record<string, JSONSchemaObject>>(() => true)),
  required: optional(array(string()))
});
type JSONSchemaSchema = InferOutput<typeof JSONSchemaSchema>;

const customRules = {
  uniqueItems: {
    code: `const uniqueItems = <Type, Message extends string>(
  message?: Message
): CheckItemsAction<Type[], Message | undefined> =>
  checkItems((item, i, arr) => arr.indexOf(item) === i, message);`,
    imports: ['CheckItemsAction', 'checkItems'],
  },
} as const;
type CustomRules = keyof typeof customRules;

const allowedImports = [
  'CheckItemsAction',
  'InferOutput',
  'array',
  'boolean',
  'check',
  'checkItems',
  'email',
  'literal',
  'maxLength',
  'maxValue',
  'minLength',
  'minValue',
  'multipleOf',
  'null',
  'number',
  'object',
  'optional',
  'pipe',
  'regex',
  'string',
  'union',
  'uuid',
  'isoDateTime'
] as const;
type AllowedImports = (typeof allowedImports)[number];

class ValibotGenerator {
  private root: { format: 'json'; value: JSONSchemaSchema } | { format: 'openapi-json' | 'openapi-yaml'; value: Record<string, JSONSchema> };

  private refs: Map<string, string> = new Map();
  private schemas: Record<string, string> = {};
  private dependsOn: Record<string, string[]> = {};
  private usedImports: Set<AllowedImports> = new Set();
  private customRules: Set<CustomRules> = new Set();

  private __currentSchema: string | null = null;

  constructor(content: string, format: 'openapi-json' | 'openapi-yaml' | 'json') {
    switch (format) {
      case 'openapi-json': {
        const parsed = parse(OpenAPISchema, JSON.parse(content));
        this.root = {
          value: parsed.components.schemas,
          format
        }
        return this;
      }
      case 'openapi-yaml': {
        const parsed = parse(OpenAPISchema, parseYaml(content));
        this.root = {
          value: parsed.components.schemas,
          format
        }
        return this;
      }
      case 'json': {
        const parsed = parse(JSONSchemaSchema, JSON.parse(content));
        this.root = {
          value: parsed,
          format
        }
        return this;
      }
    }
  }

  public generate() {
    switch (this.root.format) {
      case 'openapi-json':
      case 'openapi-yaml': {
        this.parseOpenAPI(this.root.value);
        break;
      }
      case 'json': {
        this.parseJSONSchema(this.root.value);
        break;
      }
    }

    const output: string[] = [];

    for (const rule of this.customRules.values()) {
      for (const imp of customRules[rule].imports) {
        this.usedImports.add(imp);
      }
    }

    const imports = [...this.usedImports.values()].sort((a, b) => {
      const aStartsWithUpper = /^[A-Z]/.test(a);
      const bStartsWithUpper = /^[A-Z]/.test(b);
      
      if (aStartsWithUpper && !bStartsWithUpper) return -1;
      else if (!aStartsWithUpper && bStartsWithUpper) return 1;
      else return a.localeCompare(b);
    })
    output.push(`import { `, imports.join(', '), ' } from "valibot";\n\n');

    const cr = Array.from(this.customRules.values());
    if (cr.length > 0) {
      output.push(
        cr.map(rule => customRules[rule].code).join('\n\n'),
        '\n\n',
      );
    }

    const schemas = topologicalSort(this.schemas, this.dependsOn);
    for (const [schemaDeclaration, schemaCode] of schemas) {
      output.push(`const ${schemaDeclaration} = ${schemaCode};`, '\n\n');
    }

    const exports = Object.keys(this.schemas)
      .sort((a,b) => a.localeCompare(b))
      .map((e) => `  ${e},\n`);
    output.push(`export {\n`, exports.join(''), '}');

    return output.join('');
  }

  private parseJSONSchema(values: JSONSchemaSchema) {
    if (values.definitions) {
      for (const [key, value] of Object.entries(values.definitions)) {
        const name = capitalize(appendSchema(key));
        this.__currentSchema = name;  
        this.dependsOn[this.__currentSchema] = [];
        this.refs.set(`#/definitions/${key}`, name);
        this.schemas[name] = this.generateSchema(this.parseSchema(value, true));
      }
    }

    const name = appendSchema(normalizeTitle(values.title));
    this.__currentSchema = name;
    this.dependsOn[this.__currentSchema] = [];
    this.refs.set(`#/definitions/${name}`, name);

    this.schemas[name] = this.generateSchema(
      this.parseObjectType({
      type: 'object',
      properties: values.properties,
      required: values.required
      })
    );
  }

  private parseOpenAPI(values: Record<string, JSONSchema>) {
    for (const key in values) {
      const name = capitalize(key);
      this.refs.set(`#/components/schemas/${key}`, appendSchema(name));
    }

    for (const [key, schema] of Object.entries(values)) {
      const name = appendSchema(capitalize(key));
      this.__currentSchema = name;
      this.dependsOn[this.__currentSchema] = [];
      this.schemas[this.__currentSchema] = this.generateSchema(this.parseSchema(schema, true));
    }    
  }

  private parseSchema<Schema extends JSONSchema>(schema: Schema, required: boolean): AnyNode {
    if ('$ref' in schema) {
      const schemaName = schema.$ref.replace('#/components/schemas/', '').replace('#/definitions/', '');
      this.dependsOn[this.__currentSchema!]!.push(appendSchema(capitalize(schemaName)));
      return required
        ? schemaNodeReference({ ref: capitalize(appendSchema(schemaName)) })
        : schemaNodeOptional({ value: schemaNodeReference({ ref: capitalize(appendSchema(schemaName)) }) });
    } else if ('type' in schema) {
      switch (schema.type) {
        case 'string':
          if ('enum' in schema) {
            return this.parseEnumType(schema, required);
          } else {
            return this.parseStringType(schema, required);
          }
        case 'number':
        case 'integer':
          if ('enum' in schema) {
            return this.parseEnumType(schema, required);
          } else {
            return this.parseNumberType(schema, required);
          }
        case 'boolean':
          return this.parseBooleanType(schema, required);
        case 'array':
          return this.parseArrayType(schema, required);
        case 'object':
          return this.parseObjectType(schema, required);
        case 'null':
          return this.parseNullType();
        default:
          throw new Error(`Unsupported type: ${(schema as any).type}`);
      }
    }
    else throw new Error('`allOf`, `anyOf`, `oneOf` and `not` are not yet implemented');
  }

  private parseEnumType(schema: JSONSchemaString | JSONSchemaNumber, required: boolean): AnyNode {
    const content = schema.enum!.map((value) => {
      const val = schema.type === 'string'
        ? `'${value}'`
        : schema.type === 'number' || schema.type === 'integer'
        ? value
        : null;
      return schemaNodeLiteral({ value: val });
    })

    return required
      ? schemaNodeUnion({ value: content })
      : schemaNodeOptional({ value: schemaNodeUnion({ value: content }) });
  }

  private parseStringType(schema: JSONSchemaString, required: boolean): AnyNode {
    let value: AnyNode = schemaNodeString();

    const actions: ActionNode[] = [];
    if ("minLength" in schema && schema.minLength !== undefined) {
      actions.push(actionMinLength(schema.minLength));
    }
    if (schema.maxLength !== undefined) {
      this.usedImports.add('maxLength');
      actions.push(actionMaxLength(schema.maxLength));
    }

    if (schema.format === 'email') {
      this.usedImports.add('email');
      actions.push(actionEmail());
    } else if (schema.format === 'uuid') {
      this.usedImports.add('uuid');
      actions.push(actionUUID());
    } else if (schema.format === 'date-time') {
      this.usedImports.add('isoDateTime');
      actions.push(actionIsoDateTime());
    }

    if (schema.pattern) {
      this.usedImports.add('regex');
      actions.push(actionRegex(schema.pattern));
    }

    if (actions.length) value = methodPipe(value, actions);
    if (!required) value = schemaNodeOptional({ value: value });

    return value;
  }

  private parseNumberType(schema: JSONSchemaNumber, required: boolean): AnyNode {
    let value: AnyNode = schemaNodeNumber();

    const actions: ActionNode[] = [];
    if (schema.minimum !== undefined) actions.push(actionMinValue(schema.minimum));
    else if (schema.exclusiveMinimum !== undefined) actions.push(actionMinValue(schema.exclusiveMinimum + 1));
    if (schema.maximum !== undefined) actions.push(actionMaxValue(schema.maximum));
    else if (schema.exclusiveMaximum !== undefined) actions.push(actionMaxValue(schema.exclusiveMaximum - 1));
    

    if (schema.multipleOf !== undefined) actions.push(actionMultipleOf(schema.multipleOf));

    if (actions.length) value = methodPipe(value, actions);
    if (!required) value = schemaNodeOptional({ value });

    return value;
  }

  private parseArrayType(schema: JSONSchemaArray, required: boolean): AnyNode {
    if (!schema.items) {
      return schemaNodeArray({});
    }
    const kind = Array.isArray(schema.items)
      ? schemaNodeUnion({ value: schema.items.map(item => this.parseSchema(item, true)) })
      : this.parseSchema(schema.items, true)
    let value: AnyNode = schemaNodeArray({ value: kind });
    const actions: ActionNode[] = [];

    if (schema.minItems !== undefined) {
      this.usedImports.add('minLength');
      actions.push(actionMinLength(schema.minItems));
    }
    if (schema.maxItems !== undefined) {
      this.usedImports.add('maxLength');
      actions.push(actionMaxLength(schema.maxItems));
    }
    if (schema.uniqueItems) {
      actions.push(actionUniqueItems());
    }

    if (actions.length) value = methodPipe(value, actions);
    if (!required) value = schemaNodeOptional({ value });

    return value;
  }

  private parseBooleanType(schema: JSONSchemaBoolean, required: boolean): AnyNode {
    let value: AnyNode = schemaNodeBoolean();
    if (!required) value = schemaNodeOptional({ value });
    return value;
  }
  
  private parseNullType(): AnyNode {
    return schemaNodeNull();
  }

  private parseObjectType(schema: JSONSchemaObject, required = true): AnyNode {
    const content = Object.fromEntries(Object.entries(schema.properties ?? {}).map(([key, value]) => {
      const required = schema.required?.includes(key) ?? false;
      return [key, this.parseSchema(value, required)];
    }).filter(Boolean));
    
    let value: AnyNode = schemaNodeObject({ value: content });
    const actions: ActionNode[] = [];

    if (actions.length) value = methodPipe(value, actions);
    if (!required) value = schemaNodeOptional({ value });

    return value;
  }

  private visitSchemaNode(schema: AnyNode, depth = 1): string {
    switch (schema.name) {
      case '$ref':
        return schema.ref!;
      case 'array':
        this.usedImports.add('array');
        return `array(${this.visitSchemaNode(schema.value!, depth)})`;
      case 'boolean':
        this.usedImports.add('boolean');
        return 'boolean()';
      case 'email':
        this.usedImports.add('email');
        return `email()`;
      case 'integer':
      case 'number':
        this.usedImports.add('number');
        return `number()`;
      case 'isoDateTime':
        this.usedImports.add('isoDateTime');
        return 'isoDateTime()';
      case 'literal':
        this.usedImports.add('literal');
        return `literal(${schema.value})`;
      case 'maxLength':
        this.usedImports.add('maxLength');
        return `maxLength(${schema.value})`;
      case 'minLength':
        this.usedImports.add('minLength');
        return `minLength(${schema.value})`;
      case 'maxValue':
        this.usedImports.add('maxValue');
        return `maxValue(${schema.value})`;
      case 'minValue':
        this.usedImports.add('minValue');
        return `minValue(${schema.value})`;
      case 'multipleOf':
        this.usedImports.add('multipleOf');
        return `multipleOf(${schema.value})`;
      case 'null':
        this.usedImports.add('null');
        return 'null()';
      case 'object': {
        this.usedImports.add('object');
        const items = Object.entries(schema.value);
        if (items.length === 0) return `object({})`;

        const inner: string = Object.entries(schema.value)
          .map(([key, item]) => `${'  '.repeat(depth)}${key}: ${this.visitSchemaNode(item, depth + 1)},\n`).join('')
        return `object({\n${inner}${'  '.repeat(depth-1)}})`;
      }
      case 'optional':
        this.usedImports.add('optional');
        return `optional(${this.visitSchemaNode(schema.value, depth)})`;
      case 'pipe': {
        this.usedImports.add('pipe');
        const inner: string = schema.value
          .map((item) => this.visitSchemaNode(item, depth)).join(', ')
        return `pipe(${inner})`;
      }
      case 'regex': {
        this.usedImports.add('regex');
        return `regex(/${schema.value}/)`;
      }
      case 'string': {
        this.usedImports.add('string');
        return `string()`;
      }
      case 'union': {
        this.usedImports.add('union');
        
        const inner: string = schema.value?.map((item) => `${'  '.repeat(depth)}${this.visitSchemaNode(item, depth + 1)},\n`).join('') ?? '';
        return `union([\n${inner}${'  '.repeat(depth-1)}])`;
      }
      case 'uniqueItems': {
        this.customRules.add('uniqueItems');
        return `uniqueItems()`;
      }
      case 'uuid': {
        this.usedImports.add('uuid');
        return 'uuid()';
      }
    }
  }

  private generateSchema(schema: AnyNode): string {
    return this.visitSchemaNode(schema);
  }
}

export { ValibotGenerator }