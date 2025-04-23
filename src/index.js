import chalk from "chalk";
import ora from "ora";
import boxen from "boxen";
import gradient from "gradient-string";
import Table from "cli-table3";

import { validateCredentials } from "./config/validate.js";
import { detectRepository, getRepositoryInfo } from "./github/repository.js";
import { getCommits } from "./github/commits.js";
import { analyzeDiffs } from "./ai/analyzer.js";
import { postComments } from "./github/comments.js";
import { getCacheManager } from "./utils/cache.js";

// Create a stylish title banner
const createBanner = () => {
  const title = gradient.pastel.multiline([
    "  _____ _____ _____ _____ _____ ______   _____ _______ _    _ _____ _____ _____ ",
    " / ____/ ____|  __ \\_   _|_   _|  ____| / ____|__   __| |  | |  __ \\_   _/ ____|",
    "| |   | |    | |__) || |   | | | |__   | (___    | |  | |  | | |  | || || |  __ ",
    "| |   | |    |  ___/ | |   | | |  __|   \\___ \\   | |  | |  | | |  | || || | |_ |",
    "| |___| |____| |    _| |_ _| |_| |____  ____) |  | |  | |__| | |__| || || |__| |",
    " \\_____\\_____|_|   |_____|_____|______||_____/   |_|   \\____/|_____/_____\\_____|"
  ].join('\n'));
  
  return title;
};

// Format a message in a styled box
const boxMessage = (message, title = null, type = 'info') => {
  const colors = {
    info: { border: 'blue', text: chalk.blue },
    success: { border: 'green', text: chalk.green },
    warning: { border: 'yellow', text: chalk.yellow },
    error: { border: 'red', text: chalk.red }
  };
  
  const style = colors[type] || colors.info;
  
  const boxOptions = {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: style.border,
    title: title ? style.text(title) : undefined,
    titleAlignment: 'center'
  };
  
  return boxen(typeof message === 'string' ? style.text(message) : message, boxOptions);
};

/**
 * Main application workflow
 * @param {Object} options - CLI options and configuration
 * @returns {Promise<void>}
 */
export async function run(options) {
  // Display banner
  console.log(createBanner());
  console.log(boxMessage('An AI-powered tool for analyzing git diffs and posting comments to GitHub', 'Welcome to CommitStudio', 'info'));
  
  let spinner = ora("Initializing CommitStudio...").start();

  try {
    // Stop spinner before validation which has interactive prompts
    spinner.stop();

    // Validate credentials first - will prompt if needed
    await validateCredentials(options);

    // Restart spinner after credentials are valid
    spinner = ora("Credentials validated").start();
    spinner.succeed();
    console.log(''); // Add spacing

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
      
      // Display repository info in a styled box
      spinner.succeed();
      const repoMessage = `Repository: ${chalk.blue(`${owner}/${repo}`)}\nDefault branch: ${chalk.blue(defaultBranch)}`;
      console.log(boxMessage(repoMessage, 'Repository Information', 'success'));
      
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
      console.error(boxMessage(`Could not detect or access a valid GitHub repository. Make sure you're in a git repository connected to GitHub, or specify a path with --path.`, 'Error', 'error'));
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
    
    spinner.succeed();
    const commitsMessage = `Found ${chalk.blue(allCommits.length)} commits to analyze\n${allCommits.length - commitsToProcess.length} already processed`;
    console.log(boxMessage(commitsMessage, 'Commits', 'info'));
  } else {
    spinner.succeed();
    console.log(boxMessage(`Found ${chalk.blue(allCommits.length)} commits to analyze (cache disabled)`, 'Commits', 'info'));
  }
  
  if (commitsToProcess.length === 0) {
    console.log(boxMessage('All commits have already been analyzed', 'Status', 'success'));
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
  
  spinner.succeed();
  console.log(boxMessage(`Analyzed ${currentCommit} commits`, 'Analysis Complete', 'success'));
  
  // Skip posting comments if in dry-run mode
  if (options.dryRun) {
    console.log(boxMessage('Dry run mode: Skipping posting comments to GitHub', 'Dry Run', 'warning'));
    
    // Display a summary of what would be posted in a table
    console.log(chalk.blue('\n📊 Analysis summary:'));
    
    const table = new Table({
      head: [chalk.blue('Commit'), chalk.blue('Message'), chalk.blue('Summary')],
      colWidths: [10, 30, 50]
    });
    
    for (const result of analysisResults) {
      table.push([
        result.commitSha.substring(0, 7),
        result.commitMessage.substring(0, 27) + (result.commitMessage.length > 27 ? '...' : ''),
        result.summary.substring(0, 47) + (result.summary.length > 47 ? '...' : '')
      ]);
      
      if (result.suggestions.length > 0) {
        console.log(chalk.yellow(`\n✨ Suggestions for ${result.commitSha.substring(0, 7)}:`));
        result.suggestions.forEach((s, i) => console.log(`  ${i+1}. ${s}`));
        console.log(''); // Add spacing
      }
    }
    
    console.log(table.toString());
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
  
  spinner.succeed();
  console.log(boxMessage(`Posted ${postedCount} comments to GitHub`, 'Comments Posted', 'success'));
  
  // Mark commits as processed in cache
  if (options.cache !== false) {
    for (const result of analysisResults) {
      cacheManager.markCommitAsProcessed(result.commitSha);
    }
    cacheManager.save();
  }
  
  console.log(boxMessage('CommitStudio completed successfully!', 'Complete', 'success'));
}
