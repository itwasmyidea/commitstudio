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
    
    try {
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
      
      // Continue with the rest of the workflow
      await processRepository({
        options,
        owner,
        repo,
        branch,
        repoPath,
        cacheManager
      });
    } catch (error) {
      spinner.fail(`Repository detection failed: ${error.message}`);
      console.error(chalk.red(
        "Could not detect or access a valid GitHub repository. Make sure you're in a git repository connected to GitHub, or specify a path with --path."
      ));
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
 * Process a repository once it's been correctly identified
 * @param {Object} params - Processing parameters
 * @param {Object} params.options - Original CLI options
 * @param {string} params.owner - Repository owner
 * @param {string} params.repo - Repository name
 * @param {string} params.branch - Branch to analyze
 * @param {string} params.repoPath - Path to local repository
 * @param {Object} params.cacheManager - Cache manager instance
 * @returns {Promise<void>}
 */
async function processRepository({ options, owner, repo, branch, repoPath, cacheManager }) {
  // Get commits to analyze
  const spinner = ora(`Fetching commits from ${branch}...`).start();
  
  const commitOptions = {
    owner,
    repo,
    branch,
    path: repoPath,
    maxCount: options.commits,
    since: options.since,
    author: options.author,
  };
  
  const allCommits = await getCommits(commitOptions);
  
  // Filter out already processed commits if cache is enabled
  let commitsToProcess = allCommits;
  
  if (options.cache !== false) {
    commitsToProcess = allCommits.filter(
      (commit) => !cacheManager.isCommitProcessed(commit.sha),
    );
    
    spinner.succeed(
      `Found ${chalk.blue(allCommits.length)} commits to analyze (${
        allCommits.length - commitsToProcess.length
      } already processed)`,
    );
  } else {
    spinner.succeed(
      `Found ${chalk.blue(allCommits.length)} commits to analyze (cache disabled)`,
    );
  }
  
  if (commitsToProcess.length === 0) {
    console.log(chalk.green("✓ All commits have already been analyzed"));
    return;
  }
  
  // Run analyses with AI
  spinner.start("Analyzing diffs with AI...");
  
  let currentCommit = 1;
  const onProgress = (current, total) => {
    spinner.text = `Analyzing diffs with AI... ${current}/${total}`;
    currentCommit = current;
  };
  
  const analysisResults = await analyzeDiffs({
    commits: commitsToProcess,
    repoPath,
    owner,
    repo,
    onProgress,
  });
  
  spinner.succeed(`${chalk.green("✓")} Analyzed ${currentCommit} commits`);
  
  // Skip posting comments if in dry-run mode
  if (options.dryRun) {
    console.log(
      chalk.blue("Dry run mode:"),
      "Skipping posting comments to GitHub",
    );
    
    // Display a summary of what would be posted
    console.log(chalk.blue("\nAnalysis summary:"));
    
    for (const result of analysisResults) {
      console.log(
        `\n${chalk.bold("Commit:")} ${result.commitSha.substring(0, 7)} - ${
          result.commitMessage
        }`,
      );
      console.log(`${chalk.bold("Summary:")} ${result.summary}`);
      
      if (result.suggestions.length > 0) {
        console.log(chalk.bold("\nSuggestions:"));
        result.suggestions.forEach((s) => console.log(`- ${s}`));
      }
    }
    
    return;
  }
  
  // Post comments to GitHub
  spinner.start("Posting comments to GitHub...");
  
  let postedCount = 0;
  const postOptions = {
    owner,
    repo,
    dryRun: options.dryRun,
    onProgress: () => {
      postedCount++;
      spinner.text = `Posting comments to GitHub... ${postedCount}/${analysisResults.length}`;
    },
  };
  
  await postComments(analysisResults, postOptions);
  
  spinner.succeed(
    `${chalk.green("✓")} Posted ${postedCount} comments to GitHub`,
  );
  
  // Mark commits as processed in cache
  if (options.cache !== false) {
    for (const result of analysisResults) {
      cacheManager.markCommitAsProcessed(result.commitSha);
    }
    cacheManager.save();
  }
  
  console.log(chalk.green("\n✓ CommitStudio completed successfully!"));
}
