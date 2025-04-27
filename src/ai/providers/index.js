import { openai as OpenAIClient } from "@ai-sdk/openai";
import {
  AVAILABLE_AI_MODELS,
  DEFAULT_SETTINGS,
} from "../../config/constants.js";

/**
 * OpenRouter implementation using Vercel AI SDK model format
 */
export function openRouter(apiKey, options = {}) {
  const { model = "meta-llama/llama-4-maverick:free" } = options;

  if (!apiKey) {
    throw new Error(
      "OpenRouter requires an API key. Sign up for a free key at https://openrouter.ai/settings/keys",
    );
  }

  // Set required headers for OpenRouter
  const headers = {
    "HTTP-Referer": "https://commitstud.io",
    "X-Title": "CommitStudio",
  };

  return {
    id: model,
    provider: "openrouter",
    protocol: "openai",
    auth: {
      apiKey: apiKey,
    },
    baseURL: "https://openrouter.ai/api/v1",
    headers,
  };
}

/**
 * AI Provider Manager
 * Handles the configuration and instantiation of different AI providers
 */
export class AIProviderManager {
  /**
   * Get the appropriate AI model client based on configuration
   *
   * @param {Object} config - The provider configuration
   * @returns {Object} - The configured AI model client
   */
  static getProvider(config) {
    // Default to OpenAI if no provider specified
    const provider = config?.provider || "openai";
    const model = config?.model || DEFAULT_SETTINGS.openaiModel;
    const apiKey = config?.apiKey;

    switch (provider.toLowerCase()) {
      case "openrouter":
        // Use OpenRouter as provider
        return openRouter(apiKey, { model });

      case "openai":
      default:
        // Use OpenAI as provider with the specified model
        return OpenAIClient(model, { apiKey });
    }
  }

  /**
   * Get available models for the specified provider
   *
   * @param {string} provider - The provider name
   * @returns {Array} - Array of available models
   */
  static getAvailableModels(provider) {
    switch (provider.toLowerCase()) {
      case "openrouter":
        return [
          "meta-llama/llama-4-maverick:free",
          "meta-llama/llama-4-pro:free",
          "anthropic/claude-3-opus",
          "anthropic/claude-3-sonnet",
        ];

      case "openai":
      default:
        return AVAILABLE_AI_MODELS;
    }
  }
}

/**
 * Provider options for configuration UI
 */
export const PROVIDER_OPTIONS = [
  {
    name: "openrouter",
    displayName: "OpenRouter (Free - Llama 4 Maverick)",
    description: "Free AI model - no API key required to start",
    requiresApiKey: false,
  },
  {
    name: "openai",
    displayName: "OpenAI (Premium models)",
    description: "Best performance, requires API key",
    requiresApiKey: true,
  },
];
