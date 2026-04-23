import { InferOutput, integer, null_, number, object, optional, pipe, string, union } from "valibot";


export const MultiTypeTestSchema = object({
  nullableString: union([
    string(),
    null_(),
  ]),
  optionalNullableString: optional(union([
    string(),
    null_(),
  ])),
  stringOrNumber: union([
    string(),
    number(),
  ]),
  integerOrNull: union([
    pipe(number(), integer()),
    null_(),
  ]),
  nullOnly: null_(),
});

export type MultiTypeTest = InferOutput<typeof MultiTypeTestSchema>;
