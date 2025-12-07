import { InferOutput, boolean, number, object, string, tupleWithRest } from "valibot";


export const PrefixItemsRestSchema = object({
  mixedList: tupleWithRest([
    string(),
    number(),
  ], boolean()),
});

export type PrefixItemsRest = InferOutput<typeof PrefixItemsRestSchema>;
