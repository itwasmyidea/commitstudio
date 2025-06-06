import { dirname } from "path";
import { fileURLToPath } from "url";
import simpleGit from "simple-git";
import { Octokit } from "@octokit/rest";
import Enquirer from "enquirer";
import chalk from "chalk";

const { prompt } = Enquirer;

/**
 * Detect a git repository from a given path
 * @param {string} path - Path to detect repository from
 * @returns {Promise<Object>} Repository information
 */
export async function detectRepository(path) {
  try {
    const git = simpleGit(path);

    // Check if directory is a git repository
    const isRepo = await git.checkIsRepo();

    if (!isRepo) {
      throw new Error(`No git repository found at ${path}`);
    }

    // Get remote URL
    const remotes = await git.getRemotes(true);

    // Look for origin or any GitHub remote
    const githubRemote = remotes.find(
      (remote) =>
        remote.name === "origin" ||
        (remote.refs.fetch && remote.refs.fetch.includes("github.com")),
    );

    if (!githubRemote) {
      return await promptForRemoteUrl(git);
    }

    // Extract owner and repo from remote URL
    const remoteUrl = githubRemote.refs.fetch;
    const { owner, repo } = extractRepoInfo(remoteUrl);

    // Get current branch
    const branchSummary = await git.branch();

    return {
      path,
      remoteUrl,
      name: repo,
      owner,
      repo,
      currentBranch: branchSummary.current,
    };
  } catch (error) {
    if (error.message.includes("Not a git repository")) {
      throw new Error(`No git repository found at ${path}`);
    }

    throw error;
  }
}

/**
 * Prompt user for GitHub repository URL
 * @param {Object} git - SimpleGit instance
 * @returns {Promise<Object>} Repository information
 */
async function promptForRemoteUrl(git) {
  console.log(chalk.yellow("No GitHub remote detected for this repository."));

  const { remoteUrl } = await prompt({
    type: "input",
    name: "remoteUrl",
    message: "Enter the GitHub repository URL:",
    validate: (value) => {
      if (!value) return "GitHub URL is required";
      if (!value.includes("github.com")) return "Not a valid GitHub URL";
      return true;
    },
  });

  // Extract owner and repo from the provided URL
  const { owner, repo } = extractRepoInfo(remoteUrl);

  // Get current branch
  const branchSummary = await git.branch();

  return {
    remoteUrl,
    name: repo,
    owner,
    repo,
    currentBranch: branchSummary.current,
  };
}

/**
 * Get detailed repository information from GitHub API
 * @param {Object} repoInfo - Basic repository information
 * @returns {Promise<Object>} Detailed repository information
 */
export async function getRepositoryInfo(repoInfo) {
  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN || global.githubToken,
    });

    // Get repository details from GitHub API
    const { data } = await octokit.repos.get({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
    });

    return {
      ...repoInfo,
      defaultBranch: data.default_branch,
      isPrivate: data.private,
      description: data.description,
      apiUrl: data.url,
    };
  } catch (error) {
    if (error.status === 404) {
      console.log(
        chalk.yellow(
          `Repository ${repoInfo.owner}/${repoInfo.repo} not found.`,
        ),
      );
      return await promptForCorrectRepository(repoInfo.owner, repoInfo);
    }

    throw error;
  }
}

/**
 * Prompt the user for the correct repository when auto-detection fails
 * @param {string} owner - Repository owner
 * @param {Object} originalRepoInfo - Original repository information
 * @returns {Promise<Object>} Corrected repository information
 */
