import { InferOutput, intersect, isoDateTime, literal, minLength, minValue, number, object, pipe, strictObject, string, union } from "valibot";
import { not } from "to-valibot/client";


export const LogicalOperatorsSchema = object({
  anyOfExample: union([
    pipe(string(), minLength(5)),
    pipe(number(), minValue(10)),
    object({
      code: string(),
    }),
  ]),
  allOfExample: intersect([
    object({
      id: string(),
    }),
    object({
      name: string(),
    }),
    object({
      age: pipe(number(), minValue(0)),
    }),
  ]),
  oneOfExample: union([
    strictObject({
      type: literal("circle"),
      radius: pipe(number(), minValue(0)),
    }),
    strictObject({
      type: literal("rectangle"),
      width: pipe(number(), minValue(0)),
      height: pipe(number(), minValue(0)),
    }),
  ]),
  notExample: not(
    object({
      forbidden: string(),
      status: literal("inactive"),
    }),
  ),
  combinedExample: object({
    value: union([
      string(),
      number(),
    ]),
    metadata: intersect([
      object({
        created: pipe(string(), isoDateTime()),
      }),
      not(
        object({
          deleted: literal(true),
        }),
      ),
    ]),
  }),
});

export type LogicalOperators = InferOutput<typeof LogicalOperatorsSchema>;
