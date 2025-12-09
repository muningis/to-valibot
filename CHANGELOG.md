# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2025-12-09

### Added

- **JSDoc comments for schema descriptions** ([#4](https://github.com/muningis/to-valibot/pull/4)) - Generated Valibot schemas now include JSDoc comments when the source JSON Schema has a `description` field. This improves IDE support and documentation for generated code.

### Fixed

- **Handle `allOf` with sibling properties** ([#3](https://github.com/muningis/to-valibot/pull/3)) - Fixed parsing of JSON Schema `allOf` constructs that include sibling properties alongside the `allOf` array. Previously, properties defined at the same level as `allOf` were ignored.

## [1.0.0] - 2025-12-09

- Initial stable release
