import { InferOutput, array, literal, number, object, optional, pipe, regex, string } from "valibot";
import { minContains, maxContains } from "to-valibot/client";


export const ContainsConstraintsSchema = object({
  tags: pipe(array(), minContains(pipe(string(), regex(/^tag-/)), 2), maxContains(pipe(string(), regex(/^tag-/)), 5)),
  priorities: optional(pipe(array(), minContains(object({
    level: string(),
    value: optional(number()),
  }), 1))),
  flags: optional(pipe(array(), maxContains(literal("active"), 3))),
});

export type ContainsConstraints = InferOutput<typeof ContainsConstraintsSchema>;
