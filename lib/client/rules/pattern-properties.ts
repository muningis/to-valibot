import {
  type BaseIssue,
  type BaseValidation,
  type GenericSchema,
  safeParse,
} from 'valibot';

interface PatternPropertiesIssue extends BaseIssue<Record<string, unknown>> {
  readonly kind: 'validation';
  readonly type: 'pattern_properties';
  readonly expected: 'valid';
  readonly received: 'invalid';
}

type PatternPropertiesAction<Message extends string | undefined> =
  BaseValidation<
    Record<string, unknown>,
    Record<string, unknown>,
    PatternPropertiesIssue
  > & {
    readonly type: 'pattern_properties';
    readonly reference: typeof patternProperties;
    readonly expects: 'valid';
    readonly patterns: { pattern: RegExp; schema: GenericSchema }[];
    readonly message: Message | undefined;
  };

const patternProperties = <Message extends string | undefined = undefined>(
  patterns: { pattern: RegExp; schema: GenericSchema }[],
  message?: Message
): PatternPropertiesAction<Message> => ({
  kind: 'validation',
  type: 'pattern_properties',
  reference: patternProperties,
  expects: 'valid',
  patterns,
  message,
  async: false,
  '~run'(dataset, _config) {
    const errors: string[] = [];
    const obj = dataset.value as Record<string, unknown>;

    for (const [key, value] of Object.entries(obj)) {
      for (const { pattern, schema } of this.patterns) {
        if (pattern.test(key)) {
          const result = safeParse(schema, value);
          if (!result.success) {
            errors.push(
              `Property "${key}" does not match schema for pattern ${pattern}`
            );
          }
        }
      }
    }

    if (errors.length === 0) {
      return dataset;
    }

    dataset.issues?.push({
      kind: 'validation',
      type: 'pattern_properties',
      expected: 'valid',
      received: 'invalid',
      input: dataset.value,
      message: this.message ?? errors.join('; '),
      path: undefined,
      issues: undefined,
      requirement: undefined,
    });
    return dataset;
  },
});

export { patternProperties };
export type { PatternPropertiesAction, PatternPropertiesIssue };
