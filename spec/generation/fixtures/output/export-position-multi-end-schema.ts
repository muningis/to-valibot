import { InferOutput, object, string } from "valibot";


const AddressSchema = object({
  street: string(),
  city: string(),
});

type Address = InferOutput<typeof AddressSchema>;


const UserSchema = object({
  id: string(),
  address: AddressSchema,
});

type User = InferOutput<typeof UserSchema>;

export type { Address, User };
export { AddressSchema, UserSchema };
