import { writeFile } from 'node:fs/promises';
import { ValibotGenerator } from './parser-and-generator.ts';
import { slugify } from './utils/basic.ts';

interface GeneratorOptions {
  outDir: string;
}

type GenerateOptions =
  | { format: 'openapi-json' | 'json'; schema: object }
  | { format: 'openapi-json' | 'json'; schemas: object[] }
  | { format: 'openapi-json' | 'json'; schemas: Record<string, object> }
  | { format: 'openapi-json' | 'json' | 'openapi-yaml'; schema: string }
  | { format: 'openapi-json' | 'json' | 'openapi-yaml'; schemas: string[] }
  | { format: 'openapi-json' | 'json' | 'openapi-yaml'; schemas: Record<string, object> };

interface ValibotGeneratorReturn {
  generate: (opt: GenerateOptions) => Promise<void>;
}
const valibotGenerator = (
  options: GeneratorOptions
): ValibotGeneratorReturn => {
  const generate = async (opt: GenerateOptions): Promise<void> => {
    if ('schemas' in opt && Array.isArray(opt.schemas)) {
      for (const schema in opt.schemas) {
        const schemaCode =
          typeof schema === 'string'
            ? new ValibotGenerator(schema, opt.format)
            : new ValibotGenerator(
                schema,
                opt.format as 'openapi-json' | 'json'
              );

        const code = schemaCode.generate();
        const name = slugify(schemaCode.title);
        console.log(code, name, `${options.outDir}/${name}.ts`);
        await writeFile(`${options.outDir}/${name}.ts`, code);
      }
    } else if ('schemas' in opt && !Array.isArray(opt.schemas)) {
      for (const [key, schema] of Object.entries(opt.schemas)) {
        const schemaCode =
        new ValibotGenerator(
          schema,
          opt.format as 'openapi-json' | 'json'
        )

        const code = schemaCode.generate();
        const name = slugify(key);
        console.log(code, name, `${options.outDir}/${name}.ts`);
        await writeFile(`${options.outDir}/${name}.ts`, code);
      }
    } else if ("schema" in opt) {
      const schemaCode =
        typeof opt.schema === 'string'
          ? new ValibotGenerator(opt.schema, opt.format)
          : new ValibotGenerator(
              opt.schema,
              opt.format as 'openapi-json' | 'json'
            );

      const code = schemaCode.generate();
      const name = slugify(schemaCode.title);
      await writeFile(`${options.outDir}/${name}.ts`, code);
    }
  };

  return { generate };
};

export { valibotGenerator };
