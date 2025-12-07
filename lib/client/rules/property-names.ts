import {
  type BaseIssue,
  type BaseValidation,
  type GenericSchema,
  safeParse,
} from 'valibot';

interface PropertyNamesIssue extends BaseIssue<Record<string, unknown>> {
  readonly kind: 'validation';
  readonly type: 'property_names';
  readonly expected: 'valid';
  readonly received: 'invalid';
}

type PropertyNamesAction<
  Schema extends GenericSchema,
  Message extends string | undefined,
> = BaseValidation<
  Record<string, unknown>,
  Record<string, unknown>,
  PropertyNamesIssue
> & {
  readonly type: 'property_names';
  readonly reference: typeof propertyNames;
  readonly expects: 'valid';
  readonly schema: Schema;
  readonly message: Message | undefined;
};

const propertyNames = <
  Schema extends GenericSchema,
  Message extends string | undefined = undefined,
>(
  schema: Schema,
  message?: Message
): PropertyNamesAction<Schema, Message> => ({
  kind: 'validation',
  type: 'property_names',
  reference: propertyNames,
  expects: 'valid',
  schema,
  message,
  async: false,
  '~run'(dataset, _config) {
    const obj = dataset.value as Record<string, unknown>;
    const keys = Object.keys(obj);
    const invalidKeys = keys.filter(
      (key) => !safeParse(this.schema, key).success
    );

    if (invalidKeys.length === 0) {
      return dataset;
    }

    dataset.issues?.push({
      kind: 'validation',
      type: 'property_names',
      expected: 'valid',
      received: 'invalid',
      input: dataset.value,
      message:
        this.message ??
        `Invalid property names: ${invalidKeys.join(', ')}`,
      path: undefined,
      issues: undefined,
      requirement: undefined,
    });
    return dataset;
  },
});

export { propertyNames };
export type { PropertyNamesAction, PropertyNamesIssue };
