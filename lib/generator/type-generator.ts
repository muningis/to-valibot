import type { AnyNode } from '../schema-nodes.ts';

/**
 * Generates TypeScript type definition from an AST node
 *
 * @param node - The schema node to generate type from
 * @param depth - The current indentation depth (default: 1)
 *
 * @returns The generated TypeScript type definition as a string
 */
export function generateNodeType(node: AnyNode, depth = 1): string {
  switch (node.name) {
    case 'email':
    case 'uuid':
    case 'uniqueItems':
    case 'isoDateTime':
    case 'multipleOf':
    case 'maxLength':
    case 'maxValue':
    case 'minLength':
    case 'minValue':
    case 'regex':
    case 'description':
    case 'isoDate':
    case 'isoTime':
    case 'ipv4':
    case 'ipv6':
    case 'url':
    case 'minEntries':
    case 'maxEntries':
    case 'contains':
    case 'minContains':
    case 'maxContains':
    case 'propertyNames':
    case 'patternProperties':
    case 'examples': {
      return '';
    }
    case 'pipe': {
      return generateNodeType(node.value[0]);
    }
    case 'boolean':
    case 'string':
    case 'number':
    case 'null': {
      return node.name;
    }
    case '$ref': {
      return node.ref.replace(/Schema/, '');
    }
    case 'array': {
      if (!node.value) return `any[]`;
      return `${generateNodeType(node.value, depth)}[]`;
    }
    case 'tuple': {
      const items = node.items
        .map((item) => generateNodeType(item, depth))
        .join(', ');

      if (node.rest) {
        return `[${items}, ...${generateNodeType(node.rest, depth)}[]]`;
      }

      return `[${items}]`;
    }
    case 'integer': {
      return 'number';
    }
    case 'literal': {
      return typeof node.value === 'string'
        ? JSON.stringify(node.value)
        : `${node.value}`;
    }
    case 'object': {
      const items = Object.entries(node.value);
      if (items.length === 0) return `object`;

      const inner: string = items
        .map(([key, item]) => {
          return item.name === 'optional'
            ? `${'  '.repeat(depth)}${key}?: ${generateNodeType(item.value, depth + 1)} | undefined;\n`
            : `${'  '.repeat(depth)}${key}: ${generateNodeType(item, depth + 1)};\n`;
        })
        .join('');
      return `{\n${inner}${'  '.repeat(depth - 1)}}`;
    }
    case 'union': {
      const inner = node.value
        .map((item) => generateNodeType(item, depth))
        .join(' | ');
      return `(${inner})`;
    }
    case 'const':
      return JSON.stringify(node.value);
    case 'allOf': {
      const inner = node.value
        .map((item) => generateNodeType(item, depth))
        .join(' & ');
      return `(${inner})`;
    }
    case 'anyOf':
    case 'oneOf': {
      const inner = node.value
        .map((item) => generateNodeType(item, depth))
        .join(' | ');
      return `(${inner})`;
    }
    case 'not':
      // TypeScript cannot express "any type except X", so we use unknown
      return 'unknown';
    case 'optional': {
      throw new Error('Top-level optional is unsupported');
    }
  }
}

/**
 * Generates TypeScript type declaration from a schema node
 *
 * @param schema - The schema node to generate type declaration from
 *
 * @returns The generated TypeScript type declaration
 */
export function generateSchemaTypeDeclaration(schema: AnyNode): string {
  return generateNodeType(schema);
}
