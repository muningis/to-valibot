
import { describe, it, expect } from 'bun:test';
import { ValibotGenerator } from '../lib';

describe('should generate valibot schemas from self referencing and circular schemas', () => {
  it('should parse JSON Schema with circular references', async () => {
    const schema = await Bun.file('spec/fixtures/input/circular-refs-schema.json').text();
    const noRefsSchemaOutput = await Bun.file('spec/fixtures/output/circular-refs-schema.ts').text();

    const parser = new ValibotGenerator(schema, 'json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(noRefsSchemaOutput.split('\n'));
  });

  it('should parse self referencing JSON Schema', async () => {
    const schema = await Bun.file('spec/fixtures/input/self-ref-schema.json').text();
    const mediumRefsSchemaOutput = await Bun.file('spec/fixtures/output/self-ref-schema.ts').text();
    const parser = new ValibotGenerator(schema, 'json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(mediumRefsSchemaOutput.split('\n'));
  });
});