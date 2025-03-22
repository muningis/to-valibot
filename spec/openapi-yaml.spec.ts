import { describe, expect, it } from 'bun:test';
import { ValibotGenerator } from '../lib/parser-and-generator';

describe('should generate valibot schemas from OpenAPI yaml declaration file', () => {
  it('should parse small declaration file', async () => {
    const schema = await Bun.file(
      'spec/fixtures/input/small-schema.yaml'
    ).text();
    const smallSchema = await Bun.file(
      'spec/fixtures/output/small-schema.ts'
    ).text();
    const parser = new ValibotGenerator(schema, 'openapi-yaml');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(smallSchema.split('\n'));
  });

  it('should parse complicated declaration file', async () => {
    const schema = await Bun.file(
      'spec/fixtures/input/complicated-schema.yaml'
    ).text();
    const complexSchema = await Bun.file(
      'spec/fixtures/output/complicated-schema.ts'
    ).text();
    const parser = new ValibotGenerator(schema, 'openapi-yaml');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(complexSchema.split('\n'));
  });
});
