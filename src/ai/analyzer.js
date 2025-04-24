import OpenAI from "openai";
import pLimit from "p-limit";
import chalk from "chalk";
import { getCommitDiff } from "../github/commits.js";
import { checkCommentExists } from "../github/comments.js";

/**
 * Analyze git diffs with OpenAI
 * @param {Object} options - Options for analysis
 * @param {Array} options.commits - List of commits to analyze
 * @param {string} options.repoPath - Path to local repository
 * @param {string} options.owner - Repository owner
 * @param {string} options.repo - Repository name
 * @param {Function} [options.onProgress] - Progress callback
 * @param {Object} [options.config] - Configuration options
 * @returns {Promise<Array>} Analysis results
 */
export async function analyzeDiffs({
  commits,
  repoPath,
  owner,
  repo,
  onProgress,
  config = {},
}) {
  // Use global openaiApiKey if it exists, or check environment variable
  const apiKey = global.openaiApiKey || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.log(
      chalk.yellow(
        "Warning: OpenAI API key is not available. Using mock analysis mode.",
      ),
    );
    return await analyzeDiffsWithMock({
      commits,
      repoPath,
      owner,
      repo,
      onProgress,
    });
  }

  try {
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // For browser support
    });

    const results = [];

    // Set up concurrency limit
    const limit = pLimit(config.maxConcurrent || 3); // Process up to specified concurrent commits

    // First, check which commits already have comments
    const commitsThatNeedAnalysis = [];

    for (let i = 0; i < commits.length; i++) {
      const commit = commits[i];
      const hasComment = await checkCommentExists(commit.sha, owner, repo);

      if (!hasComment) {
        commitsThatNeedAnalysis.push(commit);
      }
    }

    // Process commits with concurrency limit
    const promises = commitsThatNeedAnalysis.map((commit, index) =>
      limit(async () => {
        if (onProgress) {
          onProgress(index + 1, commitsThatNeedAnalysis.length);
        }

        // Get diff for this commit
        const diff = await getCommitDiff(commit.sha, repoPath);

        // Skip if diff is empty
        if (!diff || diff.trim() === "") {
          return null;
        }

        // Analyze diff with OpenAI
        const analysis = await analyzeWithOpenAI(openai, {
          diff,
          commit,
          config,
        });

        // Add commit info to result
        const result = {
          commitSha: commit.sha,
          commitMessage: commit.message,
          ...analysis,
        };

        results.push(result);
        return result;
      }),
    );

    await Promise.all(promises);

    // Filter out null results (skipped commits)
    return results.filter(Boolean);
  } catch (error) {
    console.log(chalk.red(`Error using OpenAI analysis: ${error.message}`));
    console.log(chalk.yellow("Falling back to mock analysis mode..."));
    return await analyzeDiffsWithMock({
      commits,
      repoPath,
      owner,
      repo,
      onProgress,
    });
  }
}

/**
 * Analyze diffs using a mock implementation (for testing)
 * @param {Object} options - Options for analysis
 * @returns {Promise<Array>} Mocked analysis results
 */
