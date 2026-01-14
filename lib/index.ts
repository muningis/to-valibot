import { writeFile } from 'node:fs/promises';
import { ValibotGenerator } from './generator/index.ts';
import { slugify } from './utils/basic.ts';

interface GeneratorOptions {
  outDir: string;
  /**
   * When true, non-required fields will be converted to `union([schema, null()])`
   * instead of `optional(schema)`.
   *
   * @default false
   */
  optionalAsNullable?: boolean;
  /**
   * Controls where export declarations are placed in the generated code.
   * - `'inline'`: Exports are placed inline with declarations (e.g., `export const SchemaName = ...`)
   * - `'end'`: Exports are collected at the end of the file (e.g., `export { SchemaName }; export type { TypeName }`)
   *
   * @default 'inline'
   */
  exportPosition?: 'inline' | 'end';
  /**
   * Optional code to inject at the beginning of the generated output.
   * Useful for adding license headers, eslint-disable comments, or other preambles.
   */
  headerBanner?: string;
}

type GenerateOptions =
  | { format: 'openapi-json' | 'json'; schema: object }
  | { format: 'openapi-json' | 'json'; schemas: object[] }
  | { format: 'openapi-json' | 'json'; schemas: Record<string, object> }
  | { format: 'openapi-json' | 'json' | 'openapi-yaml'; schema: string }
  | { format: 'openapi-json' | 'json' | 'openapi-yaml'; schemas: string[] }
  | {
      format: 'openapi-json' | 'json' | 'openapi-yaml';
      schemas: Record<string, object>;
    };

interface ValibotGeneratorReturn {
  generate: (opt: GenerateOptions) => Promise<void>;
}
const valibotGenerator = (
  options: GeneratorOptions
): ValibotGeneratorReturn => {
  const generate = async (opt: GenerateOptions): Promise<void> => {
    const generatorOptions = {
      optionalAsNullable: options.optionalAsNullable ?? false,
      exportPosition: options.exportPosition ?? 'inline',
      headerBanner: options.headerBanner,
    };

    if ('schemas' in opt && Array.isArray(opt.schemas)) {
      for (const schema of opt.schemas) {
        const schemaCode =
          typeof schema === 'string'
            ? new ValibotGenerator(schema, opt.format, generatorOptions)
            : new ValibotGenerator(
                schema,
                opt.format as 'openapi-json' | 'json',
                generatorOptions
              );

        const code = schemaCode.generate();
        const name = slugify(schemaCode.title);
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- Path is constructed from validated user input (outDir) and sanitized schema name
        await writeFile(`${options.outDir}/${name}.ts`, code);
      }
    } else if ('schemas' in opt && !Array.isArray(opt.schemas)) {
      for (const [key, schema] of Object.entries(opt.schemas)) {
        const schemaCode = new ValibotGenerator(
          schema,
          opt.format as 'openapi-json' | 'json',
          generatorOptions
        );

        const code = schemaCode.generate();
        const name = slugify(key);
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- Path is constructed from validated user input (outDir) and sanitized schema name
        await writeFile(`${options.outDir}/${name}.ts`, code);
      }
    } else if ('schema' in opt) {
      const schemaCode =
        typeof opt.schema === 'string'
          ? new ValibotGenerator(opt.schema, opt.format, generatorOptions)
          : new ValibotGenerator(
              opt.schema,
              opt.format as 'openapi-json' | 'json',
              generatorOptions
            );

      const code = schemaCode.generate();
      const name = slugify(schemaCode.title);
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- Path is constructed from validated user input (outDir) and sanitized schema name
      await writeFile(`${options.outDir}/${name}.ts`, code);
    }
  };

  return { generate };
};

export { valibotGenerator };
