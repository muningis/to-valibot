import { describe, expect, it } from 'vitest';
import { ValibotGenerator } from '../../lib/generator';
import { getFileContents } from './utils/get-file-contents';

describe('optionalAsNullable option', () => {
  it('should convert optional fields to union with null when optionalAsNullable is true', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/optional-as-nullable-schema.json'
    );
    const expectedOutput = await getFileContents(
      'spec/generation/fixtures/output/optional-as-nullable-schema.ts'
    );

    const parser = new ValibotGenerator(schema, 'json', {
      optionalAsNullable: true,
    });
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(expectedOutput.split('\n'));
  });

  it('should use optional() by default when optionalAsNullable is not provided', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/default-behavior-schema.json'
    );
    const expectedOutput = await getFileContents(
      'spec/generation/fixtures/output/default-behavior-schema.ts'
    );

    const parser = new ValibotGenerator(schema, 'json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(expectedOutput.split('\n'));
  });

  it('should use optional() when optionalAsNullable is explicitly false', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/default-behavior-schema.json'
    );
    const expectedOutput = await getFileContents(
      'spec/generation/fixtures/output/default-behavior-schema.ts'
    );

    const parser = new ValibotGenerator(schema, 'json', {
      optionalAsNullable: false,
    });
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(expectedOutput.split('\n'));
  });

  it('should handle optional references with optionalAsNullable', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/ref-nullable-schema.json'
    );
    const expectedOutput = await getFileContents(
      'spec/generation/fixtures/output/ref-nullable-schema.ts'
    );

    const parser = new ValibotGenerator(schema, 'json', {
      optionalAsNullable: true,
    });
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(expectedOutput.split('\n'));
  });

  it('should handle optional enums with optionalAsNullable', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/enum-nullable-schema.json'
    );
    const expectedOutput = await getFileContents(
      'spec/generation/fixtures/output/enum-nullable-schema.ts'
    );

    const parser = new ValibotGenerator(schema, 'json', {
      optionalAsNullable: true,
    });
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(expectedOutput.split('\n'));
  });
});
