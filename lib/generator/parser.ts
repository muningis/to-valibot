import {
  actionContains,
  actionMinContains,
  actionMaxContains,
  actionDescription,
  actionExamples,
  actionPatternProperties,
  actionPropertyNames,
  actionEmail,
  actionInteger,
  actionIPv4,
  actionIPv6,
  actionIsoDate,
  actionUrl,
  actionIsoDateTime,
  actionIsoTime,
  actionMaxEntries,
  actionMaxLength,
  actionMaxValue,
  actionMinEntries,
  actionMinLength,
  actionMinValue,
  actionMultipleOf,
  type ActionNode,
  actionRegex,
  actionUniqueItems,
  actionUUID,
  type AnyNode,
  methodPipe,
  schemaNodeAllOf,
  schemaNodeAnyOf,
  schemaNodeArray,
  schemaNodeBoolean,
  schemaNodeConst,
  schemaNodeLiteral,
  schemaNodeNot,
  schemaNodeNull,
  schemaNodeNumber,
  schemaNodeObject,
  schemaNodeOneOf,
  schemaNodeOptional,
  schemaNodeReference,
  schemaNodeString,
  schemaNodeTuple,
  schemaNodeUnion,
} from '../schema-nodes.ts';
import type {
  JSONSchema,
  JSONSchemaAllOf,
  JSONSchemaArray,
  JSONSchemaBoolean,
  JSONSchemaNull,
  JSONSchemaNumber,
  JSONSchemaObject,
  JSONSchemaString,
} from '../types.ts';
import { appendSchema, capitalize, normalizeTitle } from '../utils/basic.ts';

interface ParsedJSONSchema {
  title: string;
  description?: string | undefined;
  definitions?: Record<string, JSONSchema> | undefined;
  $defs?: Record<string, JSONSchema> | undefined;
  properties: Record<string, JSONSchemaObject>;
  required?: string[] | undefined;
}

export interface ParserContext {
  refs: Map<string, string>;
  schemas: Record<string, AnyNode>;
  dependsOn: Record<string, string[]>;
  currentSchema: string | null;
}

export interface ParseMeta {
  parentRequired?: string[];
}

export class SchemaParser {
  private context: ParserContext;

  constructor(context: ParserContext) {
    this.context = context;
  }

  get currentSchema(): string | null {
    return this.context.currentSchema;
  }

  set currentSchema(value: string | null) {
    this.context.currentSchema = value;
  }

  parseJSONSchema(values: ParsedJSONSchema): void {
    if (values.definitions) {
      for (const [key, value] of Object.entries(values.definitions)) {
        const name = capitalize(appendSchema(key));
        this.currentSchema = name;
        this.context.dependsOn[this.currentSchema] = [];
        this.context.refs.set(`#/definitions/${key}`, name);
        this.context.schemas[name] = this.parseSchema(value, true);
      }
    }

    if (values.$defs) {
      for (const [key, value] of Object.entries(values.$defs)) {
        const name = capitalize(appendSchema(key));
        this.currentSchema = name;
        this.context.dependsOn[this.currentSchema] = [];
        this.context.refs.set(`#/$defs/${key}`, name);
        this.context.schemas[name] = this.parseSchema(value, true);
      }
    }

    const name = appendSchema(normalizeTitle(values.title));
    this.currentSchema = name;
    this.context.dependsOn[this.currentSchema] = [];
    this.context.refs.set(`#/definitions/${name}`, name);

    this.context.schemas[name] = this.parseObjectType({
      type: 'object',
      properties: values.properties,
      required: values.required ?? [],
      description: values.description,
    });
  }

  parseOpenAPI(values: Record<string, JSONSchema>): void {
    for (const key in values) {
      const name = capitalize(key);
      this.context.refs.set(`#/components/schemas/${key}`, appendSchema(name));
    }

    for (const [key, schema] of Object.entries(values)) {
      const name = appendSchema(capitalize(key));
      this.currentSchema = name;
      this.context.dependsOn[this.currentSchema] = [];
      this.context.schemas[this.currentSchema] = this.parseSchema(schema, true);
    }
  }

