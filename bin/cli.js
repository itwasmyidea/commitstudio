#!/usr/bin/env node

// Note: This CLI might show DEP0040 punycode deprecation warnings due to dependencies.
// To suppress these warnings, run with the --no-deprecation flag:
// node --no-deprecation ./bin/cli.js
// or use the npm start script which includes this flag.

import { Command } from "commander";
import chalk from "chalk";
import { loadConfig, clearConfig, saveConfig, getConfig } from "../src/config/config.js";
import { run } from "../src/index.js";
import { runYolo } from "../src/yolo/index.js";
import enquirer from "enquirer";
import { AVAILABLE_AI_MODELS, DEFAULT_SETTINGS } from "../src/config/constants.js";

// Get prompt method from enquirer
const { prompt } = enquirer;

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
  .version("0.3.4")
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
      console.log(
        chalk.green("✓ All settings and credentials have been cleared."),
      );
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

// Add 'config' command for AI model and token settings
program
  .command("config")
  .description("View or update configuration settings")
  .option("--view", "View current configuration")
  .option("--model <model>", "Set AI model to use for analysis")
  .option("--max-tokens <number>", "Set maximum tokens for API requests")
  .action(async (options) => {
    try {
      // Load current configuration
      await loadConfig();
      
      // If viewing config only
      if (options.view) {
        displayCurrentConfig();
        return;
      }
      
      // If model or max tokens specified directly in command
      if (options.model || options.maxTokens) {
        const config = {
          openai: {}
        };
        
        if (options.model) {
          config.openai.model = options.model;
        }
        
        if (options.maxTokens) {
          config.openai.maxTokens = parseInt(options.maxTokens, 10);
        }
        
        saveConfig(config);
        console.log(chalk.green("✓ Configuration updated successfully."));
        displayCurrentConfig();
        return;
      }
      
      // Interactive configuration
      await configureInteractively();
      
    } catch (error) {
      console.error(chalk.red("Configuration error:"), error.message);
      process.exit(1);
    }
  });

// Add 'yolo' command to modify commit messages
program
  .command("yolo")
  .description(
    "Analyze git diffs and modify commit messages with AI-generated ones (requires clean working tree)",
  )
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
        emoji: options.serious ? false : options.emoji,
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

/**
 * Display current configuration
 */
function displayCurrentConfig() {
  const config = getConfig();
  
  console.log(chalk.bold("\nCurrent Configuration:"));
  console.log(chalk.cyan("AI Model:"), config.openai.model);
  console.log(chalk.cyan("Max Tokens:"), config.openai.maxTokens);
  console.log(chalk.cyan("Cache Enabled:"), config.cacheEnabled ? "Yes" : "No");
  console.log(chalk.cyan("GitHub Token:"), config.github.token ? "Set" : "Not set");
  console.log(chalk.cyan("OpenAI API Key:"), config.openai.apiKey ? "Set" : "Not set");
  console.log("");
}

/**
 * Interactive configuration
 */
async function configureInteractively() {
  const config = getConfig();
  
  console.log(chalk.bold("\nConfigure CommitStudio AI Settings"));
  
  // Select AI model
  const { model } = await prompt({
    type: "select",
    name: "model",
    message: "Select the AI model to use for analysis:",
    choices: AVAILABLE_AI_MODELS,
    initial: AVAILABLE_AI_MODELS.indexOf(config.openai.model) !== -1 
      ? AVAILABLE_AI_MODELS.indexOf(config.openai.model) 
      : 2, // Default to gpt-4.1-mini if current model not in list
  });
  
  // Set max tokens
  const { maxTokens } = await prompt({
    type: "input",
    name: "maxTokens",
    message: "Maximum tokens for API requests:",
    initial: config.openai.maxTokens.toString(),
    validate: (value) => {
      const parsed = parseInt(value, 10);
      if (isNaN(parsed) || parsed < 100) {
        return "Please enter a number greater than or equal to 100";
      }
      return true;
    },
  });
  
  // Save the configuration
  saveConfig({
    openai: {
      model,
      maxTokens: parseInt(maxTokens, 10),
    },
  });
  
  console.log(chalk.green("\n✓ Configuration updated successfully."));
  displayCurrentConfig();
}

program.parse(process.argv);
