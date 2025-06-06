import { Octokit } from "@octokit/rest";
import chalk from "chalk";

/**
 * Post AI-generated comments to GitHub commits
 * @param {Array} results - Analysis results to post
 * @param {Object} options - Options for posting comments
 * @param {string} options.owner - Repository owner
 * @param {string} options.repo - Repository name
 * @param {boolean} [options.dryRun] - Whether to skip posting comments
 * @param {Function} [options.onProgress] - Progress callback
 * @returns {Promise<Array>} Posted comments
 */
export async function postComments(results, options) {
  const { owner, repo, dryRun, onProgress } = options;

  // Skip posting if in dry run mode
  if (dryRun) {
    return [];
  }

  // Determine which token to use - environment variable or saved token
  const token = process.env.GITHUB_TOKEN || global.githubToken;

  if (!token) {
    throw new Error("GitHub token is required to post comments.");
  }

  const octokit = new Octokit({
    auth: token,
  });

  const postedComments = [];

  // Post comments for each commit
  for (let i = 0; i < results.length; i++) {
    const result = results[i];

    if (onProgress) {
      onProgress(i + 1, results.length);
    }

    try {
      // Format the comment body
      const commentBody = formatCommentBody(result);

      // Post comment to GitHub
      const comment = await octokit.repos.createCommitComment({
        owner,
        repo,
        commit_sha: result.commitSha,
        body: commentBody,
      });

      postedComments.push({
        commitSha: result.commitSha,
        commentId: comment.data.id,
        url: comment.data.html_url,
      });

      console.log(
        chalk.green(
          `✓ Posted comment on commit ${result.commitSha.substring(0, 7)}`,
        ),
      );
    } catch (error) {
      console.error(
        chalk.red(
          `Failed to post comment on commit ${result.commitSha.substring(0, 7)}: ${error.message}`,
        ),
      );
    }
  }

  return postedComments;
}

/**
 * Format analysis result as a GitHub comment
 * @param {Object} result - AI analysis result
 * @returns {string} Formatted comment body
 */
function formatCommentBody(result) {
  // GitHub has a 65536 character limit for comments
  const MAX_COMMENT_LENGTH = 65000; // Leaving some buffer

  let commentBody = `## 🤖 CommitStudio AI Code Review\n\n`;

  if (result.summary) {
    commentBody += `### Summary\n${result.summary}\n\n`;
  }

  if (result.comments && result.comments.length > 0) {
    commentBody += `### Detailed Comments\n\n`;

    // Keep track of remaining characters
    let remainingChars = MAX_COMMENT_LENGTH - commentBody.length;

    // Add comments one by one until we approach the limit
    for (const comment of result.comments) {
      const fileHeader = `#### ${comment.file || "General"}\n`;
      const lineInfo = comment.line ? `Line ${comment.line}: ` : "";
      const commentContent = `${lineInfo}${comment.content}\n\n`;

      // Calculate size of this comment
      const commentSize = fileHeader.length + commentContent.length;

      // If this comment would exceed our limit, add a truncation note and stop
      if (commentSize > remainingChars) {
        commentBody += `\n\n*Note: Some comments were truncated due to GitHub's comment size limits.*\n\n`;
        break;
      }

      // Otherwise add the comment
      commentBody += fileHeader + commentContent;
      remainingChars -= commentSize;
    }
  }

  // Check if we have room for suggestions
  const attributionText = `\n---\n*Generated by [CommitStudio](https://github.com/itwasmyidea/commitstudio) - AI-powered code review tool*`;
  let remainingChars =
    MAX_COMMENT_LENGTH - commentBody.length - attributionText.length;

  if (
    result.suggestions &&
    result.suggestions.length > 0 &&
    remainingChars > 50
  ) {
    commentBody += `### Suggestions\n\n`;
    remainingChars -= "### Suggestions\n\n".length;

    // Add suggestions until we approach the limit
    for (const suggestion of result.suggestions) {
      const suggestionText = `- ${suggestion}\n`;

      if (suggestionText.length > remainingChars) {
        commentBody += `\n*Some suggestions were truncated due to size limits.*`;
        break;
      }

      commentBody += suggestionText;
      remainingChars -= suggestionText.length;
    }

    commentBody += "\n";
  }

  // Add attribution
  commentBody += attributionText;

  // Final safety check
  if (commentBody.length > MAX_COMMENT_LENGTH) {
    commentBody =
      commentBody.substring(0, MAX_COMMENT_LENGTH - 100) +
      "\n\n*Comment was truncated due to GitHub's size limits.*\n\n" +
      attributionText;
  }

  return commentBody;
}

/**
 * Check if a comment already exists for a commit
 * @param {string} commitSha - Commit SHA
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<boolean>} True if comment exists
 */
export async function checkCommentExists(commitSha, owner, repo) {
  const token = process.env.GITHUB_TOKEN || global.githubToken;

  if (!token) {
    // If no token is available, we can't check for existing comments
    return false;
  }

  try {
    const octokit = new Octokit({
      auth: token,
    });

    // Get existing comments for the commit
    const { data: comments } = await octokit.repos.listCommentsForCommit({
      owner,
      repo,
      commit_sha: commitSha,
    });

    // Check if any comment is from CommitStudio
    return comments.some(
      (comment) =>
        comment.body.includes("CommitStudio AI Code Review") ||
        comment.body.includes("Generated by [CommitStudio]"),
    );
  } catch (error) {
    console.warn(
      `Warning: Could not check for existing comments on commit ${commitSha}: ${error.message}`,
    );
    return false;
  }
}
