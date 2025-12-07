import {
  type BaseIssue,
  type BaseValidation,
  type GenericSchema,
  safeParse,
} from 'valibot';

interface MaxContainsIssue extends BaseIssue<unknown[]> {
  readonly kind: 'validation';
  readonly type: 'max_contains';
  readonly expected: `<=${number}`;
  readonly received: `${number}`;
  readonly requirement: number;
}

type MaxContainsAction<
  Schema extends GenericSchema,
  Requirement extends number,
  Message extends string | undefined,
> = BaseValidation<unknown[], unknown[], MaxContainsIssue> & {
  readonly type: 'max_contains';
  readonly reference: typeof maxContains;
  readonly expects: `<=${number}`;
  readonly schema: Schema;
  readonly requirement: Requirement;
  readonly message: Message | undefined;
};

/**
 * Creates a validation action that checks if an array contains at most a maximum number of items matching a schema
 *
 * @param schema - The schema that items must match
 * @param requirement - The maximum number of matching items allowed
 * @param message - Optional custom error message
 *
 * @returns A maxContains validation action
 */
const maxContains = <
  Schema extends GenericSchema,
  Requirement extends number,
  Message extends string | undefined = undefined,
>(
  schema: Schema,
  requirement: Requirement,
  message?: Message
): MaxContainsAction<Schema, Requirement, Message> => ({
  kind: 'validation',
  type: 'max_contains',
  reference: maxContains,
  expects: `<=${requirement}`,
  schema,
  requirement,
  message,
  async: false,
  '~run'(dataset, _config) {
    const arr = dataset.value as unknown[];
    const matchCount = arr.filter((item: unknown) =>
      safeParse(this.schema, item).success
    ).length;

    if (matchCount <= this.requirement) {
      return dataset;
    }

    dataset.issues?.push({
      kind: 'validation',
      type: 'max_contains',
      expected: `<=${this.requirement}`,
      received: `${matchCount}`,
      input: dataset.value,
      message:
        this.message ??
        `Array must contain at most ${this.requirement} item${this.requirement === 1 ? '' : 's'} matching the schema, but found ${matchCount}`,
      path: undefined,
      issues: undefined,
      requirement: this.requirement,
    });
    return dataset;
  },
});

export { maxContains };
export type { MaxContainsAction, MaxContainsIssue };
