import { InferOutput, literal, null_, object, union } from "valibot";


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
    null_(),
  ]),
});

export type EnumNullableTest = InferOutput<typeof EnumNullableTestSchema>;
