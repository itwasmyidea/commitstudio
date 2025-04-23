#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { loadConfig } from "../src/config/config.js";
import { run } from "../src/index.js";

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
  .version("0.1.0")
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
  .action(async (options) => {
    try {
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

program.parse(process.argv);
