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
      auth: process.env.GITHUB_TOKEN,
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
      throw new Error(
        `Repository ${repoInfo.owner}/${repoInfo.repo} not found. Check your GitHub token permissions.`,
      );
    }

    throw error;
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
