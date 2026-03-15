/**
 * LLM Response Processor
 *
 * Handles structured parsing and validation of LLM responses
 * for adversarial coalescing with deterministic analysis
 */

import type { PersonaInsight } from '../types/persona';
import type {
  AdversarialInsight,
  CoalescingValidationResult,
  EvidenceReference,
  EvidenceValidation,
  StructuredAdversarialResponse,
  ValidationIssue,
} from './structured-types';

export interface ParsedLLMResponse {
  enhancedInsights: string[];
  adversarialChallenges: string[];
  confidenceAssessment: string;
  rawContent: string;
  structuredResponse?: StructuredAdversarialResponse | undefined;
}

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  issues: string[];
  suggestions: string[];
}

export class ResponseProcessor {
  private static readonly SECTION_PATTERNS = {
    enhancedInsights: /ENHANCED_INSIGHTS:\s*\n([\s\S]*?)(?=\n\n|\n[A-Z_]+:|$)/,
    adversarialChallenges:
      /ADVERSARIAL_CHALLENGES:\s*\n([\s\S]*?)(?=\n\n|\n[A-Z_]+:|$)/,
    confidenceAssessment:
      /CONFIDENCE_ASSESSMENT:\s*\n([\s\S]*?)(?=\n\n|\n[A-Z_]+:|$)/,
  };

  private static readonly VALIDATION_RESULT_PATTERN =
    /VALIDATION_RESULT:\s*(PASS|FAIL)/i;
  private static readonly VALIDATION_NOTES_PATTERN =
    /VALIDATION_NOTES:\s*\n([\s\S]*?)(?=\n\n|\n[A-Z_]+:|$)/;

  static parseCoalescingResponse(llmContent: string): ParsedLLMResponse {
    const enhancedInsights = ResponseProcessor.extractSection(
      llmContent,
      ResponseProcessor.SECTION_PATTERNS.enhancedInsights,
    );
    const adversarialChallenges = ResponseProcessor.extractSection(
      llmContent,
      ResponseProcessor.SECTION_PATTERNS.adversarialChallenges,
    );
    const confidenceAssessment = ResponseProcessor.extractSection(
      llmContent,
      ResponseProcessor.SECTION_PATTERNS.confidenceAssessment,
    );

    return {
      enhancedInsights,
      adversarialChallenges,
      confidenceAssessment: confidenceAssessment[0] || '',
      rawContent: llmContent,
    };
  }

  static parseValidationResponse(llmContent: string): ValidationResult {
    const resultMatch = llmContent.match(
      ResponseProcessor.VALIDATION_RESULT_PATTERN,
    );
    const notesMatch = llmContent.match(
      ResponseProcessor.VALIDATION_NOTES_PATTERN,
    );

    const isValid = resultMatch
      ? resultMatch[1]?.toUpperCase() === 'PASS'
      : false;
    const notes = notesMatch ? notesMatch[1]?.trim() || '' : '';

    const issues = ResponseProcessor.extractIssues(notes);
    const suggestions = ResponseProcessor.extractSuggestions(notes);
    const confidence = ResponseProcessor.calculateValidationConfidence(
      isValid,
      issues.length,
    );

    return {
      isValid,
      confidence,
      issues,
      suggestions,
    };
  }

  static processEnhancedInsights(
    enhancedTexts: string[],
    deterministicInsights: PersonaInsight[],
  ): PersonaInsight[] {
    const processedInsights: PersonaInsight[] = [];

    enhancedTexts.forEach((enhancedText, index) => {
      if (
        index < deterministicInsights.length &&
        deterministicInsights[index]
      ) {
        const original = deterministicInsights[index]!;
        const enhanced = ResponseProcessor.createEnhancedInsight(
          original,
          enhancedText,
        );
        processedInsights.push(enhanced);
      } else {
        // Create new insight from enhanced text
        const newInsight = ResponseProcessor.createNewInsight(
          enhancedText,
          index,
        );
        processedInsights.push(newInsight);
      }
    });

    return processedInsights;
  }

