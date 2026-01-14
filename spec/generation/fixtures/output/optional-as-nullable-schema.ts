import { InferOutput, array, boolean, null_, number, object, string, union } from "valibot";


export const OptionalAsNullableTestSchema = object({
  requiredField: string(),
  optionalString: union([
    string(),
    null_(),
  ]),
  optionalNumber: union([
    number(),
    null_(),
  ]),
  optionalBoolean: union([
    boolean(),
    null_(),
  ]),
  optionalArray: union([
    array(string()),
    null_(),
  ]),
  optionalObject: union([
    object({
      nested: union([
        string(),
        null_(),
      ]),
    }),
    null_(),
  ]),
});

export type OptionalAsNullableTest = InferOutput<typeof OptionalAsNullableTestSchema>;
