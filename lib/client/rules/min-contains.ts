import {
  type BaseIssue,
  type BaseValidation,
  type GenericSchema,
  safeParse,
} from 'valibot';

interface MinContainsIssue extends BaseIssue<unknown[]> {
  readonly kind: 'validation';
  readonly type: 'min_contains';
  readonly expected: `>=${number}`;
  readonly received: `${number}`;
  readonly requirement: number;
}

type MinContainsAction<
  Schema extends GenericSchema,
  Requirement extends number,
  Message extends string | undefined,
> = BaseValidation<unknown[], unknown[], MinContainsIssue> & {
  readonly type: 'min_contains';
  readonly reference: typeof minContains;
  readonly expects: `>=${number}`;
  readonly schema: Schema;
  readonly requirement: Requirement;
  readonly message: Message | undefined;
};

/**
 * Creates a validation action that checks if an array contains at least a minimum number of items matching a schema
 *
 * @param schema - The schema that items must match
 * @param requirement - The minimum number of matching items required
 * @param message - Optional custom error message
 *
 * @returns A minContains validation action
 */
const minContains = <
  Schema extends GenericSchema,
  Requirement extends number,
  Message extends string | undefined = undefined,
>(
  schema: Schema,
  requirement: Requirement,
  message?: Message
): MinContainsAction<Schema, Requirement, Message> => ({
  kind: 'validation',
  type: 'min_contains',
  reference: minContains,
  expects: `>=${requirement}`,
  schema,
  requirement,
  message,
  async: false,
  '~run'(dataset, _config) {
    const arr = dataset.value as unknown[];
    const matchCount = arr.filter(
      (item: unknown) => safeParse(this.schema, item).success
    ).length;

    if (matchCount >= this.requirement) {
      return dataset;
    }

    dataset.issues?.push({
      kind: 'validation',
      type: 'min_contains',
      expected: `>=${this.requirement}`,
      received: `${matchCount}`,
      input: dataset.value,
      message:
        this.message ??
        `Array must contain at least ${this.requirement} item${this.requirement === 1 ? '' : 's'} matching the schema, but found ${matchCount}`,
      path: undefined,
      issues: undefined,
      requirement: this.requirement,
    });
    return dataset;
  },
});

export { minContains };
export type { MinContainsAction, MinContainsIssue };
