/**
 * LLM Response Processor
 *
 * Handles structured parsing and validation of LLM responses
 * for adversarial coalescing with deterministic analysis
 */

import { PersonaInsight } from "../types/persona";

export interface ParsedLLMResponse {
  enhancedInsights: string[];
  adversarialChallenges: string[];
  confidenceAssessment: string;
  rawContent: string;
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
    adversarialChallenges: /ADVERSARIAL_CHALLENGES:\s*\n([\s\S]*?)(?=\n\n|\n[A-Z_]+:|$)/,
    confidenceAssessment: /CONFIDENCE_ASSESSMENT:\s*\n([\s\S]*?)(?=\n\n|\n[A-Z_]+:|$)/,
  };

  private static readonly VALIDATION_RESULT_PATTERN = /VALIDATION_RESULT:\s*(PASS|FAIL)/i;
  private static readonly VALIDATION_NOTES_PATTERN = /VALIDATION_NOTES:\s*\n([\s\S]*?)(?=\n\n|\n[A-Z_]+:|$)/;

  static parseCoalescingResponse(llmContent: string): ParsedLLMResponse {
    const enhancedInsights = this.extractSection(
      llmContent,
      this.SECTION_PATTERNS.enhancedInsights
    );
    const adversarialChallenges = this.extractSection(
      llmContent,
      this.SECTION_PATTERNS.adversarialChallenges
    );
    const confidenceAssessment = this.extractSection(
      llmContent,
      this.SECTION_PATTERNS.confidenceAssessment
    );

    return {
      enhancedInsights,
      adversarialChallenges,
      confidenceAssessment: confidenceAssessment[0] || "",
      rawContent: llmContent,
    };
  }

  static parseValidationResponse(llmContent: string): ValidationResult {
    const resultMatch = llmContent.match(this.VALIDATION_RESULT_PATTERN);
    const notesMatch = llmContent.match(this.VALIDATION_NOTES_PATTERN);

    const isValid = resultMatch ? resultMatch[1]?.toUpperCase() === "PASS" : false;
    const notes = notesMatch ? notesMatch[1]?.trim() || "" : "";

    const issues = this.extractIssues(notes);
    const suggestions = this.extractSuggestions(notes);
    const confidence = this.calculateValidationConfidence(isValid, issues.length);

    return {
      isValid,
      confidence,
      issues,
      suggestions,
    };
  }

  static processEnhancedInsights(
    enhancedTexts: string[],
    deterministicInsights: PersonaInsight[]
  ): PersonaInsight[] {
    const processedInsights: PersonaInsight[] = [];

    enhancedTexts.forEach((enhancedText, index) => {
      if (index < deterministicInsights.length && deterministicInsights[index]) {
        const original = deterministicInsights[index]!;
        const enhanced = this.createEnhancedInsight(original, enhancedText);
        processedInsights.push(enhanced);
      } else {
        // Create new insight from enhanced text
        const newInsight = this.createNewInsight(enhancedText, index);
        processedInsights.push(newInsight);
      }
    });

    return processedInsights;
  }

  static validateResponseStructure(parsed: ParsedLLMResponse): ValidationResult {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check required sections
    if (parsed.enhancedInsights.length === 0) {
      issues.push("No enhanced insights found");
      suggestions.push("Add at least one enhanced insight");
    }

    if (parsed.adversarialChallenges.length === 0) {
      issues.push("No adversarial challenges found");
      suggestions.push("Add at least one adversarial challenge");
    }

    if (!parsed.confidenceAssessment) {
      issues.push("No confidence assessment provided");
      suggestions.push("Add confidence assessment section");
    }

    // Check content quality
    if (parsed.enhancedInsights.some(insight => insight.length < 20)) {
      issues.push("Some enhanced insights are too brief");
      suggestions.push("Provide more detailed insights");
    }

    if (parsed.adversarialChallenges.some(challenge => challenge.length < 15)) {
      issues.push("Some adversarial challenges are too brief");
      suggestions.push("Provide more substantive challenges");
    }

    const confidence = this.calculateValidationConfidence(issues.length === 0, issues.length);

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
      .split("\n")
      .filter(line => line.trim().startsWith("-"))
      .map(line => line.replace(/^-\s*/, "").trim())
      .filter(line => line.length > 0);
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
    issuePatterns.forEach(pattern => {
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
    suggestionPatterns.forEach(pattern => {
      if (pattern.test(notes)) {
        suggestions.push(notes);
      }
    });

    return suggestions.length > 0 ? suggestions : ["Review response structure"];
  }

  private static calculateValidationConfidence(isValid: boolean, issueCount: number): number {
    let confidence = isValid ? 0.9 : 0.5;
    confidence -= issueCount * 0.1;
    return Math.max(0, Math.min(1, confidence));
  }

  private static createEnhancedInsight(
    original: PersonaInsight,
    enhancedText: string
  ): PersonaInsight {
    return {
      ...original,
      description: enhancedText,
      confidence: Math.min(original.confidence + 5, 100), // Slight confidence boost
    };
  }

  private static createNewInsight(enhancedText: string, index: number): PersonaInsight {
    return {
      id: `llm-enhanced-${Date.now()}-${index}`,
      type: "analysis",
      title: this.extractTitleFromText(enhancedText),
      description: enhancedText,
      evidence: [], // LLM should not add new evidence
      confidence: 70, // Default confidence for new insights
      priority: "medium",
      category: "strategy",
    };
  }

  private static extractTitleFromText(text: string): string {
    // Extract first sentence or create title from first 50 characters
    const sentences = text.split(/[.!?]/);
    const firstSentence = sentences[0]?.trim() || "";
    if (firstSentence.length <= 50) {
      return firstSentence;
    }
    return text.substring(0, 50).trim() + "...";
  }

  static sanitizeResponse(content: string): string {
    // Remove any potentially harmful content
    return content
      .replace(/<script[^>]*>.*?<\/script>/gis, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
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
    const averageInsightLength = insightCount > 0
      ? parsed.enhancedInsights.reduce((sum, insight) => sum + insight.length, 0) / insightCount
      : 0;
    const averageChallengeLength = challengeCount > 0
      ? parsed.adversarialChallenges.reduce((sum, challenge) => sum + challenge.length, 0) / challengeCount
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
}