  parseSchema<Schema extends JSONSchema>(
    schema: Schema,
    required: boolean,
    meta?: ParseMeta
  ): AnyNode {
    if ('$ref' in schema) {
      const schemaName = schema.$ref
        .replace('#/components/schemas/', '')
        .replace('#/definitions/', '')
        .replace('#/$defs/', '');
      this.context.dependsOn[this.currentSchema!]!.push(
        appendSchema(capitalize(schemaName))
      );
      return required
        ? schemaNodeReference({ ref: capitalize(appendSchema(schemaName)) })
        : schemaNodeOptional({
            value: schemaNodeReference({
              ref: capitalize(appendSchema(schemaName)),
            }),
          });
    } else if ('const' in schema) {
      return schemaNodeConst({
        value: schema.const as string | number | boolean,
      });
    } else if ('type' in schema) {
      switch (schema.type) {
        case 'string':
          if ('enum' in schema) {
            return this.parseEnumType(schema, required);
          } else {
            return this.parseStringType(schema, required, meta);
          }
        case 'number':
        case 'integer':
          if ('enum' in schema) {
            return this.parseEnumType(schema, required);
          } else {
            return this.parseNumberType(schema, required, meta);
          }
        case 'boolean':
          return this.parseBooleanType(schema, required, meta);
        case 'array':
          return this.parseArrayType(schema, required, meta);
        case 'object':
          return this.parseObjectType(schema, required, meta);
        case 'null':
          return this.parseNullType(schema, required, meta);
        default:
          throw new Error(
            `Unsupported type: ${(schema as { type: string }).type}`
          );
      }
    } else {
      if ('allOf' in schema) {
        const allOfRequired = (schema as JSONSchemaAllOf).required ?? [];
        const combinedRequired = [
          ...allOfRequired,
          ...(meta?.parentRequired ?? []),
        ];
        return schemaNodeAllOf({
          value: schema.allOf.map((item) =>
            this.parseSchema(item, true, { parentRequired: combinedRequired })
          ),
        });
      } else if ('oneOf' in schema) {
        return schemaNodeOneOf({
          value: schema.oneOf.map((item) => this.parseSchema(item, true, meta)),
        });
      } else if ('anyOf' in schema) {
        return schemaNodeAnyOf({
          value: schema.anyOf.map((item) => this.parseSchema(item, true, meta)),
        });
      } else if ('not' in schema) {
        return schemaNodeNot({
          value: this.parseSchema(schema.not, true, meta),
        });
      }
      throw new Error(`Unsupported schema: ${JSON.stringify(schema)}`);
    }
  }

  private parseEnumType(
    schema: JSONSchemaString | JSONSchemaNumber,
    required: boolean
  ): AnyNode {
    const actions: ActionNode[] = [];
    const content = schema.enum!.map((v) => {
      return schemaNodeLiteral({ value: v });
    });

    if (schema.description !== undefined) {
      actions.push(actionDescription(schema.description));
    }
    if (schema.examples !== undefined && schema.examples.length > 0) {
      actions.push(actionExamples(schema.examples));
    }

    let value: AnyNode = schemaNodeUnion({ value: content });
    if (actions.length) value = methodPipe(value, actions);
    if (!required) value = schemaNodeOptional({ value, default: schema.default });
    return value;
  }

