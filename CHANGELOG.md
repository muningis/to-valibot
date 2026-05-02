# Changelog

All notable changes to this project will be documented in this file.

## [1.6.1] - 2026-05-02

### Fixed

- **Parse schemas with properties but no explicit type as objects** ([#26](https://github.com/muningis/to-valibot/pull/26)) - OpenAPI base schemas that use `discriminator` typically declare `properties` and `required` without an explicit `type: "object"`. Previously, the parser threw `Error: Unsupported schema` for these inputs. The parser now treats any schema carrying object-only fields (`properties`, `additionalProperties`, `patternProperties`, `propertyNames`, `minProperties`, `maxProperties`) as an object when no other construct (`$ref`, `const`, `allOf`, `type`, `oneOf`, `anyOf`, `not`) matches.

## [1.6.0] - 2026-04-23

### Added

- **Array-of-types syntax (`type: ["string", "null"]`)** ([#22](https://github.com/muningis/to-valibot/issues/22)) - Added support for JSON Schema Draft 6+'s array-of-types syntax, commonly emitted by OpenAPI 3.1 generators (springdoc, FastAPI, NestJS) to express nullable fields in place of the removed `nullable: true` keyword. Array types are lowered to a `union([...])` of each branch, so `type: ["string", "null"]` becomes `union([string(), null_()])`. Single-element arrays collapse to the lone branch. Previously, any occurrence of array-of-types would abort the whole run with `Error: Unsupported type`.

## [1.5.0] - 2025-01-14

### Changed

- **Use object merging instead of `intersect()` for `allOf` schemas** ([#18](https://github.com/muningis/to-valibot/pull/18)) - Refactored `allOf` schema generation to merge object properties directly instead of using Valibot's `intersect()`. This produces cleaner, more readable generated code and better aligns with how most `allOf` schemas are used in practice.

## [1.4.0] - 2025-01-14

### Added

- **`headerBanner` option** ([#15](https://github.com/muningis/to-valibot/pull/15)) - New option to inject custom code at the beginning of generated output files. Useful for adding license headers, comments, or custom imports.

- **`exportPosition` option** ([#16](https://github.com/muningis/to-valibot/pull/16)) - New option to control where export declarations appear in generated code. Allows choosing between inline exports or grouped exports at the end of the file.

## [1.3.0] - 2025-01-13

### Fixed

- **Handle `allOf` with `type: "object"` at same level** ([#13](https://github.com/muningis/to-valibot/pull/13)) - Fixed parsing of OpenAPI schemas where `allOf` appears alongside `type: "object"` at the same level. Previously, the `allOf` was ignored when `type: "object"` was present as a sibling property.

## [1.2.0] - 2025-01-13

### Added

- **`optionalAsNullable` option** ([#7](https://github.com/muningis/to-valibot/pull/7)) - New option to convert non-required fields to nullable unions (`union([schema, null()])`) instead of using `optional()`. Useful for APIs that represent missing values as `null`.

### Fixed

- **Optional wrapping for logical operators** ([#10](https://github.com/muningis/to-valibot/pull/10)) - Fixed optional wrapping for `oneOf`, `anyOf`, `allOf`, and `not` schemas. Previously, these logical operators were not properly wrapped with `optional()` when they were non-required properties.

- **Support `allOf` at root level** ([#11](https://github.com/muningis/to-valibot/pull/11)) - Fixed parsing of JSON Schema with `allOf` at the root level alongside sibling properties. Previously, root-level `allOf` was ignored and only sibling properties were processed.

## [1.1.0] - 2025-12-09

### Added

- **JSDoc comments for schema descriptions** ([#4](https://github.com/muningis/to-valibot/pull/4)) - Generated Valibot schemas now include JSDoc comments when the source JSON Schema has a `description` field. This improves IDE support and documentation for generated code.

### Fixed

- **Handle `allOf` with sibling properties** ([#3](https://github.com/muningis/to-valibot/pull/3)) - Fixed parsing of JSON Schema `allOf` constructs that include sibling properties alongside the `allOf` array. Previously, properties defined at the same level as `allOf` were ignored.

## [1.0.0] - 2025-12-09

- Initial stable release
