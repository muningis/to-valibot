import { InferOutput, array, boolean, ipv4, ipv6, isoDate, isoDateTime, isoTime, literal, maxEntries, minEntries, object, objectWithRest, optional, pipe, regex, string, union, url } from "valibot";
import { contains } from "to-valibot/client";


export const ComprehensiveSchema = object({
  simpleAdditionalProps: objectWithRest({
    name: optional(string()),
  },
  string()),
  complexAdditionalProps: objectWithRest({
    id: optional(string()),
  },
  object({
    type: optional(union([
      literal("user"),
      literal("admin"),
      literal("guest"),
    ])),
    permissions: optional(array(string())),
    metadata: optional(object({
      created: optional(pipe(string(), isoDateTime())),
    })),
  })),
  limitedProperties: pipe(objectWithRest({}, string()), minEntries(2), maxEntries(5)),
  constantValue: literal("fixed-value-123"),
  formatStrings: object({
    dateStr: optional(pipe(string(), isoDate())),
    timeStr: optional(pipe(string(), isoTime())),
    durationStr: optional(pipe(string(), regex(/^P(?:\d+Y)?(?:\d+M)?(?:\d+W)?(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+(?:\.\d+)?S)?)?$/))),
    idnEmail: optional(pipe(string(), regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))),
    hostname: optional(pipe(string(), regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/))),
    idnHostname: optional(pipe(string(), regex(/^[\w](?:[\w-]{0,61}[\w])?(?:\.[\w](?:[\w-]{0,61}[\w])?)*$/))),
    ipv4: optional(pipe(string(), ipv4())),
    ipv6: optional(pipe(string(), ipv6())),
    jsonPointer: optional(pipe(string(), regex(/^(?:\/(?:[^~\/]|~0|~1)*)*$/))),
    relativeJsonPointer: optional(pipe(string(), regex(/^(?:0|[1-9]\d*)(?:#|(?:\/(?:[^~\/]|~0|~1)*)*)?$/))),
    uri: optional(pipe(string(), url())),
    uriReference: optional(pipe(string(), regex(/^(?:[a-zA-Z][a-zA-Z0-9+.-]*:|[^:\/?#]*(?:[?#]|$))/))),
    uriTemplate: optional(pipe(string(), regex(/^[^{}]*(?:\{[^{}]+\}[^{}]*)*$/))),
    iri: optional(pipe(string(), url())),
    iriReference: optional(pipe(string(), regex(/^(?:[a-zA-Z][a-zA-Z0-9+.-]*:|[^:\/?#]*(?:[?#]|$))/))),
  }),
  containsArray: pipe(array(), contains(object({
    id: optional(string()),
    required: optional(boolean()),
  }))),
});

export type Comprehensive = InferOutput<typeof ComprehensiveSchema>;
