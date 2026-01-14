import type { AnyNode } from '../schema-nodes.ts';

/**
 * Extracts description from a node if it has one.
 * Descriptions are stored as ActionNodeDescription inside MethodNodePipe.
 * For optional nodes, we also check inside the wrapped value.
 *
 * @param node - The node to extract description from
 *
 * @returns The description string or undefined if not found
 */
export function extractDescription(node: AnyNode): string | undefined {
  if (node.name === 'pipe') {
    const descAction = node.value.find((n) => n.name === 'description');
    if (descAction && descAction.name === 'description') {
      return descAction.value;
    }
  }
  // Also check inside optional nodes
  if (node.name === 'optional' && node.value) {
    return extractDescription(node.value);
  }
  return undefined;
}

/**
 * Generates a JSDoc comment for a description
 *
 * @param description - The description text
 * @param indent - The indentation string (default: '')
 *
 * @returns The formatted JSDoc comment or empty string if no description
 */
export function generateJSDocComment(
  description: string | undefined,
  indent = ''
): string {
  if (!description) return '';

  // Escape */ to prevent premature JSDoc comment closure
  const escaped = description.replace(/\*\//g, '*\\/');

  // Handle multiline descriptions
  if (escaped.includes('\n')) {
    const lines = escaped.split('\n');
    const formattedLines = lines
      .map((line) => `${indent} * ${line}`)
      .join('\n');
    return `${indent}/**\n${formattedLines}\n${indent} */\n`;
  }

  return `${indent}/** ${escaped} */\n`;
}

/**
 * Formats an object property with JSDoc comment if it has a description
 *
 * @param key - The property key
 * @param item - The property value node
 * @param depth - The current indentation depth
 *
 * @returns The formatted property string with optional JSDoc comment
 */
function formatObjectProperty(
  key: string,
  item: AnyNode,
  depth: number
): string {
  const desc = extractDescription(item);
  const jsdoc = generateJSDocComment(desc, '  '.repeat(depth));
  return `${jsdoc}${'  '.repeat(depth)}${key}: ${generateNodeCode(item, depth + 1)},\n`;
}

/**
 * Generates Valibot schema code from an AST node
 *
 * @param node - The schema node to generate code from
 * @param depth - The current indentation depth (default: 1)
 *
 * @returns The generated Valibot schema code as a string
 */
export function generateNodeCode(node: AnyNode, depth = 1): string {
  switch (node.name) {
    case '$ref':
      if (node.lazy) return `lazy(() => ${node.ref})`;
      return node.ref;
    case 'array':
      if (!node.value) return 'array()';
      return `array(${generateNodeCode(node.value, depth)})`;
    case 'tuple': {
      const items = node.items
        .map(
          (item) =>
            `${' '.repeat(depth * 2)}${generateNodeCode(item, depth + 1)},`
        )
        .join('\n');

      if (node.rest) {
        const rest = generateNodeCode(node.rest, depth);
        return `tupleWithRest([\n${items}\n${' '.repeat((depth - 1) * 2)}], ${rest})`;
      }

      return `tuple([\n${items}\n${' '.repeat((depth - 1) * 2)}])`;
    }
    case 'integer':
      return 'integer()';
    case 'number':
      return `number()`;
    case 'literal':
      return `literal(${typeof node.value === 'string' ? JSON.stringify(node.value) : node.value})`;
    case 'maxLength':
      return `maxLength(${node.value})`;
    case 'minLength':
      return `minLength(${node.value})`;
    case 'maxValue':
      return `maxValue(${node.value})`;
    case 'minValue':
      return `minValue(${node.value})`;
    case 'multipleOf':
      return `multipleOf(${node.value})`;
    case 'description':
      return node.value.includes('\n')
        ? `description(\`${node.value}\`)`
        : `description("${node.value}")`;
    case 'examples':
      return `examples(${JSON.stringify(node.value)})`;
    case 'null':
      return 'null_()';
    case 'object': {
      const kind = node.type;
      const withRest =
        node.type === 'objectWithRest' ? node.withRest : undefined;
      if (withRest) {
        const items = Object.entries(node.value);
        if (items.length === 0)
          return `objectWithRest({}, ${generateNodeCode(withRest, depth)})`;

        const inner = items
          .map(([key, item]) => formatObjectProperty(key, item, depth))
          .join('');
        return `objectWithRest({\n${inner}${'  '.repeat(depth - 1)}},\n${'  '.repeat(depth - 1)}${generateNodeCode(withRest, depth)})`;
      }

      const items = Object.entries(node.value);
      if (items.length === 0) return `${kind}({})`;

      const inner = items
        .map(([key, item]) => formatObjectProperty(key, item, depth))
        .join('');
      return `${kind}({\n${inner}${'  '.repeat(depth - 1)}})`;
    }
    case 'optional':
      if (node.default !== undefined) {
        return `optional(${generateNodeCode(node.value, depth)}, ${JSON.stringify(node.default)})`;
      }
      return `optional(${generateNodeCode(node.value, depth)})`;
    case 'pipe': {
      const inner: string = node.value
        .map((item) => generateNodeCode(item, depth))
        .join(', ');
      return `pipe(${inner})`;
    }
    case 'regex': {
      return `regex(/${node.value.replace(/\//g, '\\/')}/)`;
    }
    case 'string': {
      return `string()`;
    }
    case 'union': {
      const inner: string =
        node.value
          ?.map(
            (item) =>
              `${'  '.repeat(depth)}${generateNodeCode(item, depth + 1)},\n`
          )
          .join('') ?? '';
      return `union([\n${inner}${'  '.repeat(depth - 1)}])`;
    }
    case 'minEntries':
    case 'maxEntries':
      return `${node.name}(${node.value})`;
    case 'uniqueItems':
    case 'uuid':
    case 'boolean':
    case 'email':
    case 'isoDateTime':
    case 'isoDate':
    case 'isoTime':
    case 'ipv4':
    case 'ipv6':
    case 'url': {
      return `${node.name}()`;
    }
    case 'const':
      return `literal(${JSON.stringify(node.value)})`;
    case 'allOf': {
      const kind = node.objectType;
      const entries: string[] = [];
      const constraints: string[] = [];

      for (const item of node.value) {
        if (item.name === '$ref') {
          // For refs, spread their entries
          if (item.lazy) {
            entries.push(
              `${'  '.repeat(depth)}...lazy(() => ${item.ref}).entries,\n`
            );
          } else {
            entries.push(`${'  '.repeat(depth)}...${item.ref}.entries,\n`);
          }
        } else if (item.name === 'object') {
          // For inline objects, extract their properties directly
          for (const [key, propNode] of Object.entries(item.value)) {
            entries.push(formatObjectProperty(key, propNode, depth));
          }
        } else if (item.name === 'pipe' && item.value[0]?.name === 'object') {
          // Object wrapped in pipe (for descriptions, etc)
          const objNode = item.value[0] as { value: Record<string, AnyNode> };
          for (const [key, propNode] of Object.entries(objNode.value)) {
            entries.push(formatObjectProperty(key, propNode, depth));
          }
        } else {
          // Non-object nodes like not() are collected as constraints
          constraints.push(generateNodeCode(item, depth));
        }
      }

      const inner = entries.join('');
      let objectCode: string;
      if (kind === 'objectWithRest' && node.withRest) {
        const rest = generateNodeCode(node.withRest, depth);
        objectCode = `objectWithRest({\n${inner}${'  '.repeat(depth - 1)}},\n${'  '.repeat(depth - 1)}${rest})`;
      } else if (inner === '') {
        objectCode = `${kind}({})`;
      } else {
        objectCode = `${kind}({\n${inner}${'  '.repeat(depth - 1)}})`;
      }

      // If there are non-object constraints, wrap in pipe()
      if (constraints.length > 0) {
        return `pipe(${objectCode}, ${constraints.join(', ')})`;
      }

      return objectCode;
    }
    case 'anyOf':
    case 'oneOf': {
      const inner = node.value
        .map(
          (item) =>
            `${'  '.repeat(depth)}${generateNodeCode(item, depth + 1)},\n`
        )
        .join('');
      return `union([\n${inner}${'  '.repeat(depth - 1)}])`;
    }
    case 'not':
      return `not(\n${'  '.repeat(depth)}${generateNodeCode(node.value, depth + 1)},\n${'  '.repeat(depth - 1)})`;
    case 'contains':
      return `contains(${generateNodeCode(node.value, depth)})`;
    case 'minContains':
      return `minContains(${generateNodeCode(node.value, depth)}, ${node.requirement})`;
    case 'maxContains':
      return `maxContains(${generateNodeCode(node.value, depth)}, ${node.requirement})`;
    case 'propertyNames':
      return `propertyNames(${generateNodeCode(node.value, depth)})`;
    case 'patternProperties': {
      const patterns = node.value
        .map(
          (p) =>
            `{ pattern: /${p.pattern}/, schema: ${generateNodeCode(p.schema, depth)} }`
        )
        .join(', ');
      return `patternProperties([${patterns}])`;
    }
  }
}

/**
 * Generates Valibot schema code from a schema node
 *
 * @param schema - The schema node to generate code from
 *
 * @returns The generated Valibot schema code
 */
export function generateSchemaCode(schema: AnyNode): string {
  return generateNodeCode(schema);
}
