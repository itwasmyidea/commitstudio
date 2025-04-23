#!/usr/bin/env node

// Note: This CLI might show DEP0040 punycode deprecation warnings due to dependencies.
// To suppress these warnings, run with the --no-deprecation flag:
// node --no-deprecation ./bin/cli.js
// or use the npm start script which includes this flag.

import { Command } from "commander";
import chalk from "chalk";
import { loadConfig, clearConfig } from "../src/config/config.js";
import { run } from "../src/index.js";
import { runYolo } from "../src/yolo/index.js";

// Ensure unhandled errors don't crash the process without feedback
process.on("unhandledRejection", (err) => {
  console.error(chalk.red("Unhandled error:"), err);
  process.exit(1);
});

const program = new Command();

program
  .name("commitstudio")
  .description(
    "AI-powered tool that analyzes git diffs and posts comments to GitHub",
  )
  .version("0.3.0")
  .option(
    "-p, --path <path>",
    "Path to git repository (defaults to current directory)",
  )
  .option(
    "-c, --commits <number>",
    "Number of commits to analyze (defaults to all)",
  )
  .option(
    "-b, --branch <branch>",
    "Branch to analyze (defaults to current branch)",
  )
  .option("--since <date>", 'Analyze commits since date (e.g., "2023-01-01")')
  .option("--author <email>", "Filter commits by author email")
  .option("--no-cache", "Ignore cache and reanalyze all commits")
  .option("--dry-run", "Run analysis but don't post comments to GitHub")
  .option("--verbose", "Show detailed logs")
  .option("--reset", "Clear all saved settings and credentials");

// Default command (analyze and comment)
program.action(async (options) => {
  try {
    // Handle reset flag
    if (options.reset) {
      clearConfig();
      console.log(chalk.green("✓ All settings and credentials have been cleared."));
      return;
    }
    
    // Load configuration from environment and config files
    const config = await loadConfig();

    // Run the main workflow with options
    await run({ ...config, ...options });
  } catch (error) {
    console.error(chalk.red("Error:"), error.message);
    if (options.verbose && error.stack) {
      console.error(chalk.dim(error.stack));
    }
    process.exit(1);
  }
});

// Add 'yolo' command to modify commit messages
program
  .command('yolo')
  .description('Analyze git diffs and modify commit messages with AI-generated ones')
  .option(
    "-p, --path <path>",
    "Path to git repository (defaults to current directory)",
  )
  .option(
    "-c, --commits <number>",
    "Number of commits to analyze (defaults to last 5)",
  )
  .option(
    "-b, --branch <branch>",
    "Branch to analyze (defaults to current branch)",
  )
  .option("--since <date>", 'Analyze commits since date (e.g., "2023-01-01")')
  .option("--author <email>", "Filter commits by author email")
  .option("--no-cache", "Ignore cache and reanalyze all commits")
  .option("--dry-run", "Show what would be changed without modifying commits")
  .option("--verbose", "Show detailed logs")
  .option("--emoji", "Add random emoji to commit messages", true)
  .option("--serious", "Generate more professional commit messages (no emojis)")
  .action(async (options) => {
    try {
      // Load configuration from environment and config files
      const config = await loadConfig();
      
      // Set sensible defaults for YOLO mode
      const yoloOptions = {
        ...config,
        ...options,
        commits: options.commits || 5, // Default to last 5 commits
        emoji: options.serious ? false : options.emoji
      };

      // Run the YOLO workflow
      await runYolo(yoloOptions);
    } catch (error) {
      console.error(chalk.red("Error in YOLO mode:"), error.message);
      if (options.verbose && error.stack) {
        console.error(chalk.dim(error.stack));
      }
      process.exit(1);
    }
  });

program.parse(process.argv);
