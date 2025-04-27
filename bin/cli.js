#!/usr/bin/env node

// Suppress punycode deprecation warnings automatically
process.env.NODE_NO_WARNINGS = 1;

import { Command } from "commander";
import chalk from "chalk";
import {
  loadConfig,
  clearConfig,
  saveConfig,
  getConfig,
} from "../src/config/config.js";
import { run } from "../src/index.js";
import { runYolo } from "../src/yolo/index.js";
import enquirer from "enquirer";
import {
  AVAILABLE_AI_MODELS,
  AVAILABLE_AI_PROVIDERS,
} from "../src/config/constants.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import ora from "ora";
import boxen from "boxen";

// Get current package version
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"),
);

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
  .version(packageJson.version)
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
  .option(
    "--provider <provider>",
    "Set AI provider to use (openai or openrouter)",
  )
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

      // If model, provider or max tokens specified directly in command
      if (options.provider || options.model || options.maxTokens) {
        const config = {
          openai: {},
          openrouter: {},
        };

        if (options.provider) {
          if (!AVAILABLE_AI_PROVIDERS.includes(options.provider)) {
            console.error(
              chalk.red(
                `Invalid provider: ${options.provider}. Available providers: ${AVAILABLE_AI_PROVIDERS.join(", ")}`,
              ),
            );
            return;
          }
          config.aiProvider = options.provider;
        }

        if (options.model) {
          // Assign model to the appropriate provider
          if (
            options.provider === "openrouter" ||
            getConfig().aiProvider === "openrouter"
          ) {
            config.openrouter.model = options.model;
          } else {
            config.openai.model = options.model;
          }
        }

        if (options.maxTokens) {
          config.maxTokens = parseInt(options.maxTokens, 10);
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

// Add 'test' command to verify API connection and model
program
  .command("test")
  .description("Test your AI configuration with a simple prompt")
  .option("--verbose", "Show detailed response information")
  .action(async (options) => {
    try {
      console.log(chalk.blue("\nTesting AI configuration..."));

      // Load configuration
      const config = await loadConfig();

      const spinner = ora("Sending test prompt to AI model...").start();

      try {
        // Import the test function
        const { testAIConnection } = await import("../src/ai/test.js");

        // Run the test
        const result = await testAIConnection(config);

        spinner.succeed("AI model responded successfully");

        // Display formatted result
        console.log(
          boxen(
            `${chalk.green("Model:")} ${result.model}\n` +
              `${chalk.green("Provider:")} ${result.provider}\n` +
              `${chalk.green("Response Time:")} ${result.responseTime}ms\n\n` +
              `${chalk.cyan("Test Prompt:")}\n"${result.prompt}"\n\n` +
              `${chalk.yellow("AI Response:")}\n"${result.response}"`,
            {
              padding: 1,
              margin: 1,
              borderStyle: "round",
              borderColor: "green",
              title: "AI Test Result",
              titleAlignment: "center",
            },
          ),
        );

        if (options.verbose) {
          console.log(chalk.dim("\nDetailed Information:"));
          console.log(chalk.dim(JSON.stringify(result.details, null, 2)));
        }

        console.log(
          chalk.green("\n✓ Your AI configuration is working correctly!"),
        );
      } catch (error) {
        spinner.fail("AI test failed");
        console.error(chalk.red(`Error: ${error.message}`));

        // Provide troubleshooting tips
        console.log(chalk.yellow("\nTroubleshooting Tips:"));
        console.log("1. Check that your API key is valid");
        console.log("2. Verify your internet connection");
        console.log(
          "3. Ensure the selected model is available for your account",
        );
        console.log(
          `4. Try running: ${chalk.cyan("commitstudio config")} to reconfigure your settings`,
        );

        if (options.verbose && error.stack) {
          console.error(chalk.dim("\nStack Trace:"));
          console.error(chalk.dim(error.stack));
        }

        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red("Error:"), error.message);
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
  console.log(
    chalk.cyan("AI Provider:"),
    config.aiProvider === "openrouter" ? "OpenRouter" : "OpenAI",
  );

  if (config.aiProvider === "openai") {
    console.log(chalk.cyan("AI Model:"), config.openai.model);
    console.log(
      chalk.cyan("OpenAI API Key:"),
      config.openai.apiKey ? "Set" : "Not set",
    );
  } else {
    console.log(chalk.cyan("AI Model:"), config.openrouter.model);
    console.log(
      chalk.cyan("OpenRouter API Key:"),
      config.openrouter.apiKey ? "Set" : "Not set (using free tier)",
    );
  }

  console.log(chalk.cyan("Max Tokens:"), config.maxTokens);
  console.log(chalk.cyan("Cache Enabled:"), config.cacheEnabled ? "Yes" : "No");
  console.log(
    chalk.cyan("GitHub Token:"),
    config.github.token ? "Set" : "Not set",
  );
  console.log("");
}

/**
 * Interactive configuration
 */
async function configureInteractively() {
  const config = getConfig();

  console.log(chalk.bold("\nConfigure CommitStudio AI Settings"));

  // Move cursor up for better display
  process.stdout.write("\n\n\n");

  // Select AI provider first
  const { provider } = await prompt({
    type: "select",
    name: "provider",
    message: "Select your AI provider:",
    choices: [
      { name: "openai", message: "OpenAI (Premium Models)" },
      { name: "openrouter", message: "OpenRouter (Free Tier Available)" },
    ],
    initial: config.aiProvider === "openrouter" ? 1 : 0,
  });

  // If provider is OpenAI, we need an API key
  if (provider === "openai") {
    // Check if we already have an API key
    let apiKey = config.openai?.apiKey;
    if (!apiKey) {
      const { openaiApiKey } = await prompt({
        type: "password",
        name: "openaiApiKey",
        message: "Enter your OpenAI API key:",
        validate: (value) => {
          if (!value || value.length < 10) {
            return "Please enter a valid API key";
          }
          return true;
        },
      });
      apiKey = openaiApiKey;
    }

    // Select AI model for OpenAI
    const { model } = await prompt({
      type: "select",
      name: "model",
      message: "Select the AI model to use for analysis:",
      choices: AVAILABLE_AI_MODELS,
      initial:
        AVAILABLE_AI_MODELS.indexOf(config.openai.model) !== -1
          ? AVAILABLE_AI_MODELS.indexOf(config.openai.model)
          : 2, // Default to gpt-4.1-mini if current model not in list
    });

    // Set max tokens
    const { maxTokens } = await prompt({
      type: "input",
      name: "maxTokens",
      message: "Maximum tokens for API requests:",
      initial: (
        config.maxTokens ||
        config.openai?.maxTokens ||
        32000
      ).toString(),
      validate: (value) => {
        const parsed = parseInt(value, 10);
        if (isNaN(parsed) || parsed < 100) {
          return "Please enter a number greater than or equal to 100";
        }
        return true;
      },
    });

    // Save the OpenAI configuration
    saveConfig({
      aiProvider: provider,
      openai: {
        apiKey,
        model,
      },
      maxTokens: parseInt(maxTokens, 10),
    });
  }
  // If provider is OpenRouter
  else if (provider === "openrouter") {
    console.log(
      chalk.cyan("\nOpenRouter offers free models like Llama 4 Maverick."),
    );
    console.log(
      chalk.cyan(
        "You'll need to sign up for a free API key at https://openrouter.ai/settings/keys",
      ),
    );

    // Check if we already have an API key
    let apiKey = config.openrouter?.apiKey;
    if (!apiKey) {
      const { openrouterApiKey } = await prompt({
        type: "password",
        name: "openrouterApiKey",
        message: "Enter your OpenRouter API key:",
        validate: (value) => {
          if (!value || value.length < 10) {
            return "Please sign up for a free API key at https://openrouter.ai/settings/keys";
          }
          return true;
        },
      });
      apiKey = openrouterApiKey;
    }

    // Models to show
    const modelChoices = [
      "meta-llama/llama-4-maverick:free",
      "meta-llama/llama-4-pro:free",
      "anthropic/claude-3-opus",
      "anthropic/claude-3-sonnet",
    ];

    // Select model for OpenRouter
    const { model } = await prompt({
      type: "select",
      name: "model",
      message: "Select the AI model to use for analysis:",
      choices: modelChoices,
      initial: 0,
    });

    // Set max tokens
    const { maxTokens } = await prompt({
      type: "input",
      name: "maxTokens",
      message: "Maximum tokens for API requests:",
      initial: (
        config.maxTokens ||
        config.openrouter?.maxTokens ||
        32000
      ).toString(),
      validate: (value) => {
        const parsed = parseInt(value, 10);
        if (isNaN(parsed) || parsed < 100) {
          return "Please enter a number greater than or equal to 100";
        }
        return true;
      },
    });

    // Save the OpenRouter configuration
    saveConfig({
      aiProvider: provider,
      openrouter: {
        apiKey,
        model,
      },
      maxTokens: parseInt(maxTokens, 10),
    });
  }

  console.log(chalk.green("\n✓ Configuration updated successfully."));
  displayCurrentConfig();
}

program.parse(process.argv);
