import fs from "fs";
import path from "path";
import os from "os";

/**
 * Get a cache manager for tracking processed commits
 * @param {Object} options - Cache options
 * @returns {Object} Cache manager
 */
export function getCacheManager(options) {
  // Determine cache path
  const cachePath =
    options.cachePath || path.join(os.homedir(), ".commitstudio", "cache");

  // Ensure cache directory exists
  if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath, { recursive: true });
  }

  // Determine cache file path for this repository
  const repoIdentifier =
    options.repo && options.owner
      ? `${options.owner}-${options.repo}`
      : "default";

  const cacheFile = path.join(cachePath, `${repoIdentifier}.json`);

  // Initialize or load cache
  let cache = { processedCommits: [] };

  if (fs.existsSync(cacheFile)) {
    try {
      const fileContent = fs.readFileSync(cacheFile, "utf8");
      cache = JSON.parse(fileContent);
    } catch (error) {
      console.warn(
        `Warning: Could not read cache file. Starting with empty cache: ${error.message}`,
      );
    }
  }

  // Save cache helper function
  const saveCache = () => {
    try {
      fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2), "utf8");
    } catch (error) {
      console.warn(`Warning: Could not save cache: ${error.message}`);
    }
  };

  return {
    /**
     * Check if a commit has already been processed
     * @param {string} commitSha - Commit SHA to check
     * @returns {boolean} True if commit has been processed
     */
    isProcessed(commitSha) {
      return cache.processedCommits.includes(commitSha);
    },

    /**
     * Mark a commit as processed
     * @param {string} commitSha - Commit SHA to mark
     */
    markAsProcessed(commitSha) {
      if (!cache.processedCommits.includes(commitSha)) {
        cache.processedCommits.push(commitSha);
        saveCache();
      }
    },

    /**
     * Remove a commit from processed list
     * @param {string} commitSha - Commit SHA to remove
     */
    unmarkAsProcessed(commitSha) {
      cache.processedCommits = cache.processedCommits.filter(
        (sha) => sha !== commitSha,
      );
      saveCache();
    },

    /**
     * Clear all processed commits from cache
     */
    clearCache() {
      cache.processedCommits = [];
      saveCache();
    },

    /**
     * Get all processed commits
     * @returns {Array<string>} List of processed commit SHAs
     */
    getProcessedCommits() {
      return [...cache.processedCommits];
    },
  };
}
