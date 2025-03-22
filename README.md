# (WIP) to-valibot

Schemas, definitions and more converter to [valibot](https://valibot.dev/) schemas.

## Unsupported features (TODO list)
- Description Field
- anyOf / allOf / oneOf / not
- Discriminated union member of array
- Tuples (prefixItems)

## Usage

```ts
import { valibotGenerator } from "@valibot/to-valibot";

const generate = valibotGenerator({
  outDir: "./src/types",
});

const schemas = []; // Fetch, Import, Read from file system - however you like

for (schema of schemas) {
  generate({
    format: 'openapi-yaml',
    schema,
  });
}
```