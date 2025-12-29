# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-12-29

### Added

-   **5 new utility commands** for improved developer experience:
    -   `enokmethod status` - Display current project status with active spec, recent activity, and stats
    -   `enokmethod list` - List archived specifications with search and limit options
    -   `enokmethod context` - Display CONTEXT.md content
    -   `enokmethod memory` - Display MEMORY.md content
    -   `enokmethod validate` - Validate EnokMethod structure and CONTEXT.md sections
-   20 comprehensive tests for new commands
-   Phase 2.1 summary document

### Changed

-   Updated improvement plan with completed tasks marked
-   Enhanced CLI output with colors and emoji icons

### Tests

-   All 49 tests passing (15 detector + 14 CLI + 20 commands)

## [1.0.0] - 2025-12-29

### Added

- Initial release of EnokMethod
- Core CLI with `init`, `spec`, and `done` commands
- Auto-detection of tech stack (JS/TS, Python, Go, Java)
- Multi-adapter support (Cursor, Claude, Gemini, Copilot, General)
- Template system (CONTEXT.md, MEMORY.md, SPEC.md)
- Agent prompts (Architect, Tech-Lead, Developer)
- Comprehensive test suite with Vitest
- ESLint and Prettier configuration
- MIT License

### Documentation

- README with installation and usage guides
- PRD (Product Requirements Document)
- Improvement plan (AMELIORATION_PLAN.md)

[1.0.0]: https://github.com/tky0065/enokMethode/releases/tag/v1.0.0
