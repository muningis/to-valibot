import { describe, expect, it } from 'vitest';
import { ValibotGenerator } from '../../lib/generator';
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

  it('should parse JSON Schema with comprehensive properties', async () => {
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

  it('should parse JSON Schema with logical operators (anyOf, allof, oneOf, not)', async () => {
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

  it('should parse JSON Schema with $defs (modern alternative to definitions)', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/defs-schema.json'
    );
    const defsSchemaOutput = await getFileContents(
      'spec/generation/fixtures/output/defs-schema.ts'
    );
    const parser = new ValibotGenerator(schema, 'json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(defsSchemaOutput.split('\n'));
  });

  it('should parse JSON Schema with uri format', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/uri-format-schema.json'
    );
    const uriFormatSchemaOutput = await getFileContents(
      'spec/generation/fixtures/output/uri-format-schema.ts'
    );
    const parser = new ValibotGenerator(schema, 'json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(uriFormatSchemaOutput.split('\n'));
  });

  it('should parse JSON Schema with all string formats', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/string-formats-schema.json'
    );
    const stringFormatsSchemaOutput = await getFileContents(
      'spec/generation/fixtures/output/string-formats-schema.ts'
    );
    const parser = new ValibotGenerator(schema, 'json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(stringFormatsSchemaOutput.split('\n'));
  });

  it('should parse JSON Schema with array contains', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/array-contains-schema.json'
    );
    const arrayContainsSchemaOutput = await getFileContents(
      'spec/generation/fixtures/output/array-contains-schema.ts'
    );
    const parser = new ValibotGenerator(schema, 'json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(arrayContainsSchemaOutput.split('\n'));
  });

  it('should parse JSON Schema with object features (propertyNames, patternProperties)', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/object-features-schema.json'
    );
    const objectFeaturesSchemaOutput = await getFileContents(
      'spec/generation/fixtures/output/object-features-schema.ts'
    );
    const parser = new ValibotGenerator(schema, 'json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(objectFeaturesSchemaOutput.split('\n'));
  });

  it('should parse JSON Schema with contains constraints (minContains, maxContains)', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/contains-constraints-schema.json'
    );
    const containsConstraintsSchemaOutput = await getFileContents(
      'spec/generation/fixtures/output/contains-constraints-schema.ts'
    );
    const parser = new ValibotGenerator(schema, 'json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(containsConstraintsSchemaOutput.split('\n'));
  });

  it('should parse JSON Schema with basic prefixItems (tuple)', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/prefix-items-basic.json'
    );
    const prefixItemsBasicOutput = await getFileContents(
      'spec/generation/fixtures/output/prefix-items-basic.ts'
    );
    const parser = new ValibotGenerator(schema, 'json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(prefixItemsBasicOutput.split('\n'));
  });

  it('should parse JSON Schema with strict prefixItems (items: false)', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/prefix-items-strict.json'
    );
    const prefixItemsStrictOutput = await getFileContents(
      'spec/generation/fixtures/output/prefix-items-strict.ts'
    );
    const parser = new ValibotGenerator(schema, 'json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(prefixItemsStrictOutput.split('\n'));
  });

  it('should parse JSON Schema with prefixItems and rest items (tupleWithRest)', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/prefix-items-rest.json'
    );
    const prefixItemsRestOutput = await getFileContents(
      'spec/generation/fixtures/output/prefix-items-rest.ts'
    );
    const parser = new ValibotGenerator(schema, 'json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(prefixItemsRestOutput.split('\n'));
  });

  it('should parse JSON Schema with prefixItems and validations', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/prefix-items-validations.json'
    );
    const prefixItemsValidationsOutput = await getFileContents(
      'spec/generation/fixtures/output/prefix-items-validations.ts'
    );
    const parser = new ValibotGenerator(schema, 'json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(prefixItemsValidationsOutput.split('\n'));
  });

  it('should parse JSON Schema with prefixItems and contains validations', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/prefix-items-contains.json'
    );
    const prefixItemsContainsOutput = await getFileContents(
      'spec/generation/fixtures/output/prefix-items-contains.ts'
    );
    const parser = new ValibotGenerator(schema, 'json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(prefixItemsContainsOutput.split('\n'));
  });

  it('should parse JSON Schema with empty prefixItems (empty tuple)', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/prefix-items-empty.json'
    );
    const prefixItemsEmptyOutput = await getFileContents(
      'spec/generation/fixtures/output/prefix-items-empty.ts'
    );
    const parser = new ValibotGenerator(schema, 'json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(prefixItemsEmptyOutput.split('\n'));
  });

  it('should parse JSON Schema with nested prefixItems (nested tuples)', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/prefix-items-nested.json'
    );
    const prefixItemsNestedOutput = await getFileContents(
      'spec/generation/fixtures/output/prefix-items-nested.ts'
    );
    const parser = new ValibotGenerator(schema, 'json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(prefixItemsNestedOutput.split('\n'));
  });
});
