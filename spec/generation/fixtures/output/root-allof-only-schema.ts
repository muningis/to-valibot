import { InferOutput, intersect, object, string } from "valibot";


export const BaseEntitySchema = object({
  id: string(),
});

export type BaseEntity = InferOutput<typeof BaseEntitySchema>;


export const NamedEntitySchema = object({
  name: string(),
});

export type NamedEntity = InferOutput<typeof NamedEntitySchema>;


export const RootAllOfOnlySchema = intersect([
  BaseEntitySchema,
  NamedEntitySchema,
]);

export type RootAllOfOnly = InferOutput<typeof RootAllOfOnlySchema>;
