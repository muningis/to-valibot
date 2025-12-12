import { InferOutput, literal, null, object, union } from "valibot";


export const EnumNullableTestSchema = object({
  requiredStatus: union([
    literal("active"),
    literal("inactive"),
  ]),
  optionalStatus: union([
    union([
      literal("pending"),
      literal("complete"),
    ]),
    null(),
  ]),
});

export type EnumNullableTest = InferOutput<typeof EnumNullableTestSchema>;
