/**
 * LLM Coalescer - Adversarial Fuzzy Comprehension
 *
 * Orchestrates LLM-based coalescing of deterministic analysis results
 * with adversarial validation to challenge and enhance insights
 */

import type { PersonaContext, PersonaInsight } from '../types/persona';
import type { CopilotClient } from './copilot-client';
import { ResponseProcessor } from './response-processor';
import type {
  EvidenceReference,
  StructuredAdversarialResponse,
} from './structured-types';

export interface CoalescingConfig {
  enableAdversarialValidation: boolean;
  confidenceThreshold: number;
  maxTokens: number;
  temperature: number;
  enableStructuredOutput?: boolean;
  requireEvidenceGrounding?: boolean;
}

export interface CoalescingResult {
  enhancedInsights: PersonaInsight[];
  adversarialChallenges: string[];
  confidenceScore: number;
  processingTime: number;
  tokensUsed: number;
}

export class LLMCoalescer {
  private copilotClient: CopilotClient;
  private config: CoalescingConfig;

  constructor(
    copilotClient: CopilotClient,
    config: Partial<CoalescingConfig> = {},
  ) {
    this.copilotClient = copilotClient;
    this.config = {
      enableAdversarialValidation: true,
      confidenceThreshold: 0.7,
      maxTokens: 500,
      temperature: 0.3,
      enableStructuredOutput: true,
      requireEvidenceGrounding: true,
      ...config,
    };
  }

  async coalescePersonaInsights(
    deterministicInsights: PersonaInsight[],
    context: PersonaContext,
    personaType: string,
  ): Promise<CoalescingResult> {
    const startTime = Date.now();

    try {
      console.log(
        `🧠 Coalescing ${personaType} insights with adversarial validation...`,
      );

      // Step 1: Generate coalescing prompt with adversarial elements
      const prompt = this.buildCoalescingPrompt(
        deterministicInsights,
        context,
        personaType,
      );

      // Step 2: Get LLM response
      const llmResponse = await this.copilotClient.analyze({
        prompt,
        context,
        maxTokens: this.config.maxTokens,
        temperature: this.config.temperature,
      });

      // Step 3: Process LLM response with structured parsing
      const processedResponse = this.config.enableStructuredOutput
        ? ResponseProcessor.parseStructuredResponse(llmResponse.content)
        : ResponseProcessor.parseCoalescingResponse(llmResponse.content);

      // Step 4: Extract enhanced insights and validate evidence grounding
      const enhancedInsights = this.processStructuredResponse(
        processedResponse,
        deterministicInsights,
      );

      // Step 5: Adversarial validation
      const adversarialChallenges = this.config.enableAdversarialValidation
        ? this.performAdversarialValidation(
            enhancedInsights,
            deterministicInsights,
            context,
          )
        : [];

      // Step 6: Calculate confidence score
      const confidenceScore = this.calculateConfidenceScore(
        enhancedInsights,
        adversarialChallenges,
        llmResponse.confidence,
        processedResponse.structuredResponse,
      );

      const processingTime = Date.now() - startTime;

      return {
        enhancedInsights,
        adversarialChallenges,
        confidenceScore,
        processingTime,
        tokensUsed: llmResponse.tokensUsed,
      };
    } catch (error) {
      console.error('❌ LLM coalescing failed:', error);
      // Fallback to deterministic insights
      return {
        enhancedInsights: deterministicInsights,
        adversarialChallenges: [],
        confidenceScore: 0.5,
        processingTime: Date.now() - startTime,
        tokensUsed: 0,
      };
    }
  }

