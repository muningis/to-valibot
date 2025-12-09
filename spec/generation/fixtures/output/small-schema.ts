import { InferOutput, array, boolean, description, email, integer, isoDateTime, literal, maxLength, maxValue, minLength, minValue, number, object, optional, pipe, strictObject, string, union, uuid } from "valibot";


export const UserSchema = object({
  /** Unique identifier for the user */
  id: pipe(string(), uuid(), description("Unique identifier for the user")),
  /** Full name of the user */
  name: pipe(string(), minLength(2), maxLength(100), description("Full name of the user")),
  /** User's email address */
  email: pipe(string(), email(), description("User's email address")),
  /** User's age in years */
  age: optional(pipe(number(), integer(), minValue(0), maxValue(150), description("User's age in years"))),
  /** Whether the user account is active */
  isActive: optional(pipe(boolean(), description("Whether the user account is active")), true),
  preferences: optional(object({
    theme: optional(union([
      literal("light"),
      literal("dark"),
      literal("system"),
    ]), "system"),
    notifications: optional(boolean(), true),
  })),
  /** User's associated tags */
  tags: optional(pipe(array(string()), maxLength(10), description("User's associated tags"))),
  /** When the user was created */
  createdAt: optional(pipe(string(), isoDateTime(), description("When the user was created"))),
  /** Additional user metadata */
  metadata: optional(pipe(object({}), description("Additional user metadata"))),
});

export type User = InferOutput<typeof UserSchema>;


export const ErrorSchema = strictObject({
  /** Error code */
  code: pipe(string(), description("Error code")),
  /** Error message */
  message: pipe(string(), description("Error message")),
  /** Additional error details */
  details: optional(pipe(object({}), description("Additional error details"))),
});

export type Error = InferOutput<typeof ErrorSchema>;