async function promptForCorrectRepository(owner, originalRepoInfo) {
  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN || global.githubToken,
    });

    // Get list of repositories for the user
    console.log(
      chalk.blue(`\nFetching repositories for ${chalk.bold(owner)}...`),
    );

    // Start with first page of results
    let allRepos = [];
    let page = 1;
    let hasMorePages = true;
    const PER_PAGE = 100;

    while (hasMorePages) {
      const { data: repos } = await octokit.repos.listForUser({
        username: owner,
        per_page: PER_PAGE,
        page: page,
        sort: "updated",
      });

      allRepos = [...allRepos, ...repos];

      // Check if there are more pages
      if (repos.length < PER_PAGE) {
        hasMorePages = false;
      } else {
        page++;
      }
    }

    if (allRepos.length === 0) {
      return await promptForManualRepository(owner, originalRepoInfo);
    }

    console.log(chalk.green(`\n✓ Found ${allRepos.length} repositories\n`));

    // Paginate repositories for selection with 15 per page
    const ITEMS_PER_PAGE = 15;
    let currentPage = 0;
    let selectedRepo = null;

    while (selectedRepo === null) {
      const startIdx = currentPage * ITEMS_PER_PAGE;
      const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, allRepos.length);
      const pageRepos = allRepos.slice(startIdx, endIdx);

      const hasNextPage = endIdx < allRepos.length;
      const hasPrevPage = currentPage > 0;

      // Create choices array with pagination controls
      const choices = [
        ...pageRepos.map((repo) => ({
          name: repo.name,
          value: repo.name,
        })),
      ];

      // Add pagination controls
      const paginationChoices = [];
      if (hasPrevPage) {
        paginationChoices.push({ name: "⬅️ Previous page", value: "prev" });
      }
      if (hasNextPage) {
        paginationChoices.push({ name: "➡️ Next page", value: "next" });
      }

      // Add manual entry option
      paginationChoices.push({ name: "✏️ Enter manually", value: "manual" });

      // Add pagination controls and manual entry
      if (paginationChoices.length > 0) {
        choices.push({ type: "separator", line: "─".repeat(20) });
        choices.push(...paginationChoices);
      }

      // Show page info
      const pageInfo = `Page ${currentPage + 1}/${Math.ceil(allRepos.length / ITEMS_PER_PAGE)}`;

      // Ask user to select repository
      const { selection } = await prompt({
        type: "select",
        name: "selection",
        message: `Select the correct repository (${pageInfo}):`,
        choices: choices,
      });

      // Handle navigation and selection
      if (selection === "prev") {
        currentPage--;
      } else if (selection === "next") {
        currentPage++;
      } else if (selection === "manual") {
        return await promptForManualRepository(owner, originalRepoInfo);
      } else {
        selectedRepo = selection;
      }
    }

    console.log(
      chalk.green(`\n✓ Selected repository: ${chalk.blue(selectedRepo)}\n`),
    );

    // Get repository details
    const { data } = await octokit.repos.get({
      owner,
      repo: selectedRepo,
    });

    return {
      ...originalRepoInfo,
      repo: selectedRepo,
      name: selectedRepo,
      defaultBranch: data.default_branch,
      isPrivate: data.private,
      description: data.description,
      apiUrl: data.url,
    };
  } catch (error) {
    console.error(
      chalk.red(`\n✗ Error fetching repositories: ${error.message}\n`),
    );
    return await promptForManualRepository(owner, originalRepoInfo);
  }
}

/**
 * Prompt for manual repository entry
 * @param {string} owner - Repository owner
 * @param {Object} originalRepoInfo - Original repository information
 * @returns {Promise<Object>} Corrected repository information
 */
async function promptForManualRepository(owner, originalRepoInfo) {
  console.log(
    chalk.yellow("\nPlease enter your repository information manually:"),
  );

  const { repoName } = await prompt({
    type: "input",
    name: "repoName",
    message: `Repository name for ${chalk.blue(owner)}:`,
    initial: originalRepoInfo.repo,
    validate: (value) => (value ? true : "Repository name is required"),
  });

  try {
    console.log(
      chalk.blue(
        `\nVerifying repository ${chalk.bold(owner + "/" + repoName)}...`,
      ),
    );

    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN || global.githubToken,
    });

    // Verify the repository exists
    const { data } = await octokit.repos.get({
      owner,
      repo: repoName,
    });

    console.log(chalk.green(`\n✓ Repository verified successfully\n`));

    return {
      ...originalRepoInfo,
      repo: repoName,
      name: repoName,
      defaultBranch: data.default_branch,
      isPrivate: data.private,
      description: data.description,
      apiUrl: data.url,
    };
  } catch (error) {
    throw new Error(
      `Repository ${owner}/${repoName} could not be accessed. Check that it exists and you have permission to access it.`,
    );
  }
}

/**
 * Extract owner and repository name from a GitHub URL
 * @param {string} url - GitHub repository URL
 * @returns {Object} Owner and repository name
 */
function extractRepoInfo(url) {
  // Handle different GitHub URL formats
  // https://github.com/owner/repo.git
  // git@github.com:owner/repo.git

  let match;

  if (url.includes("github.com")) {
    if (url.startsWith("git@")) {
      // SSH format
      match = url.match(/git@github\.com:([^/]+)\/([^.]+)(\.git)?/);
    } else {
      // HTTPS format
      match = url.match(/https:\/\/github\.com\/([^/]+)\/([^/.]+)(\.git)?/);
    }

    if (match) {
      return {
        owner: match[1],
        repo: match[2],
      };
    }
  }

  throw new Error(`Could not parse GitHub repository URL: ${url}`);
}
