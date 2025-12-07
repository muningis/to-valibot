import { InferOutput, boolean, number, object, string, tuple } from "valibot";


export const PrefixItemsNestedSchema = object({
  nestedTuple: tuple([
    string(),
    tuple([
      number(),
      boolean(),
    ]),
  ]),
});

export type PrefixItemsNested = InferOutput<typeof PrefixItemsNestedSchema>;
