import { Octokit } from "@octokit/rest";
import chalk from "chalk";
import open from "open";

/**
 * Authenticate with GitHub using OAuth Device Flow
 * This allows the user to authenticate without having to manually create a token
 * @returns {Promise<{octokit: Octokit, token: string}>} Authenticated Octokit instance and token
 */
export async function authenticateWithOAuth() {
  console.log(chalk.blue("Initiating GitHub authentication..."));

  // GitHub's Device Flow API endpoint
  const GITHUB_DEVICE_URL = "https://github.com/login/device/code";
  const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
  const CLIENT_ID = "bd58f26b58f9bebeeba0"; // Must be registered OAuth app client ID

  try {
    // Step 1: Request device and user verification codes
    const deviceResponse = await fetch(GITHUB_DEVICE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        scope: "repo",
      }),
    });

    if (!deviceResponse.ok) {
      throw new Error(
        `Device code request failed: ${deviceResponse.statusText}`,
      );
    }

    const deviceData = await deviceResponse.json();
    const { device_code, user_code, verification_uri, interval } = deviceData;

    // Step 2: Show the user the verification URL and code
    console.log(chalk.green("\nTo complete GitHub authentication:"));
    console.log(chalk.yellow(`1. Visit: ${verification_uri}`));
    console.log(chalk.yellow(`2. Enter code: ${chalk.bold(user_code)}\n`));

    // Try to open the browser automatically
    await open(verification_uri).catch(() => {
      console.log(
        chalk.dim(
          "Could not open browser automatically. Please visit the URL manually.",
        ),
      );
    });

    // Step 3: Poll for the user to complete authorization
    console.log(chalk.dim("Waiting for GitHub authorization..."));

    let token = null;
    const intervalTime = interval || 5; // Default to 5 seconds if not provided
    const maxAttempts = 30; // 2.5 minutes timeout

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Wait for the specified interval
      await new Promise((resolve) => setTimeout(resolve, intervalTime * 1000));

      // Check if user has authorized the app
      const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          device_code: device_code,
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.access_token) {
        token = tokenData.access_token;
        break;
      }

      // Handle errors other than 'authorization_pending'
      if (tokenData.error && tokenData.error !== "authorization_pending") {
        if (tokenData.error === "slow_down") {
          // If GitHub asks us to slow down, increase the interval
          intervalTime += 5;
        } else if (tokenData.error === "expired_token") {
          throw new Error("The device code has expired. Please try again.");
        } else if (tokenData.error === "access_denied") {
          throw new Error("GitHub authorization was denied.");
        } else {
          throw new Error(
            `GitHub authorization error: ${tokenData.error_description || tokenData.error}`,
          );
        }
      }

      // Show a spinner or progress update
      process.stdout.write(".");
    }

    if (!token) {
      throw new Error("GitHub authorization timed out. Please try again.");
    }

    console.log(chalk.green("\n✓ Successfully authenticated with GitHub!"));

    // Create authenticated Octokit instance
    const octokit = new Octokit({ auth: token });

    // Get and display the authenticated user
    const { data: user } = await octokit.users.getAuthenticated();
    console.log(chalk.green(`Authenticated as ${user.login}`));

    // Return the Octokit instance and token
    return { octokit, token };
  } catch (error) {
    console.error(chalk.red("GitHub authentication failed:"), error.message);
    throw error;
  }
}
