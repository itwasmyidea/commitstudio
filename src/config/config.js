import { createRequire } from "module";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import Conf from "conf";
import { config as dotenvConfig } from "dotenv";
import z from "zod";
import { AVAILABLE_AI_MODELS, DEFAULT_SETTINGS } from "./constants.js";

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
  openaiModel: z.string().default(DEFAULT_SETTINGS.openaiModel),
  maxTokens: z.number().int().positive().default(DEFAULT_SETTINGS.maxTokens),
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
    openaiModel: {
      type: "string",
      default: DEFAULT_SETTINGS.openaiModel,
    },
    maxTokens: {
      type: "number",
      default: DEFAULT_SETTINGS.maxTokens,
    },
  },
});

/**
 * Load configuration from environment variables and config store
 * @returns {Promise<Object>} Validated configuration
 */
export async function loadConfig() {
  // Get values from config store
  const githubToken = configStore.get("github.token");
  const openaiApiKey = configStore.get("openai.apiKey");
  const openaiModel = configStore.get("openaiModel") || DEFAULT_SETTINGS.openaiModel;
  const maxTokens = configStore.get("maxTokens") || DEFAULT_SETTINGS.maxTokens;

  // Priority: CLI options > env vars > config store
  const config = {
    github: {
      token: process.env.GITHUB_TOKEN || githubToken,
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || openaiApiKey,
      model: process.env.OPENAI_MODEL || openaiModel,
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || maxTokens, 10),
    },
    cacheEnabled: configStore.get("cacheEnabled"),
    cachePath: configStore.get("cachePath"),
    maxConcurrent: configStore.get("maxConcurrent"),
  };

  // Set global variables for other modules to use directly
  if (config.github?.token) {
    global.githubToken = config.github.token;
  }

  if (config.openai?.apiKey) {
    global.openaiApiKey = config.openai.apiKey;
  }

  // Always return the config, let validate.js handle the validation and prompting
  return config;
}

/**
 * Save configuration to the config store
 * @param {Object} config - Configuration to save
 */
export function saveConfig(config) {
  // Handle nested properties
  if (config.github?.token) {
    configStore.set("github.token", config.github.token);
  }

  if (config.openai?.apiKey) {
    configStore.set("openai.apiKey", config.openai.apiKey);
  }
  
  if (config.openai?.model) {
    configStore.set("openaiModel", config.openai.model);
  }
  
  if (config.openai?.maxTokens) {
    configStore.set("maxTokens", config.openai.maxTokens);
  }

  // Handle flat properties
  for (const [key, value] of Object.entries(config)) {
    if (value !== undefined && typeof value !== "object") {
      configStore.set(key, value);
    }
  }
}

/**
 * Get current configuration
 * @returns {Object} Current configuration
 */
export function getConfig() {
  return {
    github: {
      token: configStore.get("github.token") ? "********" : undefined,
    },
    openai: {
      apiKey: configStore.get("openai.apiKey") ? "********" : undefined,
      model: configStore.get("openaiModel") || DEFAULT_SETTINGS.openaiModel,
      maxTokens: configStore.get("maxTokens") || DEFAULT_SETTINGS.maxTokens,
    },
    cacheEnabled: configStore.get("cacheEnabled"),
    cachePath: configStore.get("cachePath"),
    maxConcurrent: configStore.get("maxConcurrent"),
  };
}

/**
 * Clear stored configuration
 */
export function clearConfig() {
  configStore.clear();
}
