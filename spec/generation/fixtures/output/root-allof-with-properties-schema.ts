import { InferOutput, intersect, object, string } from "valibot";


export const BaseEntitySchema = object({
  id: string(),
});

export type BaseEntity = InferOutput<typeof BaseEntitySchema>;


export const RootAllOfWithPropertiesSchema = intersect([
  BaseEntitySchema,
  object({
    name: string(),
  }),
]);

export type RootAllOfWithProperties = InferOutput<typeof RootAllOfWithPropertiesSchema>;
