import { Octokit } from "@octokit/rest";
import OpenAI from "openai";
import chalk from "chalk";
import Enquirer from "enquirer";
import { saveConfig } from "./config.js";

const { prompt } = Enquirer;

/**
 * Validate GitHub and OpenAI credentials
 * @param {Object} config - Configuration object
 * @returns {Promise<boolean>} True if credentials are valid
 */
export async function validateCredentials(config) {
  // Check if credentials exist
  let needsGitHubAuth = false;
  let needsOpenAIKey = false;

  if (!config.githubToken) {
    console.log(chalk.yellow("GitHub token is missing."));
    needsGitHubAuth = true;
  }

  if (!config.openaiApiKey) {
    console.log(chalk.yellow("OpenAI API key is missing."));
    needsOpenAIKey = true;
  }

  // Clear any spinner text to avoid UI issues
  console.log("\n");

  // Handle GitHub auth
  if (needsGitHubAuth) {
    await promptForGitHubToken(config);
  } else {
    // Validate existing token
    try {
      await validateGitHubToken(config.githubToken);
    } catch (error) {
      console.log(chalk.red(`Existing GitHub token error: ${error.message}`));
      await promptForGitHubToken(config);
    }
  }

  // Make GitHub token available globally for other modules
  if (config.githubToken) {
    // Set token in a global variable for other modules to access
    global.githubToken = config.githubToken;

    // Also set in process.env for modules that expect it there
    process.env.GITHUB_TOKEN = config.githubToken;
  }

  // Handle OpenAI key
  if (needsOpenAIKey) {
    await promptForOpenAIKey(config);
  } else {
    console.log(chalk.green("Using existing OpenAI API key."));
  }

  // Make OpenAI key available globally for other modules
  if (config.openaiApiKey) {
    process.env.OPENAI_API_KEY = config.openaiApiKey;
  }

  // Save both tokens for future use if they're not already saved
  saveConfig({
    githubToken: config.githubToken,
    openaiApiKey: config.openaiApiKey,
  });

  return true;
}

/**
 * Prompt for GitHub token
 * @param {Object} config - Config object to update
 */
async function promptForGitHubToken(config) {
  console.log(chalk.blue("Please enter your GitHub Personal Access Token"));
  console.log(chalk.dim("To create one:"));
  console.log(
    chalk.dim(
      "1. Go to GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)",
    ),
  );
  console.log(chalk.dim('2. Click "Generate new token (classic)"'));
  console.log(chalk.dim('3. Add a note like "CommitStudio CLI"'));
  console.log(chalk.dim('4. Select the "repo" scope checkbox'));
  console.log(chalk.dim('5. Click "Generate token" at the bottom'));
  console.log(
    chalk.dim('6. Copy the generated token (it starts with "ghp_")\n'),
  );

  let validToken = false;
  let attempts = 0;
  const maxAttempts = 3;

  while (!validToken && attempts < maxAttempts) {
    attempts++;

    try {
      const { githubToken } = await prompt({
        type: "password",
        name: "githubToken",
        message: "GitHub personal access token:",
        validate: (value) => {
          if (!value || value.trim() === "") return "GitHub token is required";
          return true;
        },
      });

      // Validate token
      console.log(chalk.dim("Validating GitHub token..."));

      try {
        const octokit = new Octokit({ auth: githubToken });
        const { data } = await octokit.users.getAuthenticated();

        console.log(chalk.green(`✓ Authenticated as ${data.login} on GitHub`));

        // Store validated token
        config.githubToken = githubToken;
        validToken = true;

        // Save token automatically
        saveConfig({ githubToken });
        console.log(chalk.green("GitHub token saved for future use."));
      } catch (error) {
        if (attempts < maxAttempts) {
          console.log(
            chalk.red(
              `GitHub authentication failed: ${error.message || "Unknown error"}`,
            ),
          );
          console.log(chalk.yellow("Please try again with a valid token."));

          // Show troubleshooting tips
          console.log(chalk.dim("\nTroubleshooting tips:"));
          console.log(chalk.dim('- Make sure the token has the "repo" scope'));
          console.log(chalk.dim("- Check that the token is not expired"));
          console.log(chalk.dim("- Ensure you copied the entire token"));
          console.log(chalk.dim("- Try generating a new token\n"));
        } else {
          console.log(
            chalk.red(
              `Failed to validate GitHub token after ${maxAttempts} attempts.`,
            ),
          );
          throw new Error(
            "GitHub authentication failed. Please try again later.",
          );
        }
      }
    } catch (error) {
      if (!error.message.includes("GitHub authentication failed")) {
        // This is a prompt error, not an auth error
        console.log(
          chalk.red(`Error during GitHub token prompt: ${error.message}`),
        );
        if (attempts >= maxAttempts) {
          throw error;
        }
      } else {
        // This is an auth error that's already been handled with proper messaging
        if (attempts >= maxAttempts) {
          throw error;
        }
      }
    }
  }
}

/**
 * Prompt for OpenAI API key
 * @param {Object} config - Config object to update
 */
async function promptForOpenAIKey(config) {
  console.log(chalk.blue("\nPlease enter your OpenAI API Key"));
  console.log(chalk.dim("Find it at: https://platform.openai.com/api-keys"));
  console.log(chalk.dim("Note: For this app, we will accept any key format\n"));

  const { openaiApiKey } = await prompt({
    type: "password",
    name: "openaiApiKey",
    message: "OpenAI API key:",
    validate: (value) => {
      if (!value || value.trim() === "") return "OpenAI API key is required";
      return true;
    },
  });

  // Store the key without validation
  config.openaiApiKey = openaiApiKey;
  console.log(chalk.yellow("Accepting OpenAI API key without validation."));

  // Save key automatically
  saveConfig({ openaiApiKey });
  console.log(chalk.green("OpenAI API key saved for future use."));
}

/**
 * Validate GitHub token by making a test API call
 * @param {string} token - GitHub token to validate
 * @returns {Promise<boolean>} True if token is valid
 * @throws {Error} If token is invalid
 */
async function validateGitHubToken(token) {
  try {
    const octokit = new Octokit({ auth: token });

    // Try to get authenticated user
    const { data } = await octokit.users.getAuthenticated();
    console.log(chalk.green(`✓ Authenticated as ${data.login} on GitHub`));

    return true;
  } catch (error) {
    if (error.status === 401) {
      throw new Error("Invalid GitHub token. Please check your credentials.");
    } else if (error.status === 403) {
      throw new Error(
        "GitHub API rate limit exceeded or token lacks permissions.",
      );
    } else if (error.status === 404) {
      throw new Error(
        "GitHub resource not found. Check your token permissions.",
      );
    }

    throw new Error(`GitHub API error: ${error.message || "Unknown error"}`);
  }
}
