import { InferOutput, isoDateTime, object, optional, pipe, string } from "valibot";


export const BaseEntitySchema = object({
  id: string(),
  createdAt: pipe(string(), isoDateTime()),
});

export type BaseEntity = InferOutput<typeof BaseEntitySchema>;


export const ExtendedEntitySchema = object({
  ...BaseEntitySchema.entries,
  name: string(),
  description: optional(string()),
});

export type ExtendedEntity = InferOutput<typeof ExtendedEntitySchema>;


export const DefinitionsWithAllOfSchema = object({
  entity: ExtendedEntitySchema,
});

export type DefinitionsWithAllOf = InferOutput<typeof DefinitionsWithAllOfSchema>;