  private buildCoalescingPrompt(
    insights: PersonaInsight[],
    context: PersonaContext,
    personaType: string,
  ): string {
    const insightsText = insights
      .map(
        (insight, index) =>
          `${index + 1}. ${insight.title} (${insight.priority}): ${insight.description}`,
      )
      .join('\n');

    const scoresText = `
Repository Readiness: ${context.scores.repoReadiness}/100
Team Readiness: ${context.scores.teamReadiness}/100
Organization Readiness: ${context.scores.orgReadiness}/100
Overall Maturity: ${context.scores.overallMaturity}/8
    `.trim();

    return `As a ${personaType} AI expert, perform adversarial analysis on these deterministic insights:

DETERMINISTIC INSIGHTS:
${insightsText}

ASSESSMENT SCORES:
${scoresText}

ADVERSARIAL ANALYSIS TASK:
1. Challenge these insights - what might be missing or incorrect?
2. Identify hidden patterns or connections between insights
3. Question the confidence levels and priorities
4. Suggest alternative interpretations of the evidence
5. Highlight potential risks not captured in the deterministic analysis

RESPONSE FORMAT:
Provide your analysis in this exact format:

ENHANCED_INSIGHTS:
- [Enhanced insight 1 with adversarial perspective]
- [Enhanced insight 2 with additional evidence]
- [Enhanced insight 3 with risk identification]

ADVERSARIAL_CHALLENGES:
- [Challenge to deterministic finding 1]
- [Challenge to deterministic finding 2]
- [Question about evidence or methodology]

CONFIDENCE_ASSESSMENT:
[Overall confidence in the enhanced analysis and key uncertainties]

Focus on being constructively critical while maintaining evidence-based reasoning. Do not hallucinate - base all challenges on the provided evidence.`;
  }

  private processLLMResponse(
    llmContent: string,
    deterministicInsights: PersonaInsight[],
  ): PersonaInsight[] {
    const enhancedInsights: PersonaInsight[] = [];

    try {
      // Parse enhanced insights section
      const enhancedSection = llmContent.match(
        /ENHANCED_INSIGHTS:\s*\n([\s\S]*?)(?=\n\n|\n[A-Z_]+:|$)/,
      );
      if (enhancedSection?.[1]) {
        const insightLines = enhancedSection[1]
          .split('\n')
          .filter((line) => line.trim().startsWith('-'))
          .map((line) => line.replace(/^-\s*/, '').trim());

        insightLines.forEach((insightText, index) => {
          if (
            index < deterministicInsights.length &&
            deterministicInsights[index]
          ) {
            const original = deterministicInsights[index];
            enhancedInsights.push({
              ...original,
              description: insightText,
              confidence: Math.min(original.confidence + 10, 100), // Boost confidence slightly
            });
          }
        });
      }
    } catch (error) {
      console.warn(
        '⚠️ Failed to parse LLM response, using deterministic insights',
      );
      return deterministicInsights;
    }

    return enhancedInsights.length > 0
      ? enhancedInsights
      : deterministicInsights;
  }

  private performAdversarialValidation(
    enhancedInsights: PersonaInsight[],
    deterministicInsights: PersonaInsight[],
    context: PersonaContext,
  ): string[] {
    const challenges: string[] = [];

    // Challenge 1: Evidence consistency
    const evidenceOverlap = this.calculateEvidenceOverlap(
      enhancedInsights,
      deterministicInsights,
    );
    if (evidenceOverlap < 0.8) {
      challenges.push(
        'Enhanced insights introduce evidence not present in deterministic analysis - potential hallucination risk',
      );
    }

    // Challenge 2: Confidence inflation
    const confidenceInflation = this.calculateConfidenceInflation(
      enhancedInsights,
      deterministicInsights,
    );
    if (confidenceInflation > 0.2) {
      challenges.push(
        'LLM may be overconfident - confidence scores appear inflated without additional evidence',
      );
    }

    // Challenge 3: Priority consistency
    const priorityShifts = this.calculatePriorityShifts(
      enhancedInsights,
      deterministicInsights,
    );
    if (priorityShifts > 0.3) {
      challenges.push(
        'Significant priority changes detected - verify if LLM interpretation is justified by evidence',
      );
    }

    // Challenge 4: Contextual relevance
    if (
      context.scores.orgReadiness < 30 &&
      enhancedInsights.some((i) => i.category === 'strategy')
    ) {
      challenges.push(
        'Strategic insights may be premature given low organizational readiness',
      );
    }

    return challenges;
  }

  private calculateEvidenceOverlap(
    enhanced: PersonaInsight[],
    deterministic: PersonaInsight[],
  ): number {
    const enhancedEvidence = new Set(enhanced.flatMap((i) => i.evidence));
    const deterministicEvidence = new Set(
      deterministic.flatMap((i) => i.evidence),
    );

    if (deterministicEvidence.size === 0) return 0;

    const intersection = new Set(
      [...enhancedEvidence].filter((x) => deterministicEvidence.has(x)),
    );
    return intersection.size / deterministicEvidence.size;
  }

