import { InferOutput, number, object, tuple } from "valibot";


export const PrefixItemsBasicSchema = object({
  coordinate: tuple([
    number(),
    number(),
  ]),
});

export type PrefixItemsBasic = InferOutput<typeof PrefixItemsBasicSchema>;
