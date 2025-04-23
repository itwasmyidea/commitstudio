import simpleGit from "simple-git";
import { Octokit } from "@octokit/rest";

/**
 * Get commits from GitHub repository
 * @param {Object} options - Options for getting commits
 * @param {string} options.owner - Repository owner
 * @param {string} options.repo - Repository name
 * @param {string} options.branch - Branch name
 * @param {string} options.path - Path to local repository
 * @param {number} [options.maxCount] - Maximum number of commits to retrieve
 * @param {string} [options.since] - Retrieve commits since date
 * @param {string} [options.author] - Filter by author email
 * @returns {Promise<Array>} List of commits
 */
export async function getCommits(options) {
  const { owner, repo, branch, path, maxCount, since, author } = options;

  // Use local git for speed and to handle private repositories
  const git = simpleGit(path);

  // Prepare log options
  const logOptions = ["--name-status"];

  if (maxCount) {
    logOptions.push(`-n ${maxCount}`);
  }

  if (since) {
    logOptions.push(`--since="${since}"`);
  }

  if (author) {
    logOptions.push(`--author="${author}"`);
  }

  // Get commits from local git
  const logs = await git.log([...logOptions, branch]);

  // Get additional info from GitHub for each commit
  const commits = await enrichCommitsWithGitHubData(logs.all, { owner, repo });

  return commits;
}

/**
 * Enrich commit data with additional information from GitHub API
 * @param {Array} commits - Commits from git log
 * @param {Object} options - Repository options
 * @returns {Promise<Array>} Enriched commit list
 */
async function enrichCommitsWithGitHubData(commits, { owner, repo }) {
  if (!process.env.GITHUB_TOKEN) {
    // We can still work with local-only commits if no GitHub token is available
    return commits.map((commit) => ({
      sha: commit.hash,
      message: commit.message,
      date: commit.date,
      author: {
        name: commit.author_name,
        email: commit.author_email,
      },
      files: parseFilesFromCommit(commit),
      htmlUrl: null,
    }));
  }

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  // Enrich each commit with GitHub data
  const enrichedCommits = await Promise.all(
    commits.map(async (commit) => {
      try {
        // Get commit details from GitHub
        const { data } = await octokit.repos.getCommit({
          owner,
          repo,
          ref: commit.hash,
        });

        return {
          sha: commit.hash,
          message: commit.message,
          date: commit.date,
          author: {
            name: commit.author_name,
            email: commit.author_email,
            login: data.author?.login,
            githubId: data.author?.id,
          },
          files: parseFilesFromCommit(commit),
          htmlUrl: data.html_url,
          commitUrl: data.url,
          commentCount: data.commit.comment_count,
        };
      } catch (error) {
        // Fall back to local commit data if GitHub API fails
        console.warn(
          `Warning: Could not fetch GitHub data for commit ${commit.hash}: ${error.message}`,
        );

        return {
          sha: commit.hash,
          message: commit.message,
          date: commit.date,
          author: {
            name: commit.author_name,
            email: commit.author_email,
          },
          files: parseFilesFromCommit(commit),
          htmlUrl: null,
        };
      }
    }),
  );

  return enrichedCommits;
}

/**
 * Parse modified files from commit data
 * @param {Object} commit - Commit object from simple-git
 * @returns {Array<Object>} List of files modified in commit
 */
function parseFilesFromCommit(commit) {
  // Extract modified files from commit output
  if (!commit.diff) {
    return [];
  }

  const fileStatus = commit.diff?.files || [];

  return fileStatus.map((file) => ({
    filename: file.file,
    status: statusCodeToString(file.type),
  }));
}

/**
 * Convert git status codes to readable strings
 * @param {string} code - Git status code
 * @returns {string} Human-readable status
 */
function statusCodeToString(code) {
  const statusMap = {
    A: "added",
    M: "modified",
    D: "deleted",
    R: "renamed",
    C: "copied",
    U: "updated",
    T: "type changed",
  };

  return statusMap[code] || code;
}

/**
 * Get diff for a specific commit
 * @param {string} commitSha - Commit SHA
 * @param {string} repoPath - Path to local repository
 * @returns {Promise<string>} Commit diff
 */
export async function getCommitDiff(commitSha, repoPath) {
  const git = simpleGit(repoPath);

  // Get the commit diff
  const diff = await git.show([commitSha, "--patch", "--unified=3"]);

  return diff;
}
