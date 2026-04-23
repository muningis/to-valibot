import { InferOutput, null_, object, optional, string, union } from "valibot";


export const UserSchema = object({
  id: string(),
  reason: optional(union([
    string(),
    null_(),
  ])),
});

export type User = InferOutput<typeof UserSchema>;
