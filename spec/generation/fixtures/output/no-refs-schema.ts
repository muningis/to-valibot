import { InferOutput, array, boolean, description, email, integer, maxLength, maxValue, minLength, minValue, number, object, optional, pipe, string } from "valibot";
import { uniqueItems } from "to-valibot/client";


export const NoRefsSchema = pipe(object({
  name: pipe(string(), minLength(2), maxLength(50), description("Name of a person")),
  age: pipe(number(), integer(), minValue(0), maxValue(150), description("Age of a person")),
  email: pipe(string(), email(), description("Email address of a person")),
  isActive: optional(pipe(boolean(), description("Indicates if user is currently active"))),
  tags: optional(pipe(array(string()), maxLength(5), uniqueItems(), description("Tags by which user can be found"))),
}), description("Schema without any references defining a person"));

export type NoRefs = InferOutput<typeof NoRefsSchema>;
