# CommitStudio Documentation

## Introduction

- [Overview](#overview)
- [Key Features](#key-features)
- [How It Works](#how-it-works)

## Getting Started

- [Installation](#installation)
- [Prerequisites](#prerequisites)
- [Authentication](#authentication)
- [Quick Start](#quick-start)

## Usage

- [Standard Mode](#standard-mode)
  - [Options](#standard-mode-options)
  - [Examples](#standard-mode-examples)
- [Configuration Mode](#configuration-mode)
  - [Options](#configuration-options)
  - [Examples](#configuration-examples)
- [YOLO Mode](#yolo-mode)
  - [YOLO Options](#yolo-mode-options)
  - [Examples](#yolo-mode-examples)
  - [Cautions & Requirements](#yolo-mode-cautions--requirements)

## Configuration

- [Environment Variables](#environment-variables)
- [Credentials Management](#credentials-management)
- [Repository Detection](#repository-detection)
- [Caching](#caching)
- [AI Settings](#ai-settings)

## Advanced Usage

- [GitHub OAuth Configuration](#github-oauth-configuration)
- [Using with CI/CD](#using-with-cicd)
- [Filtering Commits](#filtering-commits)
- [Cache Management](#cache-management)
- [Customizing AI Models](#customizing-ai-models)

## Troubleshooting

- [Common Issues](#common-issues)
- [Node.js Deprecation Warnings](#nodejs-deprecation-warnings)
- [GitHub API Rate Limits](#github-api-rate-limits)
- [Git Operation Errors](#git-operation-errors)
- [AI Model Issues](#ai-model-issues)

## Reference

- [Command Line Reference](#command-line-reference)
- [API Reference](#api-reference)
- [Configuration Options](#configuration-options)
- [Supported AI Models](#supported-ai-models)

---

# Introduction

## Overview

CommitStudio is an AI-powered tool that automates code reviews by analyzing git diffs and providing insightful comments on your commits. It integrates with GitHub to post these comments directly on your commits or pull requests, allowing you to receive quality feedback with minimal human intervention.

Additionally, it offers "YOLO mode" which can rewrite your commit messages to make them more descriptive and professional using AI, making your commit history more meaningful and useful.

## Key Features

- **Auto-detect Repository**: Works with local git repositories, automatically connects to GitHub
- **Smart Analysis**: Uses OpenAI's GPT models to analyze git diffs and generate insightful comments
- **GitHub Integration**: Seamlessly post comments to GitHub pull requests
- **YOLO Mode**: Rewrite your commit messages with AI to be more descriptive and professional
- **Caching**: Smart caching to avoid repeated analyses
- **Interactive CLI**: Easy-to-use command line interface with helpful prompts
- **Secure Credentials Management**: Securely handles GitHub and OpenAI API keys
- **Parallel Processing**: Efficiently processes multiple commits at once
- **Flexible Options**: Analyze specific commits, branches, or time periods
- **Customizable AI Settings**: Choose your preferred AI model and adjust token limits

## How It Works

CommitStudio uses a series of steps to provide AI-powered code reviews:

1. **Repository Detection**: The tool detects your git repository and connects to GitHub
2. **Commit Fetching**: It fetches all commits or uses filters you specify
3. **Diff Analysis**: For each commit, it gets the diff using git
4. **AI Processing**: The diff is sent to OpenAI's API for analysis
5. **Result Formatting**: Results are formatted into structured comments
6. **GitHub Integration**: Comments are posted to GitHub using the GitHub API
7. **Caching**: Processed commits are cached to avoid duplication

In YOLO mode, it follows a similar process but instead of posting comments, it rewrites your commit messages to be more descriptive.

---

# Getting Started

## Installation

You can install CommitStudio using npm, pnpm, or run it directly with npx:

```bash
# Install globally with npm
npm install -g commitstudio

# Install globally with pnpm
pnpm add -g commitstudio

# Use directly without installing
npx commitstudio
```

## Prerequisites

Before using CommitStudio, you'll need:

1. **Node.js**: Version 18.0.0 or higher
2. **Git**: Installed and configured on your system
3. **GitHub Repository**: A repository on GitHub that you want to analyze
4. **API Credentials**:
   - A GitHub personal access token with 'repo' scope
   - An OpenAI API key

## Authentication

CommitStudio requires authentication with both GitHub and OpenAI:

### GitHub Authentication

You can provide your GitHub token in one of these ways:

1. **Environment Variable**: Set `GITHUB_TOKEN` in your environment
2. **Prompt**: If not found in the environment, CommitStudio will prompt you for the token
3. **OAuth Flow**: Optionally, you can set up GitHub OAuth for a browser-based authentication flow

CommitStudio will securely store your token locally for future use.

### OpenAI Authentication

You need to provide an OpenAI API key:

1. **Environment Variable**: Set `OPENAI_API_KEY` in your environment
2. **Prompt**: If not found, CommitStudio will prompt you to enter it

## Quick Start

```bash
# Navigate to your git repository
cd your-repository

# Run CommitStudio in standard mode
commitstudio

# Configure AI settings
commitstudio config

# Run in YOLO mode to rewrite commit messages
commitstudio yolo
```

---

# Usage

CommitStudio has three main modes of operation: Standard Mode, Configuration Mode, and YOLO Mode.

## Standard Mode

Standard mode analyzes your commits and posts AI-generated code review comments to GitHub.

```bash
commitstudio [options]
```

### Standard Mode Options

- `-p, --path <path>`: Path to the git repository (default: current directory)
- `-c, --commits <number>`: Number of commits to analyze (default: all)
- `-b, --branch <branch>`: Branch to analyze (default: current branch)
- `--since <date>`: Analyze commits since date (e.g., "2023-01-01")
- `--author <email>`: Filter commits by author email
- `--no-cache`: Ignore cache and reanalyze all commits
- `--dry-run`: Run without posting comments to GitHub
- `--verbose`: Show detailed logs
- `--reset`: Clear all saved settings and credentials

### Standard Mode Examples

```bash
# Analyze all commits in the current repository
commitstudio

# Analyze the last 5 commits
commitstudio --commits 5

# Analyze commits on a specific branch
commitstudio --branch feature/new-feature

# Analyze commits since a specific date
commitstudio --since "2023-01-01"

# Analyze commits by a specific author
commitstudio --author "user@example.com"

# Dry run (analyze but don't post comments)
commitstudio --dry-run

# Clear saved credentials
commitstudio --reset
```

## Configuration Mode

Configuration mode allows you to view and update CommitStudio settings, particularly AI-related settings like the model and token limits.

```bash
commitstudio config [options]
```

### Configuration Options

- `--view`: View current configuration settings
- `--model <model>`: Set AI model to use for analysis
- `--max-tokens <number>`: Set maximum tokens for API requests

### Configuration Examples

```bash
# View current configuration
commitstudio config --view

# Set a specific model
commitstudio config --model gpt-4o

# Set maximum tokens
commitstudio config --max-tokens 3000

# Update multiple settings at once
commitstudio config --model gpt-4.1-mini --max-tokens 2500

# Run interactive configuration
commitstudio config
```

## YOLO Mode

YOLO mode analyzes your commits and rewrites the commit messages to be more descriptive and professional.

```bash
commitstudio yolo [options]
```

> **Important Note:** YOLO mode requires a clean working tree. Commit or stash any changes before running.

### YOLO Mode Options

- `-p, --path <path>`: Path to the git repository (default: current directory)
- `-c, --commits <number>`: Number of commits to analyze (default: last 5)
- `-b, --branch <branch>`: Branch to analyze (default: current branch)
- `--since <date>`: Analyze commits since date
- `--author <email>`: Filter commits by author email
- `--emoji`: Add random emoji to commit messages (default: on)
- `--serious`: Generate more professional commit messages (no emojis)
- `--dry-run`: Preview changes without applying them
- `--verbose`: Show detailed logs

### YOLO Mode Examples

```bash
# Rewrite the last 5 commit messages with emojis
commitstudio yolo

# Rewrite the last 10 commit messages
commitstudio yolo --commits 10

# Rewrite commit messages without emojis
commitstudio yolo --serious

# Preview changes without applying them
commitstudio yolo --dry-run
```

### YOLO Mode Cautions & Requirements

1. **Clean Working Tree**: You must have a clean working tree (no uncommitted changes) before running YOLO mode
2. **History Rewriting**: This mode rewrites git history, which can be disruptive on shared branches
3. **Force Push Required**: After running YOLO mode, you'll need to use `git push --force` to update remote branches
4. **Use with Caution**: Don't use on public/shared branches unless everyone is aware of the changes

---

# Configuration

## Environment Variables

CommitStudio supports the following environment variables:

- `GITHUB_TOKEN`: Your GitHub personal access token
- `OPENAI_API_KEY`: Your OpenAI API key
- `GITHUB_CLIENT_ID`: (Optional) Client ID for GitHub OAuth App
- `OPENAI_MODEL`: (Optional) AI model to use for analysis
- `OPENAI_MAX_TOKENS`: (Optional) Maximum tokens for API requests

Example:

```bash
export GITHUB_TOKEN=your_github_token
export OPENAI_API_KEY=your_openai_api_key
export OPENAI_MODEL=gpt-4o
export OPENAI_MAX_TOKENS=3000
```

## Credentials Management

CommitStudio securely saves your GitHub token and OpenAI API key locally to avoid asking for them each time you run the tool.

### Saved Credentials Location

Your credentials are securely stored in your user directory:

- **macOS**: `~/Library/Preferences/commitstudio-nodejs`
- **Linux**: `~/.config/commitstudio`
- **Windows**: `%APPDATA%\commitstudio-nodejs`

### Resetting Your Configuration

To clear all stored tokens and credentials:

```bash
commitstudio --reset
```

## Repository Detection

CommitStudio automatically detects git repositories and their GitHub remotes:

1. **Current Directory**: By default, it checks the current directory
2. **Specified Path**: You can specify a path with the `--path` option
3. **Remote Detection**: It identifies the GitHub repository from git remotes
4. **Interactive Selection**: If detection fails, it prompts you to select from a list of your repositories
5. **Manual Entry**: You can always manually enter repository information

## Caching

CommitStudio caches processed commits to avoid analyzing and commenting on the same commits multiple times.

- **Cache Location**: Cache files are stored in `~/.commitstudio/cache/`
- **Disable Caching**: Use the `--no-cache` flag to ignore the cache
- **Cache Format**: One cache file per repository (`owner-repo.json`)

## AI Settings

CommitStudio allows you to customize the AI model and token settings:

### Available Models

- **gpt-4o**: Most powerful general model
- **gpt-4.1**: High-performance model with latest capabilities
- **gpt-4.1-mini**: Balanced performance and cost
- **gpt-4.1-nano**: Smaller, faster model
- **o4-mini**: Alternative name for the OpenAI mini variant
- **o3-mini**: Older model version

### Configuring AI Settings

You can configure AI settings using:

1. **Configuration Command**: `commitstudio config`
2. **Environment Variables**: `OPENAI_MODEL` and `OPENAI_MAX_TOKENS`
3. **Direct Parameters**: Pass `--model` and `--max-tokens` options to commands

---

# Advanced Usage

## GitHub OAuth Configuration

For a browser-based authentication flow instead of manually entering a token:

1. Create a GitHub OAuth App at: https://github.com/settings/developers
2. Set the Authorization callback URL to: https://github.com/devices
3. Copy your Client ID and set it as an environment variable:

```bash
export GITHUB_CLIENT_ID=your_client_id
```

## Using with CI/CD

To use CommitStudio in CI/CD pipelines:

1. Set required environment variables in your CI/CD configuration
2. Use the `--no-cache` flag to ensure fresh analysis
3. Consider using the `--dry-run` flag for test runs

Example GitHub Actions workflow:

```yaml
name: CommitStudio Analysis

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm install -g commitstudio
      - name: Run CommitStudio
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          OPENAI_MODEL: gpt-4.1-mini
        run: commitstudio --no-cache
```

## Filtering Commits

CommitStudio offers several ways to filter which commits to analyze:

- **Commit Count**: `--commits <number>` to limit to the most recent N commits
- **Branch Selection**: `--branch <branch-name>` to analyze a specific branch
- **Date Filter**: `--since <date>` to analyze commits after a specific date
- **Author Filter**: `--author <email>` to analyze commits from a specific author

These filters can be combined for more specific selections.

## Cache Management

Advanced cache management techniques:

- **View Cache**: Cache files are stored as JSON and can be viewed manually
- **Clear Cache**: Delete cache files to force reanalysis of all commits
- **Selective Clearing**: Edit cache files to remove specific commit SHAs

## Customizing AI Models

Strategies for optimizing AI model usage:

- **Cost Efficiency**: Use nano or mini models for routine analysis
- **Detailed Analysis**: Use more powerful models for complex code
- **Token Management**: Adjust max tokens based on commit size and complexity
- **Model Selection**: Different models perform better on different languages/frameworks

---

# Troubleshooting

## Common Issues

### Authentication Errors

- **GitHub Token Issues**: Ensure your token has the 'repo' scope
- **Token Expiration**: GitHub tokens may expire; regenerate if needed
- **OpenAI API Key**: Verify the key is valid and has sufficient quota

### Repository Detection Problems

- **Git Not Initialized**: Make sure you're in a git repository
- **No GitHub Remote**: The repository must have a GitHub remote
- **Permission Issues**: Ensure you have access to the repository

### Command Execution Errors

- **Node.js Version**: Ensure you're using Node.js 18.0.0 or higher
- **Git Version**: Make sure git is installed and properly configured
- **Network Issues**: Check your internet connection

## Node.js Deprecation Warnings

If you see DEP0040 punycode deprecation warnings when running CommitStudio, these are from dependencies and don't affect functionality. To suppress them:

```bash
# Use the npm start script (includes the --no-deprecation flag)
npm start

# Or run with the flag directly
node --no-deprecation ./bin/cli.js

# For detailed diagnostics
npm run start:debug
```

## GitHub API Rate Limits

GitHub API has rate limits which may affect CommitStudio:

- **Authenticated Requests**: 5,000 requests per hour
- **Status Check**: CommitStudio will warn you if you're approaching limits
- **Retry Strategy**: The tool implements exponential backoff for rate limit issues

## Git Operation Errors

Common git-related errors and solutions:

- **Unstaged Changes**: For YOLO mode, you must commit or stash changes first
- **Commit Access**: Ensure you have write access to the repository
- **Force Push Issues**: Be cautious when force pushing after using YOLO mode

## AI Model Issues

Common AI-related issues and solutions:

- **Token Limits**: If you're hitting token limits, try reducing max tokens or using a different model
- **Model Availability**: Ensure the selected model is available on your OpenAI plan
- **Rate Limits**: OpenAI has rate limits; spread out large analysis jobs
- **Model Quality**: If analysis quality is poor, try upgrading to a more capable model

---

# Reference

## Command Line Reference

### Global Options

These options are available in both standard and YOLO modes:

```
-p, --path <path>      Path to git repository
-b, --branch <branch>  Branch to analyze
--since <date>         Analyze commits since date
--author <email>       Filter commits by author email
--verbose              Show detailed logs
```

### Standard Mode Options

```
-c, --commits <number> Number of commits to analyze (default: all)
--no-cache             Ignore cache and reanalyze all commits
--dry-run              Run without posting comments to GitHub
--reset                Clear all saved settings and credentials
```

### Configuration Mode Options

```
--view                 View current configuration
--model <model>        Set AI model to use for analysis
--max-tokens <number>  Set maximum tokens for API requests
```

### YOLO Mode Options

```
-c, --commits <number> Number of commits to analyze (default: 5)
--emoji                Add emoji to commit messages (default: true)
--serious              Generate professional messages without emojis
--dry-run              Preview changes without applying them
```

## API Reference

Although CommitStudio is primarily a CLI tool, its modules can be imported and used programmatically:

```javascript
import { run, runYolo } from "commitstudio";

// Standard mode
await run({
  path: "/path/to/repo",
  commits: 10,
  branch: "main",
  dryRun: true,
  openai: {
    model: "gpt-4.1-mini",
    maxTokens: 2000
  }
});

// YOLO mode
await runYolo({
  path: "/path/to/repo",
  commits: 5,
  emoji: true,
  openai: {
    model: "gpt-4.1-mini",
    maxTokens: 2000
  }
});
```

## Configuration Options

### GitHub Configuration

- **Token**: Personal access token with 'repo' scope
- **OAuth**: Alternative to PAT for browser-based auth
- **API Base URL**: Uses api.github.com by default

### OpenAI Configuration

- **Model**: Choose from gpt-4o, gpt-4.1, gpt-4.1-mini, gpt-4.1-nano, o4-mini, o3-mini
- **Max Tokens**: Control the token limit for API requests
- **Temperature**: 0.3 for standard mode, 0.6 for YOLO mode

## Supported AI Models

CommitStudio supports the following OpenAI models:

| Model | Capabilities | Best For | Token Limit |
|-------|--------------|----------|-------------|
| gpt-4o | Most advanced general AI model | Complex, nuanced analysis | Highest |
| gpt-4.1 | High performance, latest features | Deep technical analysis | High |
| gpt-4.1-mini | Balance of performance and cost | Most analysis tasks | Medium |
| gpt-4.1-nano | Efficient, faster processing | Simpler code reviews | Lower |
| o4-mini | Alternative name for mini variant | Standard code review | Medium |
| o3-mini | Older model | Legacy compatibility | Lower |

The default model is gpt-4.1-mini, which offers a good balance of performance and cost.
