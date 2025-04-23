# Changelog

All notable changes to CommitStudio will be documented in this file.

## [0.1.8] - 2025-04-23

### Added
- Support for OpenAI's new Responses API and GPT-4.1 model
- Web search capability for more informed code reviews
- Automatic fallback to Chat Completions API if needed

### Improved
- Enhanced code analysis with access to online programming resources
- More detailed and contextual code review suggestions
- Higher token limits for longer responses

## [0.1.7] - 2025-04-23

### Fixed
- Fixed credentials persistence issues between application runs
- Improved error handling throughout the application
- Implemented character limit handling for GitHub comments
- Fixed OpenAI API key usage to properly use stored credentials
- Removed confusing warning messages about token usage
- Added automatic truncation of large diffs to prevent OpenAI rate limit errors

### Added
- New `--reset` flag to clear all saved settings and credentials
- Detailed documentation on credential storage locations
- Improved configuration management with persistent storage

### Changed
- Updated authentication workflow for a smoother user experience
- Improved documentation with clearer installation and usage instructions

## [0.1.6] - 2025-04-22

Initial public release 