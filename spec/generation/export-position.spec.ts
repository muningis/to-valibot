import { describe, expect, it } from 'vitest';
import { ValibotGenerator } from '../../lib/generator';
import { getFileContents } from './utils/get-file-contents';

describe('exportPosition option', () => {
  it('should use inline exports by default', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/export-position-schema.json'
    );
    const expectedOutput = await getFileContents(
      'spec/generation/fixtures/output/export-position-inline-schema.ts'
    );

    const parser = new ValibotGenerator(schema, 'json');
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(expectedOutput.split('\n'));
  });

  it('should use inline exports when exportPosition is explicitly inline', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/export-position-schema.json'
    );
    const expectedOutput = await getFileContents(
      'spec/generation/fixtures/output/export-position-inline-schema.ts'
    );

    const parser = new ValibotGenerator(schema, 'json', {
      exportPosition: 'inline',
    });
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(expectedOutput.split('\n'));
  });

  it('should collect exports at end when exportPosition is end', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/export-position-schema.json'
    );
    const expectedOutput = await getFileContents(
      'spec/generation/fixtures/output/export-position-end-schema.ts'
    );

    const parser = new ValibotGenerator(schema, 'json', {
      exportPosition: 'end',
    });
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(expectedOutput.split('\n'));
  });

  it('should collect multiple schema exports at end', async () => {
    const schema = await getFileContents(
      'spec/generation/fixtures/input/export-position-multi-schema.json'
    );
    const expectedOutput = await getFileContents(
      'spec/generation/fixtures/output/export-position-multi-end-schema.ts'
    );

    const parser = new ValibotGenerator(schema, 'json', {
      exportPosition: 'end',
    });
    const parsed = parser.generate();
    expect(parsed.split('\n')).toEqual(expectedOutput.split('\n'));
  });
});
