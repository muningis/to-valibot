import { InferOutput, array, intersect, isoDateTime, literal, object, optional, pipe, strictObject, string, union } from "valibot";


export const BaseEntitySchema = object({
  id: string(),
  createdAt: pipe(string(), isoDateTime()),
});

export type BaseEntity = InferOutput<typeof BaseEntitySchema>;


export const EntityDetailsSchema = object({
  name: string(),
  description: optional(string()),
});

export type EntityDetails = InferOutput<typeof EntityDetailsSchema>;


export const AllOfWithPropertiesSchema = object({
  simpleEntity: intersect([
    BaseEntitySchema,
    object({
      details: EntityDetailsSchema,
    }),
  ]),
  extendedEntity: intersect([
    BaseEntitySchema,
    EntityDetailsSchema,
    object({
      status: union([
        literal("active"),
        literal("inactive"),
      ]),
      tags: optional(array(string())),
    }),
  ]),
  strictExtendedEntity: intersect([
    BaseEntitySchema,
    strictObject({
      extra: string(),
    }),
  ]),
});

export type AllOfWithProperties = InferOutput<typeof AllOfWithPropertiesSchema>;
