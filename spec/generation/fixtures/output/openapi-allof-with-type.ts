import { InferOutput, isoDateTime, object, pipe, string } from "valibot";


export const SomeComponentSchema = object({
  name: string(),
  createdAt: pipe(string(), isoDateTime()),
});

export type SomeComponent = InferOutput<typeof SomeComponentSchema>;


export const ExtendedSchema = object({
  ...SomeComponentSchema.entries,
  id: string(),
});

export type Extended = InferOutput<typeof ExtendedSchema>;


export const ExtendedWithSiblingPropsSchema = object({
  ...SomeComponentSchema.entries,
  id: string(),
  extra: string(),
});

export type ExtendedWithSiblingProps = InferOutput<typeof ExtendedWithSiblingPropsSchema>;
