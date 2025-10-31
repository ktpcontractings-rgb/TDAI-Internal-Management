import OpenAI from "openai";

/**
 * LLM Integration for TDAI Management Agents
 * Uses real OpenAI API for intelligent reasoning
 */

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMRequest {
  messages: LLMMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  choices: Array<{
    message: {
      role: string;
      content: string | null;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Invoke LLM for agent reasoning
 */
export async function invokeLLM(request: LLMRequest): Promise<LLMResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: request.model || "gpt-4.1-mini",
      messages: request.messages,
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 2000,
    });

    return {
      choices: response.choices.map((choice) => ({
        message: {
          role: choice.message.role,
          content: choice.message.content,
        },
        finish_reason: choice.finish_reason || "stop",
      })),
      usage: response.usage
        ? {
            prompt_tokens: response.usage.prompt_tokens,
            completion_tokens: response.usage.completion_tokens,
            total_tokens: response.usage.total_tokens,
          }
        : undefined,
    };
  } catch (error) {
    console.error("Error invoking LLM:", error);
    throw new Error(`LLM invocation failed: ${error}`);
  }
}

/**
 * Generate embeddings for text (for Pinecone)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text.substring(0, 8000), // Limit to 8k chars
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error(`Embedding generation failed: ${error}`);
  }
}

export default {
  invokeLLM,
  generateEmbedding,
};
