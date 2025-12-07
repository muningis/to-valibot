# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`to-valibot` is a TypeScript utility library that converts JSON Schemas and OpenAPI Declarations into Valibot schemas. It supports three input formats: OpenAPI JSON, OpenAPI YAML, and JSON Schema, and generates type-safe Valibot validation schemas with TypeScript type definitions.

## Development Commands

### Building
```bash
pnpm build
```
Uses tsup to build both ESM and CJS formats from `lib/index.ts` and `lib/client/index.ts` to `dist/`.

### Testing
```bash
# Run tests with type checking
pnpm test

# Run tests with coverage
pnpm coverage

# Run a single test file
pnpm test <path-to-test-file>
```
Tests use Vitest and are located in `spec/` and `lib/utils/*.spec.ts`.

### Linting & Formatting
```bash
# Lint and type check
pnpm lint

# Fix linting issues
pnpm lint.fix

# Format code
pnpm format

# Check formatting
pnpm format.check
```

## Code Architecture

### Core Components

**ValibotGenerator (`lib/generator/`)**
The central class responsible for parsing input schemas and generating Valibot code. Key responsibilities:
- Parses OpenAPI and JSON Schema formats into an intermediate representation (`lib/generator/parser.ts`)
- Manages schema references and dependencies between schemas (`lib/generator/valibot-generator.ts`)
- Handles circular references using `lazy()` wrappers
- Tracks Valibot imports needed for the generated code
- Generates both TypeScript types (`lib/generator/type-generator.ts`) and runtime validation schemas (`lib/generator/code-generator.ts`)

**Schema Nodes (`lib/schema-nodes.ts`)**
Defines the intermediate representation (IR) used between parsing and code generation. All schema types (string, number, object, array, unions, etc.) and validation actions (minLength, maxValue, regex, etc.) are represented as typed node objects. This abstraction layer allows the parser to work independently from Valibot's API.

**Entry Point (`lib/index.ts`)**
Provides the public `valibotGenerator()` API that accepts an `outDir` and returns a `generate()` function. The generator handles both single schemas and arrays/records of schemas, automatically writing output files.

### Dependency Management

**Circular Reference Detection (`lib/utils/circular-refs.ts`)**
Identifies two types of circular references:
- Self-referencing schemas (schema depends on itself)
- Mutual circular references (schema A depends on B, B depends on A)

When detected, references are wrapped with Valibot's `lazy()` function and explicit TypeScript type annotations are generated.

**Topological Sorting (`lib/utils/topological-sort.ts`)**
Ensures schemas are output in dependency order - dependencies are always defined before the schemas that reference them. This prevents "used before defined" errors in the generated code.

### Custom Client-Side Rules (`lib/client/`)

Valibot doesn't natively support certain JSON Schema validations, so custom validation functions are provided:
- `uniqueItems` - validates array elements are unique
- `minEntries` / `maxEntries` - validates object property count
- `not` - validates value does NOT match a schema (type inference limitations)
- `contains` / `minContains` / `maxContains` - validates that an array contains items matching a schema
- `propertyNames` - validates that all object keys match a pattern or schema
- `patternProperties` - validates object properties based on regex patterns

These are exported from `to-valibot/client` and imported separately in generated code.

### Code Generation Flow

1. **Parse Input** → Determine format (openapi-json, openapi-yaml, json) and parse accordingly
2. **Build IR** → Convert parsed schema to schema nodes, tracking refs and dependencies
3. **Detect Circularity** → Find circular references and mark nodes for lazy wrapping
4. **Sort Schemas** → Topologically sort schemas by dependencies
5. **Generate Code** → Walk the node tree to produce Valibot code strings and TypeScript types
6. **Emit Imports** → Collect used Valibot functions and custom rules for import statements

### Important Implementation Details

- **Required Properties**: In objects, properties can be required via the schema's `required` array or inherited from parent schemas via `allOf`. The `effectiveRequired` concept merges both.

- **Object Types**: Three variants exist:
  - `object()` - allows additional properties
  - `strictObject()` - disallows additional properties (`additionalProperties: false`)
  - `objectWithRest()` - validates additional properties against a schema

- **Array Types**: Two variants exist:
  - Regular arrays (`array()`) - homogeneous arrays where all items match the same schema
  - Tuples (`tuple()` / `tupleWithRest()`) - heterogeneous arrays with specific types at each position, created from JSON Schema's `prefixItems`

- **TypeScript Configuration**: Uses `isolatedDeclarations: true` which requires explicit return types. The `exactOptionalPropertyTypes: true` flag enforces proper undefined handling.

- **Path Aliases**: `to-valibot/*` is mapped to `./lib/*` in tsconfig.json for internal imports.

## Testing Strategy

Tests are organized in `spec/generation/` by input format:
- `json-schema.spec.ts` - JSON Schema conversion tests
- `openapi-json.spec.ts` - OpenAPI JSON conversion tests
- `openapi-yaml.spec.ts` - OpenAPI YAML conversion tests
- `lazy-schemas.spec.ts` - Circular reference handling tests

Test fixtures are stored in `spec/generation/fixtures/`.

Unit tests for utilities are colocated: `lib/utils/*.spec.ts`

## Common Patterns

### Adding Support for New JSON Schema Features

1. Update type definitions in `lib/types.ts` to include the new JSON Schema property
2. Add a schema node type in `lib/schema-nodes.ts` if needed
3. Implement parsing logic in the appropriate `parse*Type()` method in `lib/generator/parser.ts`
4. Implement code generation in `lib/generator/code-generator.ts` (`generateNodeCode()`) and `lib/generator/type-generator.ts` (`generateNodeType()`)
5. Add the Valibot function name to `usedImports` tracking in `lib/generator/valibot-generator.ts`
6. Add test cases covering the new feature in `spec/generation/`

### Adding Custom Validation Rules

1. Create the validation function in `lib/client/rules/<name>.ts`
2. Export it from `lib/client/index.ts`
3. Add the rule name to the `customRules` array in `lib/generator/valibot-generator.ts`
4. Use it in the appropriate parser method in `lib/generator/parser.ts` via `action<RuleName>()`
5. Handle it in `lib/generator/code-generator.ts` (`generateNodeCode()`) to output the function call