  static validateResponseStructure(
    parsed: ParsedLLMResponse,
  ): ValidationResult {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check required sections
    if (parsed.enhancedInsights.length === 0) {
      issues.push('No enhanced insights found');
      suggestions.push('Add at least one enhanced insight');
    }

    if (parsed.adversarialChallenges.length === 0) {
      issues.push('No adversarial challenges found');
      suggestions.push('Add at least one adversarial challenge');
    }

    if (!parsed.confidenceAssessment) {
      issues.push('No confidence assessment provided');
      suggestions.push('Add confidence assessment section');
    }

    // Check content quality
    if (parsed.enhancedInsights.some((insight) => insight.length < 20)) {
      issues.push('Some enhanced insights are too brief');
      suggestions.push('Provide more detailed insights');
    }

    if (
      parsed.adversarialChallenges.some((challenge) => challenge.length < 15)
    ) {
      issues.push('Some adversarial challenges are too brief');
      suggestions.push('Provide more substantive challenges');
    }

    const confidence = ResponseProcessor.calculateValidationConfidence(
      issues.length === 0,
      issues.length,
    );

    return {
      isValid: issues.length === 0,
      confidence,
      issues,
      suggestions,
    };
  }

  private static extractSection(content: string, pattern: RegExp): string[] {
    const match = content.match(pattern);
    if (!match || !match[1]) return [];

    return match[1]
      .split('\n')
      .filter((line) => line.trim().startsWith('-'))
      .map((line) => line.replace(/^-\s*/, '').trim())
      .filter((line) => line.length > 0);
  }

  private static extractIssues(notes: string): string[] {
    if (!notes) return [];

    const issuePatterns = [
      /missing/gi,
      /not found/gi,
      /incomplete/gi,
      /unclear/gi,
      /vague/gi,
      /insufficient/gi,
    ];

    const issues: string[] = [];
    issuePatterns.forEach((pattern) => {
      if (pattern.test(notes)) {
        issues.push(notes);
      }
    });

    return issues.length > 0 ? issues : [notes];
  }

  private static extractSuggestions(notes: string): string[] {
    const suggestionPatterns = [
      /should/gi,
      /recommend/gi,
      /consider/gi,
      /add/gi,
      /include/gi,
      /provide/gi,
    ];

    const suggestions: string[] = [];
    suggestionPatterns.forEach((pattern) => {
      if (pattern.test(notes)) {
        suggestions.push(notes);
      }
    });

    return suggestions.length > 0 ? suggestions : ['Review response structure'];
  }

  private static calculateValidationConfidence(
    isValid: boolean,
    issueCount: number,
  ): number {
    let confidence = isValid ? 0.9 : 0.5;
    confidence -= issueCount * 0.1;
    return Math.max(0, Math.min(1, confidence));
  }

  private static createEnhancedInsight(
    original: PersonaInsight,
    enhancedText: string,
  ): PersonaInsight {
    return {
      ...original,
      description: enhancedText,
      confidence: Math.min(original.confidence + 5, 100), // Slight confidence boost
    };
  }

  private static createNewInsight(
    enhancedText: string,
    index: number,
  ): PersonaInsight {
    return {
      id: `llm-enhanced-${Date.now()}-${index}`,
      type: 'analysis',
      title: ResponseProcessor.extractTitleFromText(enhancedText),
      description: enhancedText,
      evidence: [], // LLM should not add new evidence
      confidence: 70, // Default confidence for new insights
      priority: 'medium',
      category: 'strategy',
    };
  }

  private static extractTitleFromText(text: string): string {
    // Extract first sentence or create title from first 50 characters
    const sentences = text.split(/[.!?]/);
    const firstSentence = sentences[0]?.trim() || '';
    if (firstSentence.length <= 50) {
      return firstSentence;
    }
    return `${text.substring(0, 50).trim()}...`;
  }

  static sanitizeResponse(content: string): string {
    // Remove any potentially harmful content
    return content
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  static extractMetrics(parsed: ParsedLLMResponse): {
    insightCount: number;
    challengeCount: number;
    averageInsightLength: number;
    averageChallengeLength: number;
    hasConfidenceAssessment: boolean;
  } {
    const insightCount = parsed.enhancedInsights.length;
    const challengeCount = parsed.adversarialChallenges.length;
    const averageInsightLength =
      insightCount > 0
        ? parsed.enhancedInsights.reduce(
            (sum, insight) => sum + insight.length,
            0,
          ) / insightCount
        : 0;
    const averageChallengeLength =
      challengeCount > 0
        ? parsed.adversarialChallenges.reduce(
            (sum, challenge) => sum + challenge.length,
            0,
          ) / challengeCount
        : 0;
    const hasConfidenceAssessment = parsed.confidenceAssessment.length > 0;

    return {
      insightCount,
      challengeCount,
      averageInsightLength,
      averageChallengeLength,
      hasConfidenceAssessment,
    };
  }

  // Structured JSON parsing methods
  static parseStructuredResponse(llmContent: string): ParsedLLMResponse {
    try {
      // Try to parse as JSON first
      const jsonMatch = llmContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const structuredResponse = JSON.parse(
          jsonMatch[0],
        ) as StructuredAdversarialResponse;

        return {
          enhancedInsights: structuredResponse.insights.map(
            (i) => i.description,
          ),
          adversarialChallenges: structuredResponse.insights.map(
            (i) => i.adversarialChallenge,
          ),
          confidenceAssessment: `Confidence: ${(structuredResponse.confidence * 100).toFixed(1)}%`,
          rawContent: llmContent,
          structuredResponse,
        };
      }
    } catch (error) {
      console.warn('Failed to parse structured JSON response:', error);
    }

    // Fallback to original parsing
    return ResponseProcessor.parseCoalescingResponse(llmContent);
  }

