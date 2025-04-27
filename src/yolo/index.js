import chalk from "chalk";
import ora from "ora";
import boxen from "boxen";
import simpleGit from "simple-git";
import OpenAI from "openai";

import { validateCredentials } from "../config/validate.js";
import { detectRepository, getRepositoryInfo } from "../github/repository.js";
import { getCommits } from "../github/commits.js";

// Format a message in a styled box
const boxMessage = (message, title = null, type = "info") => {
  const colors = {
    info: { border: "blue", text: chalk.blue },
    success: { border: "green", text: chalk.green },
    warning: { border: "yellow", text: chalk.yellow },
    error: { border: "red", text: chalk.red },
  };

  const style = colors[type] || colors.info;

  const boxOptions = {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: style.border,
    title: title ? style.text(title) : undefined,
    titleAlignment: "center",
  };

  return boxen(
    typeof message === "string" ? style.text(message) : message,
    boxOptions,
  );
};

// List of fun emojis for commit messages
const COMMIT_EMOJIS = [
  "🚀",
  "🔥",
  "💥",
  "✨",
  "🎉",
  "🎨",
  "🐛",
  "🩹",
  "🧪",
  "⚡️",
  "🔍",
  "💫",
  "🧹",
  "🧠",
  "💻",
  "🤖",
  "⚙️",
  "🚚",
  "📦",
  "📝",
];

// Get a random emoji
const getRandomEmoji = () => {
  return COMMIT_EMOJIS[Math.floor(Math.random() * COMMIT_EMOJIS.length)];
};

/**
 * Main YOLO workflow - modify commit messages
 * @param {Object} options - CLI options and configuration
 * @returns {Promise<void>}
 */
export async function runYolo(options) {
  // Display welcome message
  console.log(
    boxMessage(
      "YOLO MODE - Rewriting commit messages with AI",
      "🤪 CommitStudio YOLO 🤪",
      "warning",
    ),
  );

  let spinner = ora("Initializing YOLO mode...").start();

  try {
    // Stop spinner before validation which has interactive prompts
    spinner.stop();

    // Validate credentials first - will prompt if needed
    await validateCredentials(options);

    // Restart spinner after credentials are valid
    spinner = ora("Credentials validated").start();
    spinner.succeed();
    console.log(""); // Add spacing

    // Auto-detect repository if path not specified
    spinner = ora("Detecting repository...").start();
    const repoPath = options.path || process.cwd();

    try {
      const repoInfo = await detectRepository(repoPath);
      spinner.succeed(`Repository detected: ${chalk.blue(repoInfo.name)}`);

      // Get more detailed repository information from GitHub
      spinner = ora("Fetching repository details...").start();
      const { owner, repo, defaultBranch } = await getRepositoryInfo(repoInfo);

      // Display repository info in a styled box
      spinner.succeed();
      const repoMessage = `Repository: ${chalk.blue(`${owner}/${repo}`)}\nDefault branch: ${chalk.blue(defaultBranch)}`;
      console.log(boxMessage(repoMessage, "Repository Information", "info"));

      // Determine which branch to analyze
      const branch = options.branch || defaultBranch;

      // Continue with modifying commit messages
      await modifyCommitMessages({
        options,
        owner,
        repo,
        branch,
        repoPath,
      });
    } catch (error) {
      spinner.fail(`Repository detection failed: ${error.message}`);
      console.error(
        boxMessage(
          `Could not detect or access a valid GitHub repository. Make sure you're in a git repository connected to GitHub, or specify a path with --path.`,
          "Error",
          "error",
        ),
      );
      process.exit(1);
    }
  } catch (error) {
    spinner.fail(`Error: ${error.message}`);

    if (options.verbose && error.stack) {
      console.error(chalk.dim(error.stack));
    }

    process.exit(1);
  }
}

/**
 * Modify commit messages with AI-generated ones
 * @param {Object} params - Processing parameters
 * @returns {Promise<void>}
 */
async function modifyCommitMessages({
  options,
  owner,
  repo,
  branch,
  repoPath,
}) {
  // Get commits to process
  const spinner = ora(`Fetching commits from ${branch}...`).start();

  const commitOptions = {
    owner,
    repo,
    branch,
    path: repoPath,
    maxCount: options.commits || 15, // Default to last 15 commits
    since: options.since,
    author: options.author,
  };

  const commits = await getCommits(commitOptions);

  if (commits.length === 0) {
    spinner.fail("No commits found to process");
    return;
  }

  spinner.succeed();
  console.log(
    boxMessage(
      `Found ${chalk.blue(commits.length)} commits to process`,
      "Commits",
      "info",
    ),
  );

  // Get OpenAI API key
  const apiKey = global.openaiApiKey || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error(
      boxMessage("OpenAI API key is required for YOLO mode", "Error", "error"),
    );
    process.exit(1);
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true, // For browser support
  });

  // Process each commit
  spinner.start("Analyzing commits and generating new messages...");

  const git = simpleGit(repoPath);
  const results = [];

  for (let i = 0; i < commits.length; i++) {
    const commit = commits[i];
    spinner.text = `Analyzing commit ${i + 1}/${commits.length}: ${commit.sha.substring(0, 7)}`;

    // Get diff for this commit
    const diff = await git.show([commit.sha]);

    // Generate new commit message
    try {
      const newMessage = await generateCommitMessage(openai, {
        oldMessage: commit.message,
        diff,
        useEmoji: options.emoji,
        config: options,
      });

      results.push({
        sha: commit.sha,
        oldMessage: commit.message,
        newMessage,
      });
    } catch (error) {
      console.error(
        `Error generating message for ${commit.sha.substring(0, 7)}: ${error.message}`,
      );
      results.push({
        sha: commit.sha,
        oldMessage: commit.message,
        newMessage: null,
        error: error.message,
      });
    }
  }

  spinner.succeed("Commit analysis complete");

  // Display results
  console.log(boxMessage("Generated Commit Messages", "Results", "info"));

  for (const result of results) {
    const oldMsg = result.oldMessage.trim();
    const newMsg = result.newMessage;

    console.log(chalk.dim(`Commit: ${result.sha.substring(0, 7)}`));
    console.log(chalk.red(`- ${oldMsg}`));

    if (newMsg) {
      console.log(chalk.green(`+ ${newMsg}`));
    } else {
      console.log(chalk.yellow(`× Error: ${result.error}`));
    }
    console.log(); // Add spacing
  }

  // Apply changes if not in dry-run mode
  if (!options.dryRun && results.some((r) => r.newMessage)) {
    if (await confirmChanges()) {
      // Check for unstaged changes before proceeding
      try {
        const status = await git.status();

        if (status.files.length > 0) {
          console.error(
            boxMessage(
              "Cannot modify commit messages: You have unstaged changes in your repository.\nPlease commit or stash your changes before running YOLO mode.",
              "⚠️ Error: Unstaged Changes ⚠️",
              "error",
            ),
          );
          return;
        }

        // Set environment variable to suppress filter-branch warning
        process.env.FILTER_BRANCH_SQUELCH_WARNING = 1;

        spinner.start("Applying new commit messages...");

        let successCount = 0;
        for (const result of results) {
          if (result.newMessage) {
            try {
              // Escape special characters in commit message
              const escapedMessage = result.newMessage
                .replace(/"/g, '\\"') // Double quotes
                .replace(/`/g, "\\`") // Backticks
                .replace(/\$/g, "\\$") // Dollar signs
                .replace(/!/g, "\\!") // Exclamation marks
                .replace(/\r/g, "") // Remove carriage returns
                .replace(/\n/g, "\\n"); // Escape newlines

              await git.raw([
                "filter-branch",
                "--force",
                "--msg-filter",
                `if [ "$GIT_COMMIT" = "${result.sha}" ]; then echo "${escapedMessage}"; else cat; fi`,
                result.sha + "^..HEAD",
              ]);

              successCount++;
            } catch (error) {
              spinner.stop();
              console.error(
                `Failed to update commit ${result.sha.substring(0, 7)}: ${error.message}`,
              );
            }
          }
        }

        spinner.succeed(`Updated ${successCount} commit messages`);

        if (successCount > 0) {
          console.log(
            boxMessage(
              "Commit messages have been updated. You may need to force push with:\ngit push --force",
              "⚠️ IMPORTANT ⚠️",
              "warning",
            ),
          );
        }
      } catch (error) {
        spinner.fail("Failed to modify commit messages");
        console.error(chalk.red(`Error: ${error.message}`));
      }
    } else {
      console.log(
        boxMessage(
          "No changes were made to commit messages",
          "Cancelled",
          "info",
        ),
      );
    }
  } else if (options.dryRun) {
    console.log(
      boxMessage(
        "This was a dry run. No changes were made to commit messages.\nRun without --dry-run to apply changes.",
        "Dry Run",
        "info",
      ),
    );
  }
}

/**
 * Generate a new commit message for a commit
 * @param {Object} openai - OpenAI client
 * @param {Object} options - Options for generation
 * @param {string} options.oldMessage - Original commit message
 * @param {string} options.diff - Commit diff
 * @param {boolean} options.useEmoji - Whether to include emoji
 * @param {Object} [options.config] - Configuration options
 * @returns {Promise<string>} New commit message
 */
async function generateCommitMessage(
  openai,
  { oldMessage, diff, useEmoji, config = {} },
) {
  // Truncate very large diffs to prevent rate limit errors
  const MAX_DIFF_LENGTH = 15000;
  let truncatedDiff = diff;
  let diffTruncated = false;

  if (diff.length > MAX_DIFF_LENGTH) {
    truncatedDiff = diff.substring(0, MAX_DIFF_LENGTH);
    diffTruncated = true;
  }

  const systemPrompt = `You are a helpful assistant that writes clear, concise, and descriptive git commit messages.
The commit message should summarize what the change does, not why it was made.
Begin with a short (50 chars or less) summary in imperative mood.
If adding an emoji, place it at the start of the message.
Use proper capitalization but no trailing period.
Example formats: 
- "Fix broken authentication flow"
- "🔧 Update dependencies to latest versions"
- "Add user profile settings page"`;

  const response = await openai.chat.completions.create({
    model: config?.openai?.model || "gpt-4.1-mini", // Use configured model or default
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Here is a git commit with message: "${oldMessage}"
${diffTruncated ? "(Diff truncated due to large size)" : ""}
Diff:
\`\`\`
${truncatedDiff}
\`\`\`

Write a better commit message that clearly explains what changes were made. ${useEmoji ? "Include an appropriate emoji at the start." : "Do not use emoji."}`,
      },
    ],
    temperature: 0.6,
    max_tokens: config?.openai?.maxTokens || 2000, // Use configured max tokens or default
  });

  let message = response.choices[0].message.content.trim();

  // Remove quotes if present
  if (
    (message.startsWith('"') && message.endsWith('"')) ||
    (message.startsWith("'") && message.endsWith("'"))
  ) {
    message = message.substring(1, message.length - 1);
  }

  // Add emoji if requested and not already present
  if (useEmoji && !message.match(/^\p{Emoji}/u)) {
    message = `${getRandomEmoji()} ${message}`;
  }

  return message;
}

/**
 * Ask user to confirm commit message changes
 * @returns {Promise<boolean>} True if user confirms
 */
async function confirmChanges() {
  try {
    // Simple confirmation using native Node
    return new Promise((resolve) => {
      console.log(
        chalk.yellow(
          "\nAre you sure you want to modify these commit messages? This cannot be easily undone. (y/N)",
        ),
      );

      process.stdin.resume();
      process.stdin.setEncoding("utf8");

      process.stdin.on("data", (data) => {
        const input = data.toString().trim().toLowerCase();
        process.stdin.pause();
        resolve(input === "y" || input === "yes");
      });
    });
  } catch (error) {
    console.error("Error during confirmation:", error);
    return false;
  }
}
