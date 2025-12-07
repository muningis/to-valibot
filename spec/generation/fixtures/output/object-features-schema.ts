import { InferOutput, number, object, optional, pipe, regex, string } from "valibot";
import { propertyNames, patternProperties } from "to-valibot/client";


export const ObjectFeaturesSchema = object({
  metadata: pipe(object({}), propertyNames(pipe(string(), regex(/^[a-z][a-zA-Z0-9]*$/)))),
  config: optional(pipe(object({}), patternProperties([{ pattern: /^str_/, schema: string() }, { pattern: /^num_/, schema: number() }]))),
});

export type ObjectFeatures = InferOutput<typeof ObjectFeaturesSchema>;
