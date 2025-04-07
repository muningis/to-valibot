import {
  custom,
  type CustomSchema,
  type GenericSchema,
  safeParse,
} from 'valibot';

const not = <Schema extends GenericSchema, Message extends string>(
  schema: Schema,
  message?: Message
): CustomSchema<unknown, Message | undefined> =>
  custom((item) => safeParse(schema, item).success === false, message);

export { not };
