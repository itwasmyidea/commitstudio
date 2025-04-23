# CommitStudio

[![npm version](https://img.shields.io/npm/v/commitstudio.svg?style=flat-square)](https://www.npmjs.com/package/commitstudio)
[![npm downloads](https://img.shields.io/npm/dm/commitstudio.svg?style=flat-square)](https://www.npmjs.com/package/commitstudio)

An AI-powered tool that automatically analyzes git diffs and posts insightful comments to your GitHub commits.

CommitStudio provides code review comments on your commits with minimal human intervention by leveraging OpenAI's capabilities to analyze code changes. It identifies potential issues, bugs, and best practices, all while providing constructive feedback.

## Features

- **Auto-detect Repository**: Works with local git repositories, automatically connects to GitHub
- **Smart Analysis**: Uses OpenAI's latest GPT-4.1 model to analyze commit diffs with deep understanding of code
- **Web Search Support**: Leverages internet access to provide more contextual and informed code reviews
- **GitHub Integration**: Posts AI-generated comments directly to commits
- **Caching**: Remembers processed commits to avoid duplicate comments
- **Interactive CLI**: Easy-to-use command line interface with helpful prompts
- **Secure Credentials Management**: Securely handles GitHub and OpenAI API keys
- **Parallel Processing**: Efficiently processes multiple commits at once

## Installation

```bash
# Install globally
npm install -g commitstudio

# Or use with npx
npx commitstudio
```

## Prerequisites

Before using CommitStudio, you'll need:

1. A GitHub personal access token with 'repo' scope
2. An OpenAI API key

You can set these as environment variables:

```bash
export GITHUB_TOKEN=your_github_token
export OPENAI_API_KEY=your_openai_api_key
```

Or you'll be prompted to enter them when you run the tool.

### GitHub OAuth App (Optional)

If you'd like to use the browser authentication flow instead of manually entering a token:

1. Create a GitHub OAuth App at: https://github.com/settings/developers
2. Set the Authorization callback URL to: https://github.com/devices
3. Copy your Client ID and set it as an environment variable:

```bash
export GITHUB_CLIENT_ID=your_client_id
```

## Usage

Navigate to your git repository and run:

```bash
commitstudio
```

This will:

1. Detect your GitHub repository
2. Fetch all commits
3. Analyze the diffs with OpenAI
4. Post comments to GitHub

### Command Options

```bash
# Analyze specific number of commits
commitstudio --commits 5

# Analyze a specific branch
commitstudio --branch feature/my-feature

# Analyze commits since a specific date
commitstudio --since "2023-01-01"

# Analyze commits by a specific author
commitstudio --author "user@example.com"

# Dry run (analyze but don't post comments)
commitstudio --dry-run

# Ignore cache and reanalyze all commits
commitstudio --no-cache

# Specify repository path
commitstudio --path /path/to/repo

# Show detailed logs
commitstudio --verbose

# Clear all saved settings and credentials
commitstudio --reset
```

## Managing Your Configuration

CommitStudio securely saves your GitHub token and OpenAI API key to avoid asking for them each time you run the tool. 

### Saved Credentials Location

Your credentials are securely stored in your user directory:
- **macOS**: `~/Library/Preferences/commitstudio-nodejs`
- **Linux**: `~/.config/commitstudio`
- **Windows**: `%APPDATA%\commitstudio-nodejs`

### Resetting Your Configuration

If you need to clear your saved settings:

```bash
# Use the reset flag
commitstudio --reset
```

This will clear all stored tokens and credentials, allowing you to start fresh next time you run the tool.

## Environment Variables

- `GITHUB_TOKEN`: Your GitHub personal access token
- `OPENAI_API_KEY`: Your OpenAI API key
- `GITHUB_CLIENT_ID`: (Optional) Client ID for GitHub OAuth App to enable browser authentication

## Example Output

```
✓ Repository detected: my-awesome-project
✓ Found 7 commits to analyze (3 already processed)
✓ Analyzing diffs with AI...
  ↪ Analyzing commit 1/4: Add user authentication
  ↪ Analyzing commit 2/4: Fix pagination bug
  ↪ Analyzing commit 3/4: Implement search feature
  ↪ Analyzing commit 4/4: Update dependencies
✓ Posting comments to GitHub...
  ↪ Posted comment on commit a1b2c3d
  ↪ Posted comment on commit e4f5g6h
  ↪ Posted comment on commit i7j8k9l
  ↪ Posted comment on commit m0n1o2p
✓ CommitStudio completed successfully!
```

## Troubleshooting

### Node.js Deprecation Warnings

If you see DEP0040 punycode deprecation warnings when running CommitStudio, these are from dependencies and don't affect functionality. To suppress these warnings, you can:

```bash
# Use the npm start script (includes the --no-deprecation flag)
npm start

# Or run with the flag directly
node --no-deprecation ./bin/cli.js

# For detailed diagnostics 
npm run start:debug
```

## How It Works

1. CommitStudio detects your git repository and connects to GitHub
2. It fetches all commits or uses filters you specify
3. For each commit, it gets the diff using git
4. The diff is sent to OpenAI's API for analysis
5. Results are formatted into structured comments
6. Comments are posted to GitHub using the GitHub API
7. Processed commits are cached to avoid duplication

## License

MIT

npm start # commitstudio
