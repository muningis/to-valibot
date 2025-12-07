import {
  type BaseIssue,
  type BaseValidation,
  type GenericSchema,
  safeParse,
} from 'valibot';

interface ContainsIssue extends BaseIssue<unknown[]> {
  readonly kind: 'validation';
  readonly type: 'contains';
  readonly expected: 'valid';
  readonly received: 'invalid';
}

type ContainsAction<
  Schema extends GenericSchema,
  Message extends string | undefined,
> = BaseValidation<unknown[], unknown[], ContainsIssue> & {
  readonly type: 'contains';
  readonly reference: typeof contains;
  readonly expects: 'valid';
  readonly schema: Schema;
  readonly message: Message | undefined;
};

const contains = <
  Schema extends GenericSchema,
  Message extends string | undefined = undefined,
>(
  schema: Schema,
  message?: Message
): ContainsAction<Schema, Message> => ({
  kind: 'validation',
  type: 'contains',
  reference: contains,
  expects: 'valid',
  schema,
  message,
  async: false,
  '~run'(dataset, _config) {
    const arr = dataset.value as unknown[];
    if (arr.some((item: unknown) => safeParse(this.schema, item).success)) {
      return dataset;
    }
    dataset.issues?.push({
      kind: 'validation',
      type: 'contains',
      expected: 'valid',
      received: 'invalid',
      input: dataset.value,
      message:
        this.message ??
        `Array must contain at least one item matching the schema`,
      path: undefined,
      issues: undefined,
      requirement: undefined,
    });
    return dataset;
  },
});

export { contains };
export type { ContainsAction, ContainsIssue };