async function analyzeDiffsWithMock({
  commits,
  repoPath,
  owner,
  repo,
  onProgress,
}) {
  console.log(
    chalk.yellow(
      "Using mock analysis mode - no actual AI analysis will be performed",
    ),
  );

  const results = [];

  // Check which commits already have comments
  const commitsThatNeedAnalysis = [];

  for (let i = 0; i < commits.length; i++) {
    const commit = commits[i];
    const hasComment = await checkCommentExists(commit.sha, owner, repo);

    if (!hasComment) {
      commitsThatNeedAnalysis.push(commit);
    }
  }

  // Process each commit sequentially with a mock analysis
  for (let i = 0; i < commitsThatNeedAnalysis.length; i++) {
    const commit = commitsThatNeedAnalysis[i];

    if (onProgress) {
      onProgress(i + 1, commitsThatNeedAnalysis.length);
    }

    // Get diff for this commit
    const diff = await getCommitDiff(commit.sha, repoPath);

    // Skip if diff is empty
    if (!diff || diff.trim() === "") {
      continue;
    }

    // Generate a simple mock analysis
    const mockAnalysis = generateMockAnalysis(diff, commit);

    // Add commit info to result
    const result = {
      commitSha: commit.sha,
      commitMessage: commit.message,
      ...mockAnalysis,
    };

    results.push(result);

    // Add a small delay to make the progress visible
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return results;
}

/**
 * Generate a mock analysis for testing purposes
 * @param {string} diff - Git diff content
 * @param {Object} commit - Commit metadata
 * @returns {Object} Mock analysis result
 */
function generateMockAnalysis(diff, commit) {
  // Count added and removed lines
  const addedLines = (diff.match(/^\+(?![\+\-])/gm) || []).length;
  const removedLines = (diff.match(/^\-(?![\+\-])/gm) || []).length;

  // Extract file names from the diff
  const filePattern = /^diff --git a\/(.+?) b\/(.+?)$/gm;
  const files = [];
  let match;

  while ((match = filePattern.exec(diff)) !== null) {
    files.push(match[2]);
  }

  // Generate a mock summary
  const summary = `This commit ${commit.message.toLowerCase() || ""}. It adds ${addedLines} lines and removes ${removedLines} lines across ${files.length} files.`;

  // Generate mock comments for each file
  const comments = files.map((file) => ({
    file,
    content: `This file was modified with ${file.endsWith(".js") ? "JavaScript" : file.endsWith(".ts") ? "TypeScript" : "code"} changes.`,
  }));

  // Generate mock suggestions
  const suggestions = [
    "Consider adding more unit tests to cover these changes",
    "Documentation could be improved to explain the purpose of these changes",
    `Remember to update any related components that might depend on ${files[0] || "this code"}`,
  ];

  return {
    summary,
    comments,
    suggestions,
  };
}

/**
 * Analyze a diff using OpenAI API
 * @param {Object} openai - OpenAI client instance
 * @param {Object} options - Analysis options
 * @param {string} options.diff - Git diff content
 * @param {Object} options.commit - Commit metadata
 * @param {Object} [options.config] - Configuration options
 * @returns {Promise<Object>} Analysis result
 */
async function analyzeWithOpenAI(openai, { diff, commit, config = {} }) {
  // Create a system prompt that instructs the model on how to analyze code
  const systemPrompt = `You are a helpful programming assistant specializing in code review.
You will be given a git diff from a commit along with the commit message.
Your task is to analyze the code changes and provide thoughtful, constructive feedback.

Please respond with:
1. A brief summary of the changes
2. Specific comments on the code changes, including potential issues, bugs, or improvements
3. Suggestions for future improvements if applicable

Format your comments to be helpful and constructive. Focus on meaningful insights rather than trivial issues.
If relevant, mention best practices and why they matter.`;

  try {
    // Truncate very large diffs to prevent rate limit errors
    // GPT models have token limits, so we'll limit large diffs
    const MAX_DIFF_LENGTH = 20000;
    let truncatedDiff = diff;
    let diffTruncated = false;

    if (diff.length > MAX_DIFF_LENGTH) {
      truncatedDiff = diff.substring(0, MAX_DIFF_LENGTH);
      diffTruncated = true;
    }

    const response = await openai.chat.completions.create({
      model: config?.openai?.model || "gpt-4.1-mini", // Use configured model or default
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Commit: ${commit.message}\n\nDiff:${diffTruncated ? " (truncated due to large size)\n" : "\n"}\`\`\`diff\n${truncatedDiff}\n\`\`\``,
        },
      ],
      temperature: 0.3, // Lower temperature for more focused analysis
      max_tokens: config?.openai?.maxTokens || 2000, // Use configured max tokens or default
    });

    // Extract and parse the assistant's response
    const analysisText = response.choices[0].message.content;

    // Add note about truncation if diff was truncated
    let result = parseAnalysisResponse(analysisText);
    if (diffTruncated) {
      result.summary = `[Note: This analysis is based on a truncated diff due to size limits] ${result.summary}`;
    }

    return result;
  } catch (error) {
    console.error(`Error analyzing commit ${commit.sha}: ${error.message}`);

    // Return a basic analysis with the error
    return {
      summary: `Error during analysis: ${error.message}`,
      comments: [],
      suggestions: [],
    };
  }
}

