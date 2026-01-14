import { InferOutput, object, string } from "valibot";


export const BaseEntitySchema = object({
  id: string(),
});

export type BaseEntity = InferOutput<typeof BaseEntitySchema>;


export const NamedEntitySchema = object({
  name: string(),
});

export type NamedEntity = InferOutput<typeof NamedEntitySchema>;


export const RootAllOfOnlySchema = object({
  ...BaseEntitySchema.entries,
  ...NamedEntitySchema.entries,
});

export type RootAllOfOnly = InferOutput<typeof RootAllOfOnlySchema>;
