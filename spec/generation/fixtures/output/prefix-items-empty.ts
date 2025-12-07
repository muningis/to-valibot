import { InferOutput, object, tuple } from "valibot";


export const PrefixItemsEmptySchema = object({
  emptyTuple: tuple([

  ]),
});

export type PrefixItemsEmpty = InferOutput<typeof PrefixItemsEmptySchema>;
