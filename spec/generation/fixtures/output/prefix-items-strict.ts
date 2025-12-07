import { InferOutput, number, object, string, tuple } from "valibot";


export const PrefixItemsStrictSchema = object({
  pair: tuple([
    string(),
    number(),
  ]),
});

export type PrefixItemsStrict = InferOutput<typeof PrefixItemsStrictSchema>;
