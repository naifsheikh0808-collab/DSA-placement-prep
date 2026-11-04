// AI Provider Abstraction Layer
// Minimal server-side interface for supported AI providers

export interface AiProviderConfig {
  provider: "gemini" | "mock";
  apiKey?: string;
  model?: string;
}

export interface AiProvider {
  name: string;
  generateContent(prompt: string, systemInstruction?: string): Promise<string>;
  isConfigured(): boolean;
}

// Mock provider for development/testing - deterministic responses
export class MockAiProvider implements AiProvider {
  name = "mock";

  isConfigured(): boolean {
    return true;
  }

  async generateContent(prompt: string, systemInstruction?: string): Promise<string> {
    // Deterministic mock responses for testing planner workflows
    const lower = prompt.toLowerCase();
    if (lower.includes("plan") || lower.includes("roadmap")) {
      return "This is a **simulated** AI response for testing. In production, the AI would generate a personalized study plan based on your profile and progress data.";
    }
    if (lower.includes("revision") || lower.includes("revise")) {
      return "This is a **simulated** revision recommendation. In production, the AI would analyze your weak patterns and suggest specific problems to revisit.";
    }
    return "This is a **simulated** AI response. The mock provider is for development testing only and does not make live API calls.";
  }
}

// Gemini provider (default)
export class GeminiAiProvider implements AiProvider {
  name = "gemini";
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = "gemini-2.5-flash") {
    this.apiKey = apiKey;
    this.model = model;
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  async generateContent(prompt: string, systemInstruction?: string): Promise<string> {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(this.apiKey);
    const model = genAI.getGenerativeModel({
      model: this.model,
      ...(systemInstruction ? { systemInstruction } : {}),
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}

// Provider factory
export function createAiProvider(config: AiProviderConfig): AiProvider {
  switch (config.provider) {
    case "mock":
      return new MockAiProvider();
    case "gemini":
      if (!config.apiKey) {
        throw new Error("Gemini API key is required");
      }
      return new GeminiAiProvider(config.apiKey, config.model);
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}

// Get provider from environment or user config
export function getDefaultProvider(): AiProvider {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    return new GeminiAiProvider(apiKey);
  }
  // Fallback to mock in development only
  if (process.env.NODE_ENV === "development") {
    return new MockAiProvider();
  }
  throw new Error("No AI provider configured");
}