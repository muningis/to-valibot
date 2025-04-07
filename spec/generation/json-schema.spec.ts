import { describe, expect, it } from 'vitest';
import { ValibotGenerator } from '../../lib/parser-and-generator';
import { getFileContents } from './utils/get-file-contents';

describe('should generate valibot schemas from JSON Schemas', () => {
  it('should parse JSON Schema without references', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/no-refs-schema.json'
    );
    const noRefsSchemaOutput = await getFileContents(
      'spec/generation/fixtures/output/no-refs-schema.ts'
    );

    const parser = new ValibotGenerator(schema, 'json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(noRefsSchemaOutput.split('\n'));
  });

  it('should parse JSON Schema with references', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/medium-refs-schema.json'
    );
    const mediumRefsSchemaOutput = await getFileContents(
      'spec/generation/fixtures/output/medium-refs-schema.ts'
    );
    const parser = new ValibotGenerator(schema, 'json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(mediumRefsSchemaOutput.split('\n'));
  });

  it('should parse JSON Schema with nested references', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/complex-refs-schema.json'
    );
    const complexRefsSchemaOutput = await getFileContents(
      'spec/generation/fixtures/output/complex-refs-schema.ts'
    );
    const parser = new ValibotGenerator(schema, 'json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(complexRefsSchemaOutput.split('\n'));
  });

  it.skip('should parse JSON Schema with comprehensive properties', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/comprehensive-schema.json'
    );
    const complexRefsSchemaOutput = await getFileContents(
      'spec/generation/fixtures/output/comprehensive-schema.ts'
    );
    const parser = new ValibotGenerator(schema, 'json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(complexRefsSchemaOutput.split('\n'));
  });

  it.skip('should parse JSON Schema with logical operators (anyOf, allof, oneOf, not)', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/logical-operators-schema.json'
    );
    const complexRefsSchemaOutput = await getFileContents(
      'spec/generation/fixtures/output/logical-operators-schema.ts'
    );
    const parser = new ValibotGenerator(schema, 'json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(complexRefsSchemaOutput.split('\n'));
  });
});