  private parseStringType(
    schema: JSONSchemaString,
    required: boolean,
    _meta?: ParseMeta
  ): AnyNode {
    let value: AnyNode = schemaNodeString();

    const actions: ActionNode[] = [];
    if (schema.minLength !== undefined) {
      actions.push(actionMinLength(schema.minLength));
    }
    if (schema.maxLength !== undefined) {
      actions.push(actionMaxLength(schema.maxLength));
    }

    switch (schema.format) {
      case 'email':
        actions.push(actionEmail());
        break;
      case 'uuid':
        actions.push(actionUUID());
        break;
      case 'date-time':
        actions.push(actionIsoDateTime());
        break;
      case 'date': {
        actions.push(actionIsoDate());
        break;
      }
      case 'time':
        actions.push(actionIsoTime());
        break;
      case 'duration':
        // ISO 8601 duration format
        actions.push(
          actionRegex(
            '^P(?:\\d+Y)?(?:\\d+M)?(?:\\d+W)?(?:\\d+D)?(?:T(?:\\d+H)?(?:\\d+M)?(?:\\d+(?:\\.\\d+)?S)?)?$'
          )
        );
        break;
      case 'idn-email':
        // Simplified international email pattern
        actions.push(actionRegex('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'));
        break;
      case 'hostname':
        // RFC 1123 hostname
        actions.push(
          actionRegex(
            '^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$'
          )
        );
        break;
      case 'idn-hostname':
        // Simplified internationalized hostname (allows unicode word characters)
        actions.push(actionRegex('^[\\w](?:[\\w-]{0,61}[\\w])?(?:\\.[\\w](?:[\\w-]{0,61}[\\w])?)*$'));
        break;
      case 'ipv4':
        actions.push(actionIPv4());
        break;
      case 'ipv6':
        actions.push(actionIPv6());
        break;
      case 'json-pointer':
        // RFC 6901 JSON Pointer
        actions.push(actionRegex('^(?:/(?:[^~/]|~0|~1)*)*$'));
        break;
      case 'relative-json-pointer':
        // Relative JSON Pointer
        actions.push(actionRegex('^(?:0|[1-9]\\d*)(?:#|(?:/(?:[^~/]|~0|~1)*)*)?$'));
        break;
      case 'uri':
        actions.push(actionUrl());
        break;
      case 'uri-reference':
        // URI or relative reference
        actions.push(actionRegex('^(?:[a-zA-Z][a-zA-Z0-9+.-]*:|[^:/?#]*(?:[?#]|$))'));
        break;
      case 'uri-template':
        // RFC 6570 URI Template (simplified - allows template variables in braces)
        actions.push(actionRegex('^[^{}]*(?:\\{[^{}]+\\}[^{}]*)*$'));
        break;
      case 'iri':
        // Internationalized Resource Identifier (simplified - uses URL pattern with unicode)
        actions.push(actionUrl());
        break;
      case 'iri-reference':
        // IRI or relative reference (simplified)
        actions.push(actionRegex('^(?:[a-zA-Z][a-zA-Z0-9+.-]*:|[^:/?#]*(?:[?#]|$))'));
        break;
    }

    if (schema.pattern) {
      actions.push(actionRegex(schema.pattern));
    }

    if (schema.description !== undefined) {
      actions.push(actionDescription(schema.description));
    }
    if (schema.examples !== undefined && schema.examples.length > 0) {
      actions.push(actionExamples(schema.examples));
    }

    if (actions.length) value = methodPipe(value, actions);
    if (!required) value = schemaNodeOptional({ value: value, default: schema.default });

    return value;
  }

  private parseNumberType(
    schema: JSONSchemaNumber,
    required: boolean,
    _meta?: ParseMeta
  ): AnyNode {
    let value: AnyNode = schemaNodeNumber();

    const actions: ActionNode[] = [];
    if (schema.type === 'integer') actions.push(actionInteger());

    if (schema.minimum !== undefined)
      actions.push(actionMinValue(schema.minimum));
    else if (schema.exclusiveMinimum !== undefined)
      actions.push(actionMinValue(schema.exclusiveMinimum + 1));
    if (schema.maximum !== undefined)
      actions.push(actionMaxValue(schema.maximum));
    else if (schema.exclusiveMaximum !== undefined)
      actions.push(actionMaxValue(schema.exclusiveMaximum - 1));

    if (schema.multipleOf !== undefined)
      actions.push(actionMultipleOf(schema.multipleOf));

    if (schema.description !== undefined) {
      actions.push(actionDescription(schema.description));
    }
    if (schema.examples !== undefined && schema.examples.length > 0) {
      actions.push(actionExamples(schema.examples));
    }

    if (actions.length) value = methodPipe(value, actions);
    if (!required) value = schemaNodeOptional({ value, default: schema.default });

    return value;
  }

  private parseArrayType(
    schema: JSONSchemaArray,
    required: boolean,
    meta?: ParseMeta
  ): AnyNode {
    // Check for prefixItems first (tuple arrays)
    if (schema.prefixItems && Array.isArray(schema.prefixItems)) {
      return this.parseTupleType(schema, required, meta);
    }

    let value: AnyNode;
    if (!schema.items || typeof schema.items === 'boolean') {
      // items is false, true, or undefined - no item validation
      value = schemaNodeArray({});
    } else if (Array.isArray(schema.items)) {
      const kind = schemaNodeUnion({
        value: schema.items.map((item) => this.parseSchema(item, true, meta)),
      });
      value = schemaNodeArray({ value: kind });
    } else {
      // items is a single JSONSchema
      const kind = this.parseSchema(schema.items, true, meta);
      value = schemaNodeArray({ value: kind });
    }
    const actions: ActionNode[] = [];

    if (schema.minItems !== undefined) {
      actions.push(actionMinLength(schema.minItems));
    }
    if (schema.maxItems !== undefined) {
      actions.push(actionMaxLength(schema.maxItems));
    }
    if (schema.uniqueItems) {
      actions.push(actionUniqueItems());
    }
    if (schema.contains) {
      const containsSchema = this.parseSchema(schema.contains, true, meta);

      // Add contains validation
      if (schema.minContains !== undefined || schema.maxContains !== undefined) {
        // If minContains or maxContains is specified, use those in addition to the contains schema
        if (schema.minContains !== undefined) {
          actions.push(actionMinContains(containsSchema, schema.minContains));
        }
        if (schema.maxContains !== undefined) {
          actions.push(actionMaxContains(containsSchema, schema.maxContains));
        }
      } else {
        // Use basic contains (equivalent to minContains: 1)
        actions.push(actionContains(containsSchema));
      }
    }

    if (schema.description !== undefined) {
      actions.push(actionDescription(schema.description));
    }
    if (schema.examples !== undefined && schema.examples.length > 0) {
      actions.push(actionExamples(schema.examples));
    }

    if (actions.length) value = methodPipe(value, actions);
    if (!required) value = schemaNodeOptional({ value, default: schema.default });

    return value;
  }

  private parseTupleType(
    schema: JSONSchemaArray,
    required: boolean,
    meta?: ParseMeta
  ): AnyNode {
    // Parse each prefix item
    const items = schema.prefixItems!.map((item: JSONSchema) =>
      this.parseSchema(item, true, meta)
    );

    let rest: AnyNode | undefined;

    // Handle additional items
    if (schema.items !== false && schema.items !== undefined) {
      if (typeof schema.items !== 'boolean' && !Array.isArray(schema.items)) {
        // items is a single JSONSchema
        rest = this.parseSchema(schema.items, true, meta);
      }
    }

    // Create tuple props conditionally to satisfy exactOptionalPropertyTypes
    const tupleProps: { items: AnyNode[]; rest?: AnyNode } = { items };
    if (rest !== undefined) {
      tupleProps.rest = rest;
    }
    let value: AnyNode = schemaNodeTuple(tupleProps);

    // Handle validations
    const actions: ActionNode[] = [];

    if (schema.minItems !== undefined) {
      actions.push(actionMinLength(schema.minItems));
    }
    if (schema.maxItems !== undefined) {
      actions.push(actionMaxLength(schema.maxItems));
    }
    if (schema.uniqueItems) {
      actions.push(actionUniqueItems());
    }

    // Add contains validation support for tuples
    if (schema.contains) {
      const containsSchema = this.parseSchema(schema.contains, true, meta);

      if (schema.minContains !== undefined || schema.maxContains !== undefined) {
        // If minContains or maxContains is specified, use those in addition to the contains schema
        if (schema.minContains !== undefined) {
          actions.push(actionMinContains(containsSchema, schema.minContains));
        }
        if (schema.maxContains !== undefined) {
          actions.push(actionMaxContains(containsSchema, schema.maxContains));
        }
      } else {
        // Use basic contains (equivalent to minContains: 1)
        actions.push(actionContains(containsSchema));
      }
    }

    if (schema.description !== undefined) {
      actions.push(actionDescription(schema.description));
    }
    if (schema.examples !== undefined && schema.examples.length > 0) {
      actions.push(actionExamples(schema.examples));
    }

    if (actions.length) {
      value = methodPipe(value, actions);
    }

    if (!required) {
      value = schemaNodeOptional({ value, default: schema.default });
    }

    return value;
  }

