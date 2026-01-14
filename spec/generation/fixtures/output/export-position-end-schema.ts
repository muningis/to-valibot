import { InferOutput, object, string } from "valibot";


const UserSchema = object({
  id: string(),
  name: string(),
});

type User = InferOutput<typeof UserSchema>;

export type { User };
export { UserSchema };
