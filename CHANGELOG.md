# Changelog

All notable changes to CommitStudio will be documented in this file.

## [0.1.6] - 2025-04-23

### Added
- New `--reset` flag to clear all saved settings and credentials
- Detailed documentation on credential storage locations
- Improved configuration management with persistent storage

### Fixed
- Fixed credentials persistence issues between application runs
- Improved error handling throughout the application
- Implemented character limit handling for GitHub comments
- Fixed OpenAI API key usage to properly use stored credentials
- Removed confusing warning messages about token usage
- Added automatic truncation of large diffs to prevent OpenAI rate limit errors

### Changed
- Updated authentication workflow for a smoother user experience
- Improved documentation with clearer installation and usage instructions 