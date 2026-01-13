import {
  any,
  array,
  check,
  type InferOutput,
  object,
  optional,
  parse,
  pipe,
  record,
  string,
} from 'valibot';
import { parse as parseYaml } from 'yaml';
import type { AnyNode } from '../schema-nodes.ts';
import type { JSONSchema, JSONSchemaObject } from '../types.ts';
import { findAndHandleCircularReferences } from '../utils/circular-refs.ts';
import { topologicalSort } from '../utils/topological-sort.ts';
import {
  extractDescription,
  generateJSDocComment,
  generateSchemaCode,
} from './code-generator.ts';
import { customRules, type CustomRules } from './constants.ts';
import { type ParserOptions, SchemaParser } from './parser.ts';
import { generateSchemaTypeDeclaration } from './type-generator.ts';

export interface ValibotGeneratorOptions {
  optionalAsNullable: boolean;
}

const OpenAPISchema = object({
  info: object({
    title: string(),
  }),
  components: object({
    schemas: record(string(), any()),
  }),
});

const JSONSchemaSchema = object({
  $schema: string(),
  title: string(),
  type: string(),
  description: optional(string()),
  definitions: optional(
    record(
      string(),
      pipe(
        any(),
        check<JSONSchema>(() => true)
      )
    )
  ),
  $defs: optional(
    record(
      string(),
      pipe(
        any(),
        check<JSONSchema>(() => true)
      )
    )
  ),
  properties: optional(
    pipe(
      any(),
      check<Record<string, JSONSchemaObject>>(() => true)
    )
  ),
  required: optional(array(string())),
  allOf: optional(
    pipe(
      any(),
      check<JSONSchema[]>(() => true)
    )
  ),
  additionalProperties: optional(any()),
});

type JSONSchemaSchemaType = InferOutput<typeof JSONSchemaSchema>;

class ValibotGenerator {
  private root:
    | { format: 'json'; value: JSONSchemaSchemaType; title: string }
    | {
        format: 'openapi-json' | 'openapi-yaml';
        value: Record<string, JSONSchema>;
        title: string;
      };

  get title(): string {
    return this.root.title;
  }

  private refs = new Map<string, string>();
  private schemas: Record<string, AnyNode> = {};
  private dependsOn: Record<string, string[]> = {};
  private usedImports = new Set<string>();
  private customRulesUsed = new Set<CustomRules>();

  private parser: SchemaParser;

  constructor(
    content: string,
    format: 'openapi-json' | 'openapi-yaml' | 'json',
    options?: ValibotGeneratorOptions
  );
  constructor(
    content: object,
    format: 'openapi-json' | 'json',
    options?: ValibotGeneratorOptions
  );
  constructor(
    content: string | object,
    format: 'openapi-json' | 'openapi-yaml' | 'json',
    options?: ValibotGeneratorOptions
  ) {
    const parserOptions: ParserOptions = {
      optionalAsNullable: options?.optionalAsNullable ?? false,
    };

    // Initialize parser with shared context
    this.parser = new SchemaParser(
      {
        refs: this.refs,
        schemas: this.schemas,
        dependsOn: this.dependsOn,
        currentSchema: null,
      },
      parserOptions
    );

    switch (format) {
      case 'openapi-json': {
        const parsed = parse(
          OpenAPISchema,
          typeof content === 'string' ? JSON.parse(content) : content
        );
        this.root = {
          value: parsed.components.schemas,
          format,
          title: parsed.info.title,
        };
        return this;
      }
      case 'openapi-yaml': {
        const parsed = parse(OpenAPISchema, parseYaml(content as string));
        this.root = {
          value: parsed.components.schemas,
          format,
          title: parsed.info.title,
        };
        return this;
      }
      case 'json': {
        const parsed = parse(
          JSONSchemaSchema,
          typeof content === 'string' ? JSON.parse(content) : content
        );
        this.root = {
          value: parsed,
          format,
          title: parsed.title,
        };
        return this;
      }
    }
  }

  public generate(): string {
    switch (this.root.format) {
      case 'openapi-json':
      case 'openapi-yaml': {
        this.parser.parseOpenAPI(this.root.value);
        break;
      }
      case 'json': {
        this.parser.parseJSONSchema(this.root.value);
        break;
      }
    }

    this.usedImports.add('InferOutput');

    const { circularReferences, selfReferencing } =
      findAndHandleCircularReferences(this.dependsOn);

    const visit = (node: AnyNode, schemaName: string) => {
      if (node.name === 'object') {
        this.usedImports.add(node.type);
      } else if (node.name === '$ref') {
        /** skip */
      } else if (customRules.includes(node.name as CustomRules)) {
        this.customRulesUsed.add(node.name as CustomRules);
      } else if (
        ['oneOf', 'allOf', 'anyOf', 'const', 'tuple'].includes(node.name)
      ) {
        switch (node.name) {
          case 'oneOf':
          case 'anyOf': {
            this.usedImports.add('union');
            break;
          }
          case 'allOf': {
            this.usedImports.add('intersect');
            break;
          }
          case 'const': {
            this.usedImports.add('literal');
            break;
          }
          case 'tuple': {
            // Handled in specific case below
            break;
          }
        }
      } else {
        // above if statement with `node.name in customRules` does not help
        // inferring that those strings should be omitted
        this.usedImports.add(node.name);
      }

      switch (node.name) {
        case '$ref':
          if (
            (selfReferencing.includes(node.ref) && schemaName === node.ref) ||
            circularReferences[schemaName]?.includes(node.ref)
          ) {
            this.usedImports.add('GenericSchema');
            this.usedImports.add('lazy');
            node.lazy = true;
          }
          break;
        case 'object':
          for (const child of Object.values(node.value)) {
            visit(child, schemaName);
          }
          if (node.withRest) {
            visit(node.withRest, schemaName);
          }
          break;
        case 'union':
          for (const child of node.value) {
            visit(child, schemaName);
          }
          break;
        case 'array':
        case 'optional':
        case 'not':
        case 'contains':
        case 'minContains':
        case 'maxContains':
        case 'propertyNames':
          if (node.value) visit(node.value, schemaName);
          break;
        case 'tuple':
          // Track import: tuple or tupleWithRest
          if (node.rest) {
            this.usedImports.add('tupleWithRest');
            visit(node.rest, schemaName);
          } else {
            this.usedImports.add('tuple');
          }
          // Visit each tuple item
          for (const item of node.items) {
            visit(item, schemaName);
          }
          break;
        case 'patternProperties':
          for (const entry of node.value) {
            visit(entry.schema, schemaName);
          }
          break;
        case 'pipe':
          node.value.forEach((v) => visit(v, schemaName));
          break;
        case 'anyOf':
        case 'allOf':
        case 'oneOf':
          node.value.forEach((v) => visit(v, schemaName));
          break;
      }
    };

    for (const [schemaName, schema] of Object.entries(this.schemas)) {
      visit(schema, schemaName);
    }

    const output: string[] = [];

    const imports = [...this.usedImports.values()].sort((a, b) => {
      const aStartsWithUpper = /^[A-Z]/.test(a);
      const bStartsWithUpper = /^[A-Z]/.test(b);

      if (aStartsWithUpper && !bStartsWithUpper) return -1;
      else if (!aStartsWithUpper && bStartsWithUpper) return 1;
      else return a.localeCompare(b);
    });
    output.push(`import { `, imports.join(', '), ' } from "valibot";\n');
    const cr = Array.from(this.customRulesUsed.values());
    if (cr.length) {
      output.push(
        `import { `,
        Array.from(this.customRulesUsed.values()).join(', '),
        ' } from "to-valibot/client";\n'
      );
    }

    const sortedSchemas = topologicalSort(this.schemas, this.dependsOn);
    for (const [schemaName, schemaNode] of sortedSchemas) {
      output.push('\n\n');
      const schemaCode = generateSchemaCode(schemaNode);
      const description = extractDescription(schemaNode);
      const jsdoc = generateJSDocComment(description);
      if (
        selfReferencing.includes(schemaName) ||
        schemaName in circularReferences
      ) {
        const typeName = schemaName.replace(/Schema/, '');
        const typeDeclaration = generateSchemaTypeDeclaration(schemaNode);
        const typeAnnotation =
          selfReferencing.includes(schemaName) ||
          schemaName in circularReferences
            ? `: GenericSchema<${typeName}>`
            : '';
        output.push(`export type ${typeName} = ${typeDeclaration}`, '\n\n');
        output.push(
          `${jsdoc}export const ${schemaName}${typeAnnotation} = ${schemaCode};`,
          '\n'
        );
      } else {
        output.push(
          `${jsdoc}export const ${schemaName} = ${schemaCode};`,
          '\n\n'
        );
        output.push(
          `export type ${schemaName.replace(/Schema/, '')} = InferOutput<typeof ${schemaName}>;\n`
        );
      }
    }

    return output.join('');
  }
}

export { ValibotGenerator };
