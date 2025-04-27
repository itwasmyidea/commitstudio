import { Octokit } from "@octokit/rest";
import chalk from "chalk";
import enquirer from "enquirer";
const { prompt } = enquirer;
import { saveConfig } from "./config.js";
import { authenticateWithDeviceFlow } from "../github/auth.js";
import { GITHUB_CLIENT_ID } from "./constants.js";

/**
 * Validates the GitHub and OpenAI credentials in the configuration
 * @param {Object} config - The configuration object
 * @returns {Promise<Object>} - The updated configuration object
 */
export async function validateCredentials(config) {
  let updatedConfig = { ...config };

  console.log(chalk.blue("Checking credentials..."));

  // Check if GitHub token is missing
  if (!updatedConfig.github?.token) {
    console.log(chalk.yellow("GitHub token is missing"));

    // Check if we have a valid GitHub client ID for OAuth flow
    const hasValidClientId =
      GITHUB_CLIENT_ID &&
      GITHUB_CLIENT_ID !== "YOUR_CLIENT_ID_HERE" &&
      GITHUB_CLIENT_ID !== "YOUR_DEFAULT_CLIENT_ID";

    if (!hasValidClientId) {
      console.log(
        chalk.yellow(
          "No valid GitHub OAuth client ID found. Using manual token entry.",
        ),
      );
      updatedConfig = await promptForGitHubToken(updatedConfig);
    } else {
      // Ask if user wants to use device flow or manual token entry
      try {
        const { authMethod } = await prompt({
          type: "select",
          name: "authMethod",
          message: "How would you like to authenticate with GitHub?",
          choices: [
            {
              name: "browser",
              message: "Authenticate via browser (recommended)",
            },
            { name: "manual", message: "Enter token manually" },
          ],
        });

        if (authMethod === "browser") {
          try {
            const token = await authenticateWithDeviceFlow({
              clientId: GITHUB_CLIENT_ID,
              scopes: ["repo"],
            });

            if (token) {
              updatedConfig.github = { ...updatedConfig.github, token };
              await saveConfig(updatedConfig);
              // Set token in global scope for other modules to use
              global.githubToken = token;
              console.log(chalk.green("✓ GitHub token has been saved"));
            } else {
              console.log(
                chalk.red("Failed to obtain GitHub token via device flow"),
              );
              updatedConfig = await promptForGitHubToken(updatedConfig);
            }
          } catch (error) {
            console.log(
              chalk.red(
                `Error during device flow authentication: ${error?.message || "Unknown error"}`,
              ),
            );
            updatedConfig = await promptForGitHubToken(updatedConfig);
          }
        } else {
          updatedConfig = await promptForGitHubToken(updatedConfig);
        }
      } catch (error) {
        console.log(
          chalk.red(
            `Error during authentication selection: ${error?.message || "Unknown error"}`,
          ),
        );
        console.log(chalk.yellow("Defaulting to manual token entry."));
        updatedConfig = await promptForGitHubToken(updatedConfig);
      }
    }
  } else {
    // Validate the existing GitHub token
    try {
      await validateGitHubToken(updatedConfig.github.token);
      // Set token in global scope for other modules to use
      global.githubToken = updatedConfig.github.token;
      console.log(chalk.green("✓ GitHub token is valid"));
    } catch (error) {
      console.log(
        chalk.red(`GitHub token validation failed: ${error.message}`),
      );

      // Check if we have a valid GitHub client ID for OAuth flow
      const hasValidClientId =
        GITHUB_CLIENT_ID &&
        GITHUB_CLIENT_ID !== "YOUR_CLIENT_ID_HERE" &&
        GITHUB_CLIENT_ID !== "YOUR_DEFAULT_CLIENT_ID";

      if (!hasValidClientId) {
        console.log(
          chalk.yellow(
            "No valid GitHub OAuth client ID found. Using manual token entry.",
          ),
        );
        updatedConfig = await promptForGitHubToken(updatedConfig);
      } else {
        // Ask if user wants to use device flow or manual token entry
        try {
          const { authMethod } = await prompt({
            type: "select",
            name: "authMethod",
            message: "How would you like to authenticate with GitHub?",
            choices: [
              {
                name: "browser",
                message: "Authenticate via browser (recommended)",
              },
              { name: "manual", message: "Enter token manually" },
            ],
          });

          if (authMethod === "browser") {
            try {
              const token = await authenticateWithDeviceFlow({
                clientId: GITHUB_CLIENT_ID,
                scopes: ["repo"],
              });

              if (token) {
                updatedConfig.github = { ...updatedConfig.github, token };
                await saveConfig(updatedConfig);
                // Set token in global scope for other modules to use
                global.githubToken = token;
                console.log(chalk.green("✓ GitHub token has been saved"));
              } else {
                console.log(
                  chalk.red("Failed to obtain GitHub token via device flow"),
                );
                updatedConfig = await promptForGitHubToken(updatedConfig);
              }
            } catch (error) {
              console.log(
                chalk.red(
                  `Error during device flow authentication: ${error?.message || "Unknown error"}`,
                ),
              );
              updatedConfig = await promptForGitHubToken(updatedConfig);
            }
          } else {
            updatedConfig = await promptForGitHubToken(updatedConfig);
          }
        } catch (error) {
          console.log(
            chalk.red(
              `Error during authentication selection: ${error?.message || "Unknown error"}`,
            ),
          );
          console.log(chalk.yellow("Defaulting to manual token entry."));
          updatedConfig = await promptForGitHubToken(updatedConfig);
        }
      }
    }
  }

  // Check if OpenAI key is missing
  if (!updatedConfig.openai?.apiKey) {
    console.log(chalk.yellow("OpenAI API key is missing"));
    updatedConfig = await promptForOpenAIKey(updatedConfig);
  } else {
    // Set key in global scope for other modules to use
    global.openaiApiKey = updatedConfig.openai.apiKey;
    console.log(chalk.green("✓ OpenAI API key is present"));
  }

  return updatedConfig;
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

        // Store validated token - fixing to use the correct structure
        if (!config.github) config.github = {};
        config.github.token = githubToken;
        // Set token in global scope for other modules to use
        global.githubToken = githubToken;
        validToken = true;

        // Save token automatically with the correct structure
        saveConfig({ github: { token: githubToken } });
        console.log(chalk.green("GitHub token saved for future use."));
      } catch (error) {
        if (attempts < maxAttempts) {
          console.log(
            chalk.red(
              `GitHub authentication failed: ${error?.message || "Unknown error"}`,
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
      if (!error?.message?.includes("GitHub authentication failed")) {
        // This is a prompt error, not an auth error
        console.log(
          chalk.red(
            `Error during GitHub token prompt: ${error?.message || "Unknown error"}`,
          ),
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

  try {
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
    if (!config.openai) config.openai = {};
    config.openai.apiKey = openaiApiKey;
    // Set key in global scope for other modules to use
    global.openaiApiKey = openaiApiKey;
    console.log(chalk.yellow("Accepting OpenAI API key without validation."));

    // Save key automatically
    saveConfig({ openai: { apiKey: openaiApiKey } });
    console.log(chalk.green("OpenAI API key saved for future use."));

    return config;
  } catch (error) {
    console.log(
      chalk.red(
        `Error during OpenAI key prompt: ${error?.message || "Unknown error"}`,
      ),
    );
    // Return the config without changes if there was an error
    return config;
  }
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