  private parseBooleanType(
    schema: JSONSchemaBoolean,
    required: boolean,
    _meta?: ParseMeta
  ): AnyNode {
    let value: AnyNode = schemaNodeBoolean();
    const actions: ActionNode[] = [];

    if (schema.description !== undefined) {
      actions.push(actionDescription(schema.description));
    }
    if (schema.examples !== undefined && schema.examples.length > 0) {
      actions.push(actionExamples(schema.examples));
    }

    if (actions.length) value = methodPipe(value, actions);
    if (!required) value = schemaNodeOptional({ value, default: schema.default });
    return value;
  }

  private parseNullType(
    schema: JSONSchemaNull,
    required?: boolean,
    _meta?: ParseMeta
  ): AnyNode {
    let value: AnyNode = schemaNodeNull();
    const actions: ActionNode[] = [];

    if (schema.description !== undefined) {
      actions.push(actionDescription(schema.description));
    }
    if (schema.examples !== undefined && schema.examples.length > 0) {
      actions.push(actionExamples(schema.examples));
    }

    if (actions.length) value = methodPipe(value, actions);
    if (!required) value = schemaNodeOptional({ value, default: schema.default });
    return value;
  }

  parseObjectType(
    schema: JSONSchemaObject,
    required = true,
    meta?: ParseMeta
  ): AnyNode {
    const effectiveRequired = [
      ...(schema.required ?? []),
      ...(meta?.parentRequired ?? []),
    ];
    const content = Object.fromEntries(
      Object.entries(schema.properties ?? {})
        .map(([key, value]) => {
          const isPropertyRequired = effectiveRequired.includes(key);
          return [key, this.parseSchema(value, isPropertyRequired, meta)];
        })
        .filter(Boolean)
    );

    const type =
      schema.additionalProperties === false
        ? 'strictObject'
        : typeof schema.additionalProperties === 'object'
          ? 'objectWithRest'
          : 'object';
    let value: AnyNode =
      type === 'objectWithRest'
        ? schemaNodeObject({
            value: content,
            type,
            withRest: this.parseSchema(
              schema.additionalProperties as object,
              true,
              meta
            ),
          })
        : schemaNodeObject({
            value: content,
            type,
          });
    const actions: ActionNode[] = [];

    if (schema.description !== undefined) {
      actions.push(actionDescription(schema.description));
    }
    if (schema.minProperties !== undefined) {
      actions.push(actionMinEntries(schema.minProperties));
    }
    if (schema.maxProperties !== undefined) {
      actions.push(actionMaxEntries(schema.maxProperties));
    }
    if (schema.propertyNames) {
      actions.push(
        actionPropertyNames(this.parseSchema(schema.propertyNames, true, meta))
      );
    }
    if (schema.patternProperties) {
      const patterns = Object.entries(schema.patternProperties).map(
        ([pattern, patternSchema]) => ({
          pattern,
          schema: this.parseSchema(patternSchema, true, meta),
        })
      );
      actions.push(actionPatternProperties(patterns));
    }
    if (schema.examples !== undefined && schema.examples.length > 0) {
      actions.push(actionExamples(schema.examples));
    }

    if (actions.length) value = methodPipe(value, actions);
    if (!required) value = schemaNodeOptional({ value, default: schema.default });

    return value;
  }
}
