# Changelog

All notable changes to CommitStudio will be documented in this file.

## [0.2.3] - 2025-04-24

### Added
- Beautiful CLI interface with boxed messages and colorful banners
- Stylish tables for better data presentation in dry-run mode
- Improved spacing and formatting for better readability

## [0.2.2] - 2025-04-24

### Added
- Improved repository detection with interactive repository selection when auto-detection fails

## [0.2.1] - 2025-04-24

### Changed
- Removed unnecessary console log messages for cleaner output
- Added pnpm installation instructions to README for more installation options

## [0.2.0] - 2025-04-23

### Changed
- Simplified API approach focusing on reliability with Chat Completions API
- Using the powerful GPT-4.1-mini model for more accurate code analysis
- Improved error handling throughout the application

### Fixed
- Resolved issues with API compatibility
- Enhanced error handling for more reliable operation
- Fixed test suite to ensure code quality

## [0.1.9] - 2025-04-23

### Fixed
- Fixed Responses API integration with proper error handling
- Added robust parsing of AI responses to prevent errors
- Improved fallback mechanism to Chat Completions API

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