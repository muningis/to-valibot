import { describe, expect, it } from 'vitest';
import { ValibotGenerator } from '../../lib/generator';
import { getFileContents } from './utils/get-file-contents';

describe('should generate valibot schemas from OpenAPI json declaration file', () => {
  it('should parse small declaration file', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/small-schema.json'
    );
    const smallSchema = await getFileContents(
      'spec/generation/fixtures/output/small-schema.ts'
    );
    const parser = new ValibotGenerator(schema, 'openapi-json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(smallSchema.split('\n'));
  });

  it('should parse complicated declaration file', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/complicated-schema.json'
    );
    const complexSchema = await getFileContents(
      'spec/generation/fixtures/output/complicated-schema.ts'
    );
    const parser = new ValibotGenerator(schema, 'openapi-json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(complexSchema.split('\n'));
  });

  it('should handle allOf with type: "object" at same level', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/openapi-allof-with-type.json'
    );
    const expectedOutput = await getFileContents(
      'spec/generation/fixtures/output/openapi-allof-with-type.ts'
    );
    const parser = new ValibotGenerator(schema, 'openapi-json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(expectedOutput.split('\n'));
  });

  it('should parse OpenAPI 3.1 schema using type: ["string", "null"] for nullable fields', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/openapi-31-nullable.json'
    );
    const expectedOutput = await getFileContents(
      'spec/generation/fixtures/output/openapi-31-nullable.ts'
    );
    const parser = new ValibotGenerator(schema, 'openapi-json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(expectedOutput.split('\n'));
  });

  it('should treat schemas with discriminator and properties but no explicit type as objects', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/openapi-discriminator-base.json'
    );
    const expectedOutput = await getFileContents(
      'spec/generation/fixtures/output/openapi-discriminator-base.ts'
    );
    const parser = new ValibotGenerator(schema, 'openapi-json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(expectedOutput.split('\n'));
  });
});
