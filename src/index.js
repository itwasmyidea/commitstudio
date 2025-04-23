import chalk from "chalk";
import ora from "ora";
import { Listr } from "listr2";

import { validateCredentials } from "./config/validate.js";
import { detectRepository, getRepositoryInfo } from "./github/repository.js";
import { getCommits } from "./github/commits.js";
import { analyzeDiffs } from "./ai/analyzer.js";
import { postComments } from "./github/comments.js";
import { getCacheManager } from "./utils/cache.js";

/**
 * Main application workflow
 * @param {Object} options - CLI options and configuration
 * @returns {Promise<void>}
 */
export async function run(options) {
  let spinner = ora("Initializing CommitStudio...").start();

  try {
    // Stop spinner before validation which has interactive prompts
    spinner.stop();

    // Validate credentials first - will prompt if needed
    await validateCredentials(options);

    // Restart spinner after credentials are valid
    spinner = ora("Credentials validated").start();
    spinner.succeed();

    // Set up cache manager
    const cacheManager = getCacheManager(options);

    // Auto-detect repository if path not specified
    spinner = ora("Detecting repository...").start();
    const repoPath = options.path || process.cwd();
    const repoInfo = await detectRepository(repoPath);
    spinner.succeed(`Repository detected: ${chalk.blue(repoInfo.name)}`);

    // Get more detailed repository information from GitHub
    spinner = ora("Fetching repository details...").start();
    const { owner, repo, defaultBranch } = await getRepositoryInfo(repoInfo);
    spinner.succeed(
      `Repository: ${chalk.blue(`${owner}/${repo}`)} (default branch: ${defaultBranch})`,
    );

    // Determine which branch to analyze
    const branch = options.branch || defaultBranch;

    // Set up the main workflow as a list of tasks
    const tasks = new Listr(
      [
        {
          title: `Fetching commits from ${chalk.blue(branch)}`,
          task: async (ctx) => {
            ctx.commits = await getCommits({
              owner,
              repo,
              branch,
              path: repoPath,
              maxCount: options.commits,
              since: options.since,
              author: options.author,
            });

            // Filter out already processed commits if cache is enabled
            if (options.cache !== false) {
              const originalCount = ctx.commits.length;
              ctx.commits = ctx.commits.filter(
                (commit) => !cacheManager.isProcessed(commit.sha),
              );
              const filteredCount = originalCount - ctx.commits.length;

              if (filteredCount > 0) {
                return `Found ${ctx.commits.length} new commits (${filteredCount} already processed)`;
              }
            }

            return `Found ${ctx.commits.length} commits to analyze`;
          },
        },
        {
          title: "Analyzing diffs with AI",
          skip: (ctx) => ctx.commits.length === 0 && "No commits to analyze",
          task: async (ctx, task) => {
            try {
              ctx.results = await analyzeDiffs({
                commits: ctx.commits,
                repoPath,
                owner,
                repo,
                onProgress: (current, total) => {
                  task.output = `Analyzing commit ${current}/${total}`;
                },
              });

              return `Analyzed ${ctx.results.length} commits`;
            } catch (error) {
              return `Error during analysis: ${error.message}`;
            }
          },
        },
        {
          title: "Posting comments to GitHub",
          skip: (ctx) =>
            (ctx.commits.length === 0 && "No commits to analyze") ||
            (options.dryRun &&
              "Dry run mode enabled - skipping comment posting"),
          task: async (ctx, task) => {
            await postComments({
              results: ctx.results,
              owner,
              repo,
              onProgress: (current, total) => {
                task.output = `Posting comment ${current}/${total}`;
              },
            });

            // Mark commits as processed in cache
            if (options.cache !== false) {
              ctx.commits.forEach((commit) =>
                cacheManager.markAsProcessed(commit.sha),
              );
            }

            return `Posted ${ctx.results.length} comments`;
          },
        },
      ],
      {
        renderer: options.verbose ? "verbose" : "default",
        exitOnError: false, // Continue even if there are errors
      },
    );

    const results = await tasks.run();

    if (results.commits && results.commits.length === 0) {
      console.log(
        chalk.yellow(
          "No new commits to analyze. All commits have been processed already.",
        ),
      );
      console.log(chalk.dim("Use --no-cache to reanalyze all commits."));
    } else if (options.dryRun) {
      console.log(
        chalk.yellow("Dry run completed. No comments were posted to GitHub."),
      );
    } else {
      console.log(chalk.green("✓ CommitStudio completed successfully!"));
    }
  } catch (error) {
    spinner.fail(chalk.red("Error: ") + error.message);
    throw error;
  }
}
