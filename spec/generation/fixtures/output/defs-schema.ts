import { InferOutput, object, optional, string } from "valibot";


export const AddressSchema = object({
  street: string(),
  city: string(),
});

export type Address = InferOutput<typeof AddressSchema>;


export const DefsTestSchema = object({
  homeAddress: AddressSchema,
  workAddress: optional(AddressSchema),
});

export type DefsTest = InferOutput<typeof DefsTestSchema>;
