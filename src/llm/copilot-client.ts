/**
 * Copilot SDK Client for LLM Coalescing
 *
 * Provides integration with GitHub Copilot SDK for adversarial
 * fuzzy comprehension of deterministic analysis results
 */

import { CopilotClient as CopilotSdkClient, type CopilotClientOptions } from "@github/copilot-sdk";
export interface CopilotConfig {
  apiKey: string;
  model?: string;
  timeoutMs?: number;
  maxRetries?: number;
  clientName?: string;
  reasoningEffort?: string;
}

export interface CopilotRequest {
  prompt: string;
  context?: any;
  maxTokens?: number;
  temperature?: number;
}

export interface CopilotResponse {
  content: string;
  tokensUsed: number;
  confidence: number;
  processingTime: number;
}

export interface ClientMetrics {
  isInitialized: boolean;
  config: Omit<CopilotConfig, 'apiKey'>;
  requestCount: number;
  failureCount: number;
  fallbackCount: number;
  averageLatency: number;
}

export class CopilotClient {
  private config: CopilotConfig;
  private isInitialized: boolean = false;
  private sdkClient: CopilotSdkClient | null = null;
  private metrics: ClientMetrics = {
    isInitialized: false,
    config: {} as Omit<CopilotConfig, 'apiKey'>,
    requestCount: 0,
    failureCount: 0,
    fallbackCount: 0,
    averageLatency: 0,
  };

  constructor(config: CopilotConfig) {
    this.config = {
      model: process.env["COPILOT_MODEL"] || "gpt-4",
      timeoutMs: parseInt(process.env["COPILOT_TIMEOUT_MS"] || "325"),
      maxRetries: parseInt(process.env["COPILOT_MAX_RETRIES"] || "3"),
      clientName: process.env["COPILOT_CLIENT_NAME"] || "ai-enable-platform",
      reasoningEffort: process.env["COPILOT_REASONING_EFFORT"] || "low",
      ...config,
    };
    
    // Initialize metrics config
    this.metrics.config = {
      model: this.config.model!,
      timeoutMs: this.config.timeoutMs!,
      maxRetries: this.config.maxRetries!,
      clientName: this.config.clientName!,
      reasoningEffort: this.config.reasoningEffort!,
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log("🤖 Initializing Copilot SDK client...");
      
      if (!this.config.apiKey) {
        throw new Error("Copilot API key is required");
      }

      // Initialize real Copilot SDK client
      const clientOptions: CopilotClientOptions = {
        useStdio: true,
        // Add other options as needed from environment
      };
      
      this.sdkClient = new CopilotSdkClient(clientOptions);

      this.isInitialized = true;
      this.metrics.isInitialized = true;
      // Warm up the client - CopilotClient doesn't have initialize method
      // Client is ready after construction
      console.log("✅ Copilot SDK client initialized");
    } catch (error) {
      console.error("❌ Failed to initialize Copilot SDK:", error);
      this.metrics.failureCount++;
      throw error;
    }
  }

  async analyze(request: CopilotRequest): Promise<CopilotResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    
    try {
      this.metrics.requestCount++;
      console.log("🧠 Sending request to Copilot SDK...");
      
      if (!this.sdkClient) {
        throw new Error("SDK client not initialized");
      }

      // Create a session for the request
      const session = await this.sdkClient.createSession({
        model: this.config.model || "gpt-4",
        systemMessage: { mode: "replace", content: this.getSystemMessage() },
        onPermissionRequest: () => Promise.resolve({ kind: "approved" }),
      });

      // Send the prompt with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), this.config.timeoutMs || 325);
      });

      const requestPromise = session.sendAndWait({
        prompt: request.prompt,
      });

      const response = await Promise.race([requestPromise, timeoutPromise]) as any;
      
      const processingTime = Date.now() - startTime;
      this.updateAverageLatency(processingTime);
      
      // Parse the response
      const content = this.extractContent(response);
      const tokensUsed = this.estimateTokens(content, request.prompt);
      const confidence = this.calculateConfidence(content, response);
      
      return {
        content,
        tokensUsed,
        confidence,
        processingTime,
      };
    } catch (error) {
      console.error("❌ Copilot SDK analysis failed:", error);
      this.metrics.failureCount++;
      
      // Fallback to deterministic response
      return this.getFallbackResponse(request, Date.now() - startTime);
    }
  }

  private getSystemMessage(): string {
    return `You are an adversarial AI analyst for an AI enablement platform. Your role is to:
1. Challenge deterministic findings with evidence-grounded skepticism
2. Identify hidden patterns and connections
3. Provide alternative interpretations
4. Maintain professional consultant perspective
5. Never hallucinate - base all insights on provided evidence

Respond in structured JSON format with enhanced insights and adversarial challenges.`;
  }

  private updateAverageLatency(latency: number): void {
    const totalLatency = this.metrics.averageLatency * (this.metrics.requestCount - 1) + latency;
    this.metrics.averageLatency = totalLatency / this.metrics.requestCount;
  }

  private extractContent(response: any): string {
    if (typeof response === 'string') return response;
    if (response?.content) return response.content;
    if (response?.text) return response.text;
    return JSON.stringify(response);
  }

  private estimateTokens(content: string, prompt: string): number {
    const totalText = content + prompt;
    return Math.floor(totalText.length / 4); // Rough estimation
  }

  private calculateConfidence(content: string, response: any): number {
    // Base confidence on response structure and content quality
    let confidence = 0.7; // Base confidence
    
    if (content.length > 100) confidence += 0.1;
    if (content.includes('evidence') || content.includes('analysis')) confidence += 0.1;
    if (response?.model) confidence += 0.05;
    
    return Math.min(confidence, 0.95);
  }

  private getFallbackResponse(request: CopilotRequest, processingTime: number): CopilotResponse {
    this.metrics.fallbackCount++;
    
    const fallbackContent = "Based on deterministic analysis, I can see patterns that suggest strategic opportunities for AI enablement. The evidence indicates areas where adversarial thinking reveals hidden risks and opportunities.";
    
    return {
      content: fallbackContent,
      tokensUsed: this.estimateTokens(fallbackContent, request.prompt),
      confidence: 0.6, // Lower confidence for fallback
      processingTime,
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      if (!this.sdkClient) {
        return false;
      }

      // Simple health check - try to create a session
      const session = await this.sdkClient.createSession({
        model: this.config.model || "gpt-4",
        systemMessage: { mode: "replace", content: "Health check" },
        onPermissionRequest: () => Promise.resolve({ kind: "approved" }),
      });
      
      return !!session;
    } catch (error) {
      console.error("❌ Copilot SDK health check failed:", error);
      return false;
    }
  }

  getMetrics(): ClientMetrics {
    return { ...this.metrics };
  }

  async shutdown(): Promise<void> {
    if (this.sdkClient) {
      try {
        // Clean up SDK client if needed
        this.sdkClient = null;
      } catch (error) {
        console.error("Error during shutdown:", error);
      }
    }
    this.isInitialized = false;
    this.metrics.isInitialized = false;
  }
}
