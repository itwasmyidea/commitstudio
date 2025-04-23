/**
 * Application constants and default configuration values
 */

// GitHub authentication
// This client ID is for the CommitStudio GitHub OAuth App
// Users don't need to change this - it's used for the device flow authentication
export const GITHUB_CLIENT_ID =
  process.env.GITHUB_CLIENT_ID || "Ov23liIA45phTP52foql";

// Default settings
export const DEFAULT_SETTINGS = {
  // Number of commits to analyze by default if not specified
  defaultCommitCount: 10,

  // Default paths to ignore in analysis
  ignorePaths: [
    "node_modules/**",
    "dist/**",
    "build/**",
    "*.lock",
    "package-lock.json",
    "yarn.lock",
  ],

  // Cache duration in milliseconds (default: 24 hours)
  cacheDuration: 24 * 60 * 60 * 1000,

  // Maximum file size to analyze in bytes (default: 1MB)
  maxFileSize: 1024 * 1024,

  // OpenAI model to use for analysis
  openaiModel: "gpt-4-turbo",

  // Default prompt template for diff analysis
  defaultPromptTemplate:
    "Review this code diff and provide feedback on: 1) Potential bugs or errors, 2) Code style and best practices, 3) Performance considerations, 4) Security issues.",
};

// GitHub API related constants
export const GITHUB_API_URL = "https://api.github.com";
export const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

// File extensions to analyze (others will be ignored)
export const ANALYZABLE_EXTENSIONS = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".py",
  ".rb",
  ".java",
  ".go",
  ".c",
  ".cpp",
  ".cs",
  ".php",
  ".html",
  ".css",
  ".scss",
  ".md",
  ".json",
  ".yml",
  ".yaml",
];
