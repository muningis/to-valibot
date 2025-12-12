import { InferOutput, array, boolean, null, number, object, string, union } from "valibot";


export const OptionalAsNullableTestSchema = object({
  requiredField: string(),
  optionalString: union([
    string(),
    null(),
  ]),
  optionalNumber: union([
    number(),
    null(),
  ]),
  optionalBoolean: union([
    boolean(),
    null(),
  ]),
  optionalArray: union([
    array(string()),
    null(),
  ]),
  optionalObject: union([
    object({
      nested: union([
        string(),
        null(),
      ]),
    }),
    null(),
  ]),
});

export type OptionalAsNullableTest = InferOutput<typeof OptionalAsNullableTestSchema>;
