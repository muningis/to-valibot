import { InferOutput, array, minValue, number, object, optional, pipe, regex, string } from "valibot";
import { contains } from "to-valibot/client";


export const ArrayContainsSchema = object({
  tags: pipe(array(string()), contains(pipe(string(), regex(/^important/)))),
  numbers: optional(pipe(array(number()), contains(pipe(number(), minValue(10))))),
});

export type ArrayContains = InferOutput<typeof ArrayContainsSchema>;
