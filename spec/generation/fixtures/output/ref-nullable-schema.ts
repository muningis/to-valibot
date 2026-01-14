import { InferOutput, null_, object, string, union } from "valibot";


export const AddressSchema = object({
  street: string(),
});

export type Address = InferOutput<typeof AddressSchema>;


export const RefNullableTestSchema = object({
  primaryAddress: AddressSchema,
  secondaryAddress: union([
    AddressSchema,
    null_(),
  ]),
});

export type RefNullableTest = InferOutput<typeof RefNullableTestSchema>;
