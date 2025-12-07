import { InferOutput, object, optional, pipe, regex, string, url } from "valibot";


export const StringFormatsSchema = object({
  durationField: pipe(string(), regex(/^P(?:\d+Y)?(?:\d+M)?(?:\d+W)?(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+(?:\.\d+)?S)?)?$/)),
  hostnameField: pipe(string(), regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/)),
  idnHostnameField: optional(pipe(string(), regex(/^[\w](?:[\w-]{0,61}[\w])?(?:\.[\w](?:[\w-]{0,61}[\w])?)*$/))),
  idnEmailField: optional(pipe(string(), regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))),
  jsonPointerField: optional(pipe(string(), regex(/^(?:\/(?:[^~\/]|~0|~1)*)*$/))),
  relativeJsonPointerField: optional(pipe(string(), regex(/^(?:0|[1-9]\d*)(?:#|(?:\/(?:[^~\/]|~0|~1)*)*)?$/))),
  uriReferenceField: optional(pipe(string(), regex(/^(?:[a-zA-Z][a-zA-Z0-9+.-]*:|[^:\/?#]*(?:[?#]|$))/))),
  uriTemplateField: optional(pipe(string(), regex(/^[^{}]*(?:\{[^{}]+\}[^{}]*)*$/))),
  iriField: optional(pipe(string(), url())),
  iriReferenceField: optional(pipe(string(), regex(/^(?:[a-zA-Z][a-zA-Z0-9+.-]*:|[^:\/?#]*(?:[?#]|$))/))),
});

export type StringFormats = InferOutput<typeof StringFormatsSchema>;
