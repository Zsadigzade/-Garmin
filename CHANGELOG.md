# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-06-26

### Added

- Initial MCP server exposing 6 Garmin Connect tools
- Email/password authentication with session persistence (`.garmin/session.json`)
- SQLite caching layer with configurable TTL per resource type
- CLI commands: `start`, `auth`, `cache clear`, `status`
- Unit and integration tests using Node test runner
- README, QUICKSTART, and example prompts

### Notes

- Uses unofficial `garmin-connect` npm package (Windows/macOS/Linux compatible)
- MFA is not yet supported by the underlying library
