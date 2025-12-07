import { InferOutput, description, object, optional, pipe, string, url } from "valibot";


export const UriFormatTestSchema = object({
  website: pipe(string(), url()),
  homepage: optional(pipe(string(), url(), description("User homepage URL"))),
});

export type UriFormatTest = InferOutput<typeof UriFormatTestSchema>;
