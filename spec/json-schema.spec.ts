import { describe, it, expect } from 'bun:test';
import { ValibotGenerator } from '../lib';

describe('should generate valibot schemas from JSON Schemas', () => {
  it('should parse JSON Schema without references', async () => {
    const schema = await Bun.file('spec/fixtures/input/no-refs-schema.json').text();
    const noRefsSchemaOutput = await Bun.file('spec/fixtures/output/no-refs-schema.ts').text();

    const parser = new ValibotGenerator(schema, 'json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(noRefsSchemaOutput.split('\n'));
  });

  it('should parse JSON Schema with references', async () => {
    const schema = await Bun.file('spec/fixtures/input/medium-refs-schema.json').text();
    const mediumRefsSchemaOutput = await Bun.file('spec/fixtures/output/medium-refs-schema.ts').text();
    const parser = new ValibotGenerator(schema, 'json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(mediumRefsSchemaOutput.split('\n'));
  });

  it.only('should parse JSON Schema with nested references', async () => {
    const schema = await Bun.file('spec/fixtures/input/complex-refs-schema.json').text();
    const complexRefsSchemaOutput = await Bun.file('spec/fixtures/output/complex-refs-schema.ts').text();
    const parser = new ValibotGenerator(schema, 'json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(complexRefsSchemaOutput.split('\n'));
  });
});