# Changelog

All notable changes to this project will be documented in this file.

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