  private calculateConfidenceInflation(
    enhanced: PersonaInsight[],
    deterministic: PersonaInsight[],
  ): number {
    const enhancedAvg =
      enhanced.reduce((sum, i) => sum + i.confidence, 0) / enhanced.length;
    const deterministicAvg =
      deterministic.reduce((sum, i) => sum + i.confidence, 0) /
      deterministic.length;

    return (enhancedAvg - deterministicAvg) / 100;
  }

  private calculatePriorityShifts(
    enhanced: PersonaInsight[],
    deterministic: PersonaInsight[],
  ): number {
    const priorityOrder: { [key: string]: number } = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };
    let shifts = 0;

    for (let i = 0; i < Math.min(enhanced.length, deterministic.length); i++) {
      const enhancedPriority = priorityOrder[enhanced[i]?.priority || 'medium'];
      const deterministicPriority =
        priorityOrder[deterministic[i]?.priority || 'medium'];
      if (enhancedPriority !== deterministicPriority) {
        shifts++;
      }
    }

    return deterministic.length > 0 ? shifts / deterministic.length : 0;
  }

  private calculateConfidenceScore(
    enhancedInsights: PersonaInsight[],
    adversarialChallenges: string[],
    llmConfidence: number,
    structuredResponse?: StructuredAdversarialResponse,
  ): number {
    let score = llmConfidence;

    // Reduce confidence based on adversarial challenges
    score -= adversarialChallenges.length * 0.1;

    // Boost confidence if enhanced insights are well-structured
    if (enhancedInsights.every((i) => i.confidence >= 70)) {
      score += 0.1;
    }

    // Adjust based on evidence grounding if structured response available
    if (structuredResponse?.evidenceValidation) {
      const groundingScore =
        structuredResponse.evidenceValidation.groundingScore;
      score = score * 0.7 + groundingScore * 0.3; // Weight evidence grounding
    }

    return Math.max(0, Math.min(1, score));
  }

  private processStructuredResponse(
    processedResponse: any,
    deterministicInsights: PersonaInsight[],
  ): PersonaInsight[] {
    if (!processedResponse.structuredResponse) {
      // Fallback to original processing
      return this.processLLMResponse(
        processedResponse.rawContent,
        deterministicInsights,
      );
    }

    const structured = processedResponse.structuredResponse;
    const enhancedInsights: PersonaInsight[] = [];

    // Convert structured insights to PersonaInsight format
    structured.insights.forEach((insight: any) => {
      const personaInsight: PersonaInsight = {
        id: `enhanced-${insight.id}`,
        type: 'analysis',
        title: insight.title,
        description: insight.description,
        priority: insight.priority,
        confidence: Math.round(insight.confidence * 100), // Convert to 0-100 scale
        category: this.mapCategoryToPersona(insight.category) as
          | 'strategy'
          | 'technical'
          | 'process'
          | 'cultural'
          | 'risk',
        evidence: insight.evidenceIds || [],
      };

      enhancedInsights.push(personaInsight);
    });

    return enhancedInsights;
  }

  private mapCategoryToPersona(
    category: string,
  ): 'strategy' | 'technical' | 'process' | 'cultural' | 'risk' {
    const categoryMap: {
      [key: string]: 'strategy' | 'technical' | 'process' | 'cultural' | 'risk';
    } = {
      strategy: 'strategy',
      risk: 'risk',
      opportunity: 'strategy',
      implementation: 'technical',
    };
    return categoryMap[category] || 'strategy';
  }

  private createEvidenceReferences(): EvidenceReference[] {
    // For now, return empty evidence references
    // In a full implementation, this would extract evidence from the context
    return [];
  }

  async healthCheck(): Promise<boolean> {
    try {
      return await this.copilotClient.healthCheck();
    } catch (error) {
      console.error('❌ LLM coalescer health check failed:', error);
      return false;
    }
  }

  getMetrics(): {
    config: CoalescingConfig;
    copilotMetrics: any;
  } {
    return {
      config: this.config,
      copilotMetrics: this.copilotClient.getMetrics(),
    };
  }
}
