import { CustomSchema, GenericSchema, custom, safeParse } from "valibot";

const not = <Schema extends GenericSchema, Message extends string>(
  schema: Schema,
  message?: Message
): CustomSchema<any, Message | undefined> =>
  custom((item) => safeParse(schema, item).success === false, message);

export { not }