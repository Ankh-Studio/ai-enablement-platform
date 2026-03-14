/**
 * Base Persona Class
 *
 * Abstract base class for all expert personas providing
 * common functionality and interface definitions
 */

import {
  LLMResponse,
  PersonaConfig,
  PersonaContext,
  PersonaInsight,
  PersonaMetrics,
  PersonaResponse,
  PersonaType,
} from "../types/persona";

export abstract class BasePersona {
  protected personaConfig: PersonaConfig;
  protected personaMetrics: PersonaMetrics;

  constructor(config: PersonaConfig) {
    this.personaConfig = config;
    this.personaMetrics = {
      insightsGenerated: 0,
      averageConfidence: 0,
      responseTime: 0,
    };
  }

  // Abstract methods that must be implemented by concrete personas
  abstract generateInsights(context: PersonaContext): Promise<PersonaInsight[]>;
  abstract generatePrompt(context: PersonaContext): string;
  abstract processLLMResponse(response: LLMResponse): PersonaResponse;

  // Common functionality for all personas
  async analyze(context: PersonaContext): Promise<PersonaResponse> {
    const startTime = Date.now();

    try {
      // Generate persona-specific insights
      const insights = await this.generateInsights(context);

      // Generate summary and next steps
      const summary = this.generateSummary(insights, context);
      const nextSteps = this.generateNextSteps(insights, context);

      // Calculate confidence based on insight quality
      const confidence = this.calculateConfidence(insights);

      // Update metrics
      this.updateMetrics(insights, Date.now() - startTime);

      return {
        persona: this.personaConfig.type,
        insights,
        summary,
        nextSteps,
        timeframe: this.estimateTimeframe(insights),
        perspective: this.getPerspective(),
        confidence,
      };
    } catch (error) {
      console.error(
        `Error in ${this.personaConfig.type} persona analysis:`,
        error,
      );
      throw error;
    }
  }

  protected generateSummary(
    insights: PersonaInsight[],
    context: PersonaContext,
  ): string {
    const criticalInsights = insights.filter((i) => i.priority === "critical");
    const highPriorityInsights = insights.filter((i) => i.priority === "high");

    let summary = `Based on the ${context.repository} analysis, `;

    if (criticalInsights.length > 0) {
      summary += `there are ${criticalInsights.length} critical issues requiring immediate attention. `;
    }

    if (highPriorityInsights.length > 0) {
      summary += `${highPriorityInsights.length} high-priority areas need focus. `;
    }

    summary += `Overall readiness is ${context.scores.overallMaturity}/8, indicating ${this.getMaturityLevel(context.scores.overallMaturity)} maturity.`;

    return summary;
  }

  protected generateNextSteps(
    insights: PersonaInsight[],
    context: PersonaContext,
  ): string[] {
    const sortedInsights = insights.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    return sortedInsights
      .slice(0, 5) // Top 5 recommendations
      .map((insight) => insight.title);
  }

  protected estimateTimeframe(insights: PersonaInsight[]): string {
    const criticalCount = insights.filter(
      (i) => i.priority === "critical",
    ).length;
    const highCount = insights.filter((i) => i.priority === "high").length;

    if (criticalCount > 0) return "1-2 weeks (critical issues)";
    if (highCount > 2) return "3-4 weeks";
    if (highCount > 0) return "2-3 weeks";
    return "1-2 months";
  }

  protected calculateConfidence(
    insights: PersonaInsight[],
  ): "high" | "medium" | "low" {
    if (insights.length === 0) return "low";

    const avgConfidence =
      insights.reduce((sum, insight) => sum + insight.confidence, 0) /
      insights.length;
    const highConfidenceCount = insights.filter(
      (i) => i.confidence >= 80,
    ).length;
    const ratio = highConfidenceCount / insights.length;

    if (avgConfidence >= 80 && ratio >= 0.7) return "high";
    if (avgConfidence >= 60 && ratio >= 0.4) return "medium";
    return "low";
  }

  protected getMaturityLevel(score: number): string {
    if (score >= 6) return "advanced";
    if (score >= 4) return "developing";
    if (score >= 2) return "basic";
    return "initial";
  }

  protected updateMetrics(
    insights: PersonaInsight[],
    responseTime: number,
  ): void {
    this.personaMetrics.insightsGenerated += insights.length;
    this.personaMetrics.responseTime = responseTime;

    if (insights.length > 0) {
      const avgConfidence =
        insights.reduce((sum, insight) => sum + insight.confidence, 0) /
        insights.length;
      this.personaMetrics.averageConfidence =
        (this.personaMetrics.averageConfidence + avgConfidence) / 2;
    }
  }

  protected getPerspective(): string {
    return this.personaConfig.description;
  }

  // Helper methods for creating insights
  protected createInsight(
    type: PersonaInsight["type"],
    title: string,
    description: string,
    evidence: string[],
    confidence: number,
    priority: PersonaInsight["priority"],
    category: PersonaInsight["category"],
  ): PersonaInsight {
    return {
      id: `${this.personaConfig.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      description,
      evidence,
      confidence,
      priority,
      category,
    };
  }

  // Getters
  get type(): PersonaType {
    return this.personaConfig.type;
  }

  get config(): PersonaConfig {
    return this.personaConfig;
  }

  get metrics(): PersonaMetrics {
    return this.personaMetrics;
  }
}
