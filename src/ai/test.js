/**
 * Test module for verifying AI provider connectivity
 */
import OpenAI from "openai";

// Simple test prompt
const TEST_PROMPT = "What model are you? What is the Capital of France?";

/**
 * Test the AI connection with a simple prompt
 * @param {Object} config - Configuration object
 * @returns {Object} Result object with test details
 */
export async function testAIConnection(config) {
  // Get the start time to measure response time
  const startTime = Date.now();

  // Get provider and model info
  const provider = config.aiProvider || "openai";

  let model, apiKey, client, baseURL;

  // Configure based on provider
  if (provider === "openai") {
    model = config.openai?.model || "gpt-4.1-mini";
    apiKey = config.openai?.apiKey || process.env.OPENAI_API_KEY;
    baseURL = undefined; // Use default OpenAI URL
  } else if (provider === "openrouter") {
    model = config.openrouter?.model || "meta-llama/llama-4-maverick:free";
    apiKey = config.openrouter?.apiKey || process.env.OPENROUTER_API_KEY;
    baseURL = "https://openrouter.ai/api/v1";
  } else {
    throw new Error(`Unknown provider: ${provider}`);
  }

  // Check if API key exists
  if (!apiKey) {
    throw new Error(
      `No API key found for ${provider}. Run 'commitstudio config' to set it up.`,
    );
  }

  // Initialize OpenAI client
  client = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
    defaultHeaders:
      provider === "openrouter"
        ? {
            "HTTP-Referer": "https://commitstud.io",
            "X-Title": "CommitStudio",
          }
        : undefined,
  });

  // Send test request
  const response = await client.chat.completions.create({
    model: model,
    messages: [
      {
        role: "system",
        content:
          "You are a commit message assistant that keeps responses extremely brief.",
      },
      { role: "user", content: TEST_PROMPT },
    ],
    max_tokens: 20,
    temperature: 0.7,
  });

  // Calculate response time
  const responseTime = Date.now() - startTime;

  // Extract the response
  const aiResponse =
    response.choices[0]?.message?.content?.trim() || "No response received";

  // Return full result object
  return {
    success: true,
    provider: provider,
    model: model,
    prompt: TEST_PROMPT,
    response: aiResponse,
    responseTime,
    details: {
      model: response.model,
      usage: response.usage,
      id: response.id,
    },
  };
}
