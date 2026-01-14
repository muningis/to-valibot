import { InferOutput, object, string } from "valibot";


export const BaseEntitySchema = object({
  id: string(),
});

export type BaseEntity = InferOutput<typeof BaseEntitySchema>;


export const RootAllOfWithPropertiesSchema = object({
  ...BaseEntitySchema.entries,
  name: string(),
});

export type RootAllOfWithProperties = InferOutput<typeof RootAllOfWithPropertiesSchema>;