  static validateStructuredResponse(
    response: StructuredAdversarialResponse,
  ): CoalescingValidationResult {
    const issues: ValidationIssue[] = [];

    // Validate basic structure
    if (!response.insights || !Array.isArray(response.insights)) {
      issues.push({
        type: 'structure_invalid',
        severity: 'error',
        message: 'Missing or invalid insights array',
      });
    }

    if (
      typeof response.confidence !== 'number' ||
      response.confidence < 0 ||
      response.confidence > 1
    ) {
      issues.push({
        type: 'structure_invalid',
        severity: 'error',
        message: 'Invalid confidence value',
      });
    }

    // Validate evidence grounding
    if (response.evidenceValidation) {
      const groundingScore = response.evidenceValidation.groundingScore;
      if (groundingScore < 0.7) {
        issues.push({
          type: 'evidence_missing',
          severity: 'warning',
          message: `Low evidence grounding score: ${(groundingScore * 100).toFixed(1)}%`,
        });
      }
    }

    // Validate individual insights
    response.insights?.forEach((insight, index) => {
      if (!insight.evidenceIds || insight.evidenceIds.length === 0) {
        issues.push({
          type: 'evidence_missing',
          severity: 'warning',
          message: `Insight ${index + 1} has no evidence citations`,
          insightId: insight.id,
        });
      }

      if (insight.confidence < 0.5) {
        issues.push({
          type: 'confidence_low',
          severity: 'info',
          message: `Insight ${index + 1} has low confidence: ${(insight.confidence * 100).toFixed(1)}%`,
          insightId: insight.id,
        });
      }
    });

    const isValid = issues.filter((i) => i.severity === 'error').length === 0;
    const confidence = isValid
      ? response.confidence
      : Math.max(0, response.confidence - 0.2);

    return {
      isValid,
      confidence,
      issues,
      suggestions: ResponseProcessor.generateSuggestions(issues),
      processingTime: 0,
    };
  }

  static validateEvidenceGrounding(
    insights: AdversarialInsight[],
    availableEvidence: EvidenceReference[],
  ): EvidenceValidation {
    const totalInsights = insights.length;
    const missingEvidence: string[] = [];
    const invalidEvidence: string[] = [];
    let groundedInsights = 0;

    const evidenceSet = new Set(availableEvidence.map((e) => e.id));

    insights.forEach((insight) => {
      const hasValidEvidence = insight.evidenceIds.some(
        (evidenceId: string) => {
          if (!evidenceSet.has(evidenceId)) {
            if (!missingEvidence.includes(evidenceId)) {
              missingEvidence.push(evidenceId);
            }
            return false;
          }
          return true;
        },
      );

      if (hasValidEvidence) {
        groundedInsights++;
      }
    });

    const groundingScore =
      totalInsights > 0 ? groundedInsights / totalInsights : 0;

    return {
      totalInsights,
      groundedInsights,
      missingEvidence,
      invalidEvidence,
      groundingScore,
    };
  }

  private static generateSuggestions(issues: ValidationIssue[]): string[] {
    const suggestions: string[] = [];

    if (issues.some((i) => i.type === 'evidence_missing')) {
      suggestions.push('Ensure all insights cite valid evidence IDs');
    }

    if (issues.some((i) => i.type === 'confidence_low')) {
      suggestions.push('Consider strengthening insights with more evidence');
    }

    if (issues.some((i) => i.type === 'structure_invalid')) {
      suggestions.push('Review JSON structure and required fields');
    }

    return suggestions;
  }
}
