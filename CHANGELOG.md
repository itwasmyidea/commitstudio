# Changelog

All notable changes to CommitStudio will be documented in this file.

## [0.3.6] - 2025-04-27

### Added

- Multiple AI provider support:
  - Added OpenRouter as an alternative AI provider
  - Free tier support with Llama 4 Maverick model (no API key required)
  - Extended configuration UI to select providers
  - Provider-specific model selection

### Changed

- Migrated to Vercel AI SDK for unified provider handling
- Updated configuration to store provider preferences
- Enhanced documentation with provider setup guides

### Improved

- Comprehensive documentation update with detailed AI model configuration options
- Enhanced documentation for all commands and settings
- Added detailed troubleshooting guidance for AI model-related issues
- Fixed punycode deprecation warnings using a maintained replacement module
- Improved API key saving for both OpenAI and OpenRouter

## [0.3.5] - 2025-04-23

### Fixed

- Fixed ESM compatibility issue with Enquirer import
- Resolved module import errors when running in Node.js v22+ environments

### Improved

## [0.3.4] - 2025-04-23

### Added

- New configuration command (`commitstudio config`) to view and update settings
- Added ability to customize AI model for analysis
- Added ability to set custom max tokens for API requests
- Supported models include: gpt-4o, gpt-4.1, gpt-4.1-mini, gpt-4.1-nano, o4-mini, o3-mini

### Improved

- Updated configuration persistence for AI settings
- Configuration settings now apply to both standard and YOLO modes

## [0.3.3] - 2025-04-23

### Changed

- Updated npm package metadata with new repository URL
- Published under itwasmyidea organization namespace

## [0.3.2] - 2025-04-23

### Changed

- Transferred repository from aligeramy to itwasmyidea organization
- Updated repository URLs and references throughout the codebase

### Fixed

- Updated OpenAI package dependency from version 5.8.0 (which doesn't exist) to 4.28.0
- Fixed version consistency between package.json and CLI file
- Added hero image to README for better visual representation

## [0.3.1] - 2025-04-24

### Fixed

- YOLO mode now properly checks for unstaged changes before attempting to modify commit messages
- Improved error handling in git operations when modifying commit history
- Better escaping of special characters in generated commit messages
- Added clear documentation about clean working tree requirement for YOLO mode

## [0.3.0] - 2025-04-24

### Added

- YOLO mode for rewriting commit messages with AI (`npx commitstudio yolo`)
- Options for controlling YOLO mode, including:
  - `--emoji` - Add emojis to commit messages (default: on)
  - `--serious` - Generate professional messages without emojis
  - `--dry-run` - Preview changes without applying them
- Interactive confirmation before applying commit message changes
- Pagination for repository selection with large numbers of repos

## [0.2.5] - 2025-04-24

### Improved

- Enhanced repository selection with pagination (15 repos per page)
- Simplified repository list by removing descriptions
- Added page navigation when user has many repositories

## [0.2.4] - 2025-04-24

### Changed

- Removed large ASCII art banner for a cleaner interface
- Kept other UI improvements like boxed messages and tables

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

## Release Process

The release process for CommitStudio involves the following steps:

1. **Code Review**: Ensure all changes are thoroughly reviewed by the development team.
2. **Testing**: Run comprehensive tests to verify the stability and functionality of the new release.
3. **Documentation**: Update the changelog and any relevant documentation.
4. **Deployment**: Deploy the new release to the production environment.
5. **Notification**: Notify users of the new release via email or in-app notifications.
