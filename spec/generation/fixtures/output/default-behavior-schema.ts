import { InferOutput, object, optional, string } from "valibot";


export const DefaultBehaviorTestSchema = object({
  required: string(),
  optional: optional(string()),
});

export type DefaultBehaviorTest = InferOutput<typeof DefaultBehaviorTestSchema>;
