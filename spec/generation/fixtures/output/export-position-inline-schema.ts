import { InferOutput, object, string } from "valibot";


export const UserSchema = object({
  id: string(),
  name: string(),
});

export type User = InferOutput<typeof UserSchema>;