/**
 * Parse the AI response into structured data
 * @param {string} text - AI response text
 * @returns {Object} Structured analysis
 */
function parseAnalysisResponse(text) {
  // Ensure we have a string to work with
  if (text === null || text === undefined) {
    return {
      summary: "Error parsing AI response: No valid text provided",
      comments: [],
      suggestions: [],
    };
  }

  // Default structure
  const result = {
    summary: "",
    comments: [],
    suggestions: [],
  };

  try {
    // Empty string should return empty result
    if (text.trim() === "") {
      return result;
    }

    // Extract summary (usually the first paragraph)
    const summaryMatch = text.match(/^(.+?)(?=\n\n|\n###|\n##|$)/s);
    if (summaryMatch) {
      result.summary = summaryMatch[0].trim();
    }

    // Extract comments
    const commentSections =
      text.match(
        /### (Comments|Detailed Comments|Analysis|Code Review).*?\n([\s\S]*?)(?=\n###|\n##|$)/g,
      ) || [];

    for (const section of commentSections) {
      // Parse individual comments
      const commentLines = section.split("\n").slice(1); // Skip the heading

      let currentFile = null;
      let currentComment = null;

      for (const line of commentLines) {
        // Check for file markers (often begins with #### or ** or `)
        const fileMatch = line.match(
          /^(#{4}|[*]{2}|`)\s*([^`*#]+?\.(js|ts|jsx|tsx|css|html|json|md|py|java|c|cpp|go))/i,
        );

        if (fileMatch) {
          currentFile = fileMatch[2].trim();
          continue;
        }

        // Check for line number references
        const lineMatch = line.match(/^(Line[s]?\s+(\d+)[-–]?(\d+)?:?)/i);

        if (lineMatch) {
          // Start a new comment
          currentComment = {
            file: currentFile,
            line: lineMatch[2],
            content: line.replace(lineMatch[1], "").trim(),
          };

          if (currentComment.content) {
            result.comments.push(currentComment);
          }

          continue;
        }

        // Add content to the current comment or start a new general comment
        if (line.trim()) {
          if (currentComment) {
            currentComment.content += " " + line.trim();
          } else {
            currentComment = {
              file: currentFile,
              content: line.trim(),
            };
            result.comments.push(currentComment);
          }
        } else {
          // Empty line, reset current comment
          currentComment = null;
        }
      }
    }

    // Extract suggestions
    const suggestionSection = text.match(
      /### Suggestions.*?\n([\s\S]*?)(?=\n###|\n##|$)/,
    );

    if (suggestionSection) {
      const suggestionLines = suggestionSection[1]
        .split("\n")
        .filter((line) => line.trim());

      for (const line of suggestionLines) {
        // Extract bullet points or numbered suggestions
        const suggestionMatch =
          line.match(/^[*-]\s+(.+)/) || line.match(/^\d+\.\s+(.+)/);

        if (suggestionMatch) {
          result.suggestions.push(suggestionMatch[1]);
        } else if (line.trim()) {
          result.suggestions.push(line.trim());
        }
      }
    }
  } catch (error) {
    console.error(`Error parsing AI response: ${error.message}`);
    // Fallback for parsing errors
    if (!result.summary) {
      result.summary = "Failed to parse AI analysis: " + error.message;
    }
  }

  return result;
}

export { parseAnalysisResponse };
