# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2025-12-30

### Added

- **Extended Orchestrator Protocol**: Now includes 6 states covering all 7 agents:
    - State 0: Product Definition (PRD)
    - State 1: New Request (Architect)
    - State 1.5: Planning Required (Tech-Lead) ⭐ NEW
    - State 2: Implementation (Developer)
    - State 3: Review (Reviewer)
    - State 4: Documentation (Documenter) ⭐ NEW
    - State 5: Bug Detected (Debugger) ⭐ NEW

- **3 New CLI Commands**:
    - `enokmethod plan` - Analyze CURRENT_SPEC.md and show planning status
    - `enokmethod debug <issue>` - Create a bug fix specification
    - `enokmethod docs` - Show documentation status and suggestions

- **3 New Cursor Templates**:
    - `tech-lead.mdc` - Implementation planning
    - `documenter.mdc` - Documentation generation
    - `debugger.mdc` - Systematic bug fixing

- **PRD Integration in Specs**:
    - Added Section 5 "PRD Alignment" to SPEC.md template
    - Links specs to related PRD sections and user journeys

### Fixed

- Corrected path in `developer.md` (was `.enokMethod/CURRENT_SPEC.md`, now `CURRENT_SPEC.md`)
- Version now read dynamically from `package.json` instead of hardcoded

### Changed

- Updated `enokmethod.mdc` with all 6 agent roles
- SPEC.md now has 6 sections (added PRD Alignment)
- README updated: 14 CLI commands, 80 tests

### Documentation

- Created `IMPROVEMENT_PROPOSALS.md` with detailed analysis and improvement plan
- All P0, P1, P2, P3 improvements completed

## [1.3.0] - 2025-12-29

### Added

- **3 New Agent Prompts** (Phase 3.3):
    - Reviewer: Code review with comprehensive checklist
    - Documenter: Technical documentation specialist
    - Debugger: Systematic debugging with common patterns
- **2 New IDE Adapters** (Phase 4.1, 4.2):
    - Windsurf support (`.windsurfrules`)
    - Aider support (`.aider.conf.yml`)
- **Git Integration** (Phase 4.3):
    - `enokmethod commit` command for conventional commit messages
    - Auto-generate commit messages from CURRENT_SPEC.md

### Changed

- Updated `init` command to support `--adapter windsurf` and `--adapter aider`
- Updated improvement plan with completed tasks

### Documentation

- 3 new agent prompt files with detailed workflows

## [1.2.0] - 2025-12-29

### Added

- **Complete CI/CD with GitHub Actions**:
    - Automated tests on Node.js 18, 20, 22
    - Automatic npm publication on tag
    - CodeQL security analysis
    - PR quality checks
    - Dependabot for dependency updates
- **GitHub Templates**:
    - Pull Request template with checklist
    - Bug report template (YAML form)
    - Feature request template (YAML form)
    - Issue configuration
- **Documentation**:
    - Publishing guide (PUBLISHING.md)
    - Phase 5.2 summary document
- **Badges**: GitHub Actions workflow badges in README

### Changed

- Updated README with CI/CD badges
- Updated improvement plan with completed tasks

### Infrastructure

- 4 GitHub Actions workflows
- 4 GitHub templates
- Dependabot configuration
- Codecov integration ready

## [1.1.0] - 2025-12-29

### Added

- **5 new utility commands** for improved developer experience:
    - `enokmethod status` - Display current project status with active spec, recent activity, and stats
    - `enokmethod list` - List archived specifications with search and limit options
    - `enokmethod context` - Display CONTEXT.md content
    - `enokmethod memory` - Display MEMORY.md content
    - `enokmethod validate` - Validate EnokMethod structure and CONTEXT.md sections
- 20 comprehensive tests for new commands
- Phase 2.1 summary document

### Changed

- Updated improvement plan with completed tasks marked
- Enhanced CLI output with colors and emoji icons

### Tests

- All 49 tests passing (15 detector + 14 CLI + 20 commands)

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
