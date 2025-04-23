import { createOAuthDeviceAuth } from "@octokit/auth-oauth-device";
import open from "open";
import chalk from "chalk";
import ora from "ora";
import { loadConfig, saveConfig } from "../config/config.js";

/**
 * Authenticates with GitHub using the device flow
 * @param {Object} options - Configuration options
 * @param {string} options.clientId - GitHub OAuth client ID
 * @param {string[]} options.scopes - GitHub scopes to request
 * @returns {Promise<string>} The GitHub token
 */
export async function authenticateWithDeviceFlow({ clientId, scopes = ["repo"] }) {
  const spinner = ora("Initiating GitHub authentication...").start();
  
  try {
    const auth = createOAuthDeviceAuth({
      clientType: "oauth-app",
      clientId,
      scopes,
      onVerification(verification) {
        spinner.stop();
        
        // Display the device code to the user
        console.log("\n" + chalk.green("✓") + " GitHub device authentication initiated");
        console.log("\n" + chalk.bold("To complete authentication:"));
        console.log(`1. Your browser should open automatically to: ${chalk.cyan(verification.verification_uri)}`);
        console.log(`2. Enter this code: ${chalk.bold.cyan(verification.user_code)}`);
        console.log(`3. Follow the prompts on GitHub to authorize this application\n`);
        
        // Try to open the browser automatically
        try {
          open(verification.verification_uri);
          console.log(chalk.dim("Browser opened automatically. If it didn't open, please visit the URL manually."));
        } catch (error) {
          console.log(chalk.yellow("Could not open the browser automatically. Please visit the URL manually."));
        }
        
        spinner.text = "Waiting for GitHub authentication...";
        spinner.start();
      }
    });
    
    const { token } = await auth({
      type: "oauth",
    });
    
    spinner.succeed("GitHub authentication successful");
    return token;
  } catch (error) {
    spinner.fail(`GitHub authentication failed: ${error.message}`);
    console.error(chalk.dim(error.stack));
    return null;
  }
}

/**
 * Validate a GitHub token by making a test API call
 * @param {string} token - GitHub token to validate
 * @returns {Promise<void>}
 * @throws {Error} If token validation fails
 */
export async function validateGitHubToken(token) {
  try {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json"
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      
      if (response.status === 401) {
        throw new Error("Invalid or expired token");
      } else if (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0") {
        throw new Error("API rate limit exceeded. Please try again later.");
      } else {
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }
    }
    
    // Token is valid
    return true;
  } catch (error) {
    throw new Error(`GitHub token validation failed: ${error.message}`);
  }
}
