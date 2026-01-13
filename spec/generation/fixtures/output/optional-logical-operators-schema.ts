import { InferOutput, intersect, literal, number, object, optional, pipe, strictObject, string, union, uuid } from "valibot";
import { not } from "to-valibot/client";


export const OptionalLogicalOperatorsSchema = object({
  id: pipe(string(), uuid()),
  optionalOneOf: optional(union([
    strictObject({
      type: literal("circle"),
      radius: number(),
    }),
    strictObject({
      type: literal("rectangle"),
      width: number(),
      height: number(),
    }),
  ])),
  optionalAnyOf: optional(union([
    string(),
    number(),
  ])),
  optionalAllOf: optional(intersect([
    object({
      name: optional(string()),
    }),
    object({
      age: optional(number()),
    }),
  ])),
  optionalNot: optional(not(
    object({
      forbidden: literal(true),
    }),
  )),
});

export type OptionalLogicalOperators = InferOutput<typeof OptionalLogicalOperatorsSchema>;
