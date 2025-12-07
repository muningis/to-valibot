import { InferOutput, boolean, number, object, pipe, string, tupleWithRest } from "valibot";
import { minContains, maxContains } from "to-valibot/client";


export const PrefixItemsContainsSchema = object({
  tupleWithContains: pipe(tupleWithRest([
    string(),
    number(),
  ], boolean()), minContains(boolean(), 1), maxContains(boolean(), 3)),
});

export type PrefixItemsContains = InferOutput<typeof PrefixItemsContainsSchema>;
