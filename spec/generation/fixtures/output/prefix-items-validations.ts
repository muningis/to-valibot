import { InferOutput, maxLength, minLength, number, object, pipe, string, tupleWithRest } from "valibot";


export const PrefixItemsValidationsSchema = object({
  tuple: pipe(tupleWithRest([
    string(),
    number(),
  ], string()), minLength(2), maxLength(4)),
});

export type PrefixItemsValidations = InferOutput<typeof PrefixItemsValidationsSchema>;
