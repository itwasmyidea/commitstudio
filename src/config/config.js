import { createRequire } from "module";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import Conf from "conf";
import { config as dotenvConfig } from "dotenv";
import z from "zod";

// Load .env file if present
dotenvConfig();

// Get package info
const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const pkg = require(join(__dirname, "../../package.json"));

// Configuration schema
const configSchema = z.object({
  githubToken: z.string().min(1, "GitHub token is required").optional(),
  openaiApiKey: z.string().min(1, "OpenAI API key is required").optional(),
  cacheEnabled: z.boolean().default(true),
  cachePath: z.string().optional(),
  maxConcurrent: z.number().int().positive().default(3),
  dryRun: z.boolean().default(false),
  verbose: z.boolean().default(false),
});

// Create config store
const configStore = new Conf({
  projectName: pkg.name,
  schema: {
    githubToken: {
      type: "string",
    },
    openaiApiKey: {
      type: "string",
    },
    cacheEnabled: {
      type: "boolean",
      default: true,
    },
    cachePath: {
      type: "string",
    },
    maxConcurrent: {
      type: "number",
      default: 3,
    },
  },
});

/**
 * Load configuration from environment variables and config store
 * @returns {Promise<Object>} Validated configuration
 */
export async function loadConfig() {
  // Priority: CLI options > env vars > config store
  const config = {
    githubToken: process.env.GITHUB_TOKEN || configStore.get("githubToken"),
    openaiApiKey: process.env.OPENAI_API_KEY || configStore.get("openaiApiKey"),
    cacheEnabled: configStore.get("cacheEnabled"),
    cachePath: configStore.get("cachePath"),
    maxConcurrent: configStore.get("maxConcurrent"),
  };

  // Always return the config, let validate.js handle the validation and prompting
  return config;
}

/**
 * Save configuration to the config store
 * @param {Object} config - Configuration to save
 */
export function saveConfig(config) {
  for (const [key, value] of Object.entries(config)) {
    if (value !== undefined) {
      configStore.set(key, value);
    }
  }
}

/**
 * Clear stored configuration
 */
export function clearConfig() {
  configStore.clear();
}
