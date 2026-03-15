/**
 * Evidence-Based Validation Layer
 *
 * Ensures LLM responses remain grounded in deterministic findings
 * and prevents hallucination while maintaining adversarial value
 */

import type { PersonaInsight } from '../types/persona';
import type { ParsedLLMResponse } from './response-processor';

export interface ValidationConfig {
  evidenceThreshold: number;
  confidenceThreshold: number;
  maxNewInsights: number;
  requireEvidenceGrounding: boolean;
}

export interface ValidationReport {
  isValid: boolean;
  score: number;
  issues: ValidationIssue[];
  metrics: ValidationMetrics;
  recommendations: string[];
}

export interface ValidationIssue {
  type:
    | 'evidence_drift'
    | 'confidence_inflation'
    | 'hallucination'
    | 'priority_mismatch';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedInsights: string[];
  suggestion: string;
}

export interface ValidationMetrics {
  evidenceOverlap: number;
  confidenceInflation: number;
  priorityAlignment: number;
  newInsightCount: number;
  hallucinationRisk: number;
}

export class EvidenceValidator {
  private config: ValidationConfig;

  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = {
      evidenceThreshold: 0.8,
      confidenceThreshold: 0.7,
      maxNewInsights: 2,
      requireEvidenceGrounding: true,
      ...config,
    };
  }

  validateLLMResponse(
    parsedResponse: ParsedLLMResponse,
    deterministicInsights: PersonaInsight[],
  ): ValidationReport {
    const issues: ValidationIssue[] = [];
    const metrics = this.calculateMetrics(
      parsedResponse,
      deterministicInsights,
    );

    // Validate evidence grounding
    if (this.config.requireEvidenceGrounding) {
      const evidenceIssues = this.validateEvidenceGrounding(
        parsedResponse,
        deterministicInsights,
      );
      issues.push(...evidenceIssues);
    }

    // Validate confidence levels
    const confidenceIssues = this.validateConfidenceLevels(
      parsedResponse,
      deterministicInsights,
    );
    issues.push(...confidenceIssues);

    // Validate priority alignment
    const priorityIssues = this.validatePriorityAlignment(
      parsedResponse,
      deterministicInsights,
    );
    issues.push(...priorityIssues);

    // Check for hallucination
    const hallucinationIssues = this.detectHallucination(
      parsedResponse,
      deterministicInsights,
    );
    issues.push(...hallucinationIssues);

    // Validate new insights
    const newInsightIssues = this.validateNewInsights(
      parsedResponse,
      deterministicInsights,
    );
    issues.push(...newInsightIssues);

    const score = this.calculateValidationScore(metrics, issues);
    const isValid = score >= this.config.confidenceThreshold;
    const recommendations = this.generateRecommendations(issues, metrics);

    return {
      isValid,
      score,
      issues,
      metrics,
      recommendations,
    };
  }

  private validateEvidenceGrounding(
    parsedResponse: ParsedLLMResponse,
    deterministicInsights: PersonaInsight[],
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const deterministicEvidence = new Set(
      deterministicInsights.flatMap((insight) => insight.evidence),
    );

    // Check each enhanced insight for evidence grounding
    parsedResponse.enhancedInsights.forEach((insightText, index) => {
      const insightEvidence = this.extractEvidenceFromText(insightText);
      const hasDeterministicEvidence = insightEvidence.some((evidence) =>
        deterministicEvidence.has(evidence),
      );

      if (!hasDeterministicEvidence && deterministicEvidence.size > 0) {
        issues.push({
          type: 'evidence_drift',
          severity: 'medium',
          description: `Enhanced insight ${index + 1} introduces evidence not present in deterministic analysis`,
          affectedInsights: [`insight-${index}`],
          suggestion:
            'Ensure all enhanced insights reference existing deterministic evidence',
        });
      }
    });

    return issues;
  }

  private validateConfidenceLevels(
    parsedResponse: ParsedLLMResponse,
    deterministicInsights: PersonaInsight[],
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const deterministicAvgConfidence =
      deterministicInsights.reduce(
        (sum, insight) => sum + insight.confidence,
        0,
      ) / deterministicInsights.length;

    // Parse confidence from assessment if available
    const llmConfidence = this.parseConfidenceFromAssessment(
      parsedResponse.confidenceAssessment,
    );

    if (llmConfidence > deterministicAvgConfidence + 20) {
      issues.push({
        type: 'confidence_inflation',
        severity: 'medium',
        description:
          'LLM confidence appears significantly inflated compared to deterministic analysis',
        affectedInsights: ['all'],
        suggestion:
          "Review confidence scoring and ensure it's grounded in evidence quality",
      });
    }

    return issues;
  }

  private validatePriorityAlignment(
    parsedResponse: ParsedLLMResponse,
    deterministicInsights: PersonaInsight[],
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // This is a simplified check - in practice, we'd need to parse priorities from enhanced insights
    const priorityShifts = this.countPriorityShifts(
      parsedResponse.enhancedInsights,
    );

    if (priorityShifts > deterministicInsights.length * 0.3) {
      issues.push({
        type: 'priority_mismatch',
        severity: 'low',
        description:
          'Significant priority changes detected in enhanced insights',
        affectedInsights: ['multiple'],
        suggestion:
          'Ensure priority changes are justified by additional evidence',
      });
    }

    return issues;
  }

  private detectHallucination(
    parsedResponse: ParsedLLMResponse,
    deterministicInsights: PersonaInsight[],
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Check for claims that contradict deterministic findings
    const contradictions = this.findContradictions(
      parsedResponse.enhancedInsights,
      deterministicInsights,
    );

    contradictions.forEach((contradiction, index) => {
      issues.push({
        type: 'hallucination',
        severity: 'high',
        description: `Enhanced insight contradicts deterministic finding: ${contradiction}`,
        affectedInsights: [`insight-${index}`],
        suggestion:
          'Review enhanced insight for accuracy and evidence grounding',
      });
    });

    return issues;
  }

  private validateNewInsights(
    parsedResponse: ParsedLLMResponse,
    deterministicInsights: PersonaInsight[],
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const newInsightCount = Math.max(
      0,
      parsedResponse.enhancedInsights.length - deterministicInsights.length,
    );

    if (newInsightCount > this.config.maxNewInsights) {
      issues.push({
        type: 'hallucination',
        severity: 'medium',
        description: `Too many new insights created (${newInsightCount} vs max ${this.config.maxNewInsights})`,
        affectedInsights: ['new-insights'],
        suggestion:
          'Limit new insights to those strongly supported by existing evidence',
      });
    }

    return issues;
  }

  private calculateMetrics(
    parsedResponse: ParsedLLMResponse,
    deterministicInsights: PersonaInsight[],
  ): ValidationMetrics {
    const evidenceOverlap = this.calculateEvidenceOverlap(
      parsedResponse.enhancedInsights,
      deterministicInsights,
    );

    const confidenceInflation = this.calculateConfidenceInflation(
      parsedResponse.confidenceAssessment,
      deterministicInsights,
    );

    const priorityAlignment = this.calculatePriorityAlignment();

    const newInsightCount = Math.max(
      0,
      parsedResponse.enhancedInsights.length - deterministicInsights.length,
    );

    const hallucinationRisk = this.calculateHallucinationRisk(
      parsedResponse,
      deterministicInsights,
    );

    return {
      evidenceOverlap,
      confidenceInflation,
      priorityAlignment,
      newInsightCount,
      hallucinationRisk,
    };
  }

  private calculateEvidenceOverlap(
    enhancedInsights: string[],
    deterministicInsights: PersonaInsight[],
  ): number {
    const deterministicEvidence = new Set(
      deterministicInsights.flatMap((insight) => insight.evidence),
    );

    if (deterministicEvidence.size === 0) return 1.0;

    let overlappingEvidence = 0;
    enhancedInsights.forEach((insight) => {
      const insightEvidence = this.extractEvidenceFromText(insight);
      const overlap = insightEvidence.filter((evidence) =>
        deterministicEvidence.has(evidence),
      ).length;
      overlappingEvidence += overlap;
    });

    return (
      overlappingEvidence /
      (deterministicEvidence.size * enhancedInsights.length)
    );
  }

  private calculateConfidenceInflation(
    confidenceAssessment: string,
    deterministicInsights: PersonaInsight[],
  ): number {
    const deterministicAvg =
      deterministicInsights.reduce(
        (sum, insight) => sum + insight.confidence,
        0,
      ) / deterministicInsights.length;

    const llmConfidence =
      this.parseConfidenceFromAssessment(confidenceAssessment);

    return Math.max(0, (llmConfidence - deterministicAvg) / 100);
  }

  private calculatePriorityAlignment(): number {
    // Simplified calculation - in practice would parse actual priorities
    return 0.8; // Placeholder
  }

  private calculateHallucinationRisk(
    parsedResponse: ParsedLLMResponse,
    deterministicInsights: PersonaInsight[],
  ): number {
    let riskScore = 0;

    // Risk factors
    if (
      parsedResponse.enhancedInsights.length >
      deterministicInsights.length * 1.5
    ) {
      riskScore += 0.3;
    }

    if (parsedResponse.adversarialChallenges.length === 0) {
      riskScore += 0.2;
    }

    const contradictions = this.findContradictions(
      parsedResponse.enhancedInsights,
      deterministicInsights,
    );
    riskScore += contradictions.length * 0.2;

    return Math.min(1, riskScore);
  }

  private calculateValidationScore(
    metrics: ValidationMetrics,
    issues: ValidationIssue[],
  ): number {
    let score = 1.0;

    // Deduct points for each issue based on severity
    issues.forEach((issue) => {
      switch (issue.severity) {
        case 'critical':
          score -= 0.4;
          break;
        case 'high':
          score -= 0.3;
          break;
        case 'medium':
          score -= 0.2;
          break;
        case 'low':
          score -= 0.1;
          break;
      }
    });

    // Factor in metrics
    score *= metrics.evidenceOverlap;
    score *= 1 - metrics.hallucinationRisk;
    score *= 1 - metrics.confidenceInflation;

    return Math.max(0, Math.min(1, score));
  }

  private generateRecommendations(
    issues: ValidationIssue[],
    metrics: ValidationMetrics,
  ): string[] {
    const recommendations: string[] = [];

    if (metrics.evidenceOverlap < this.config.evidenceThreshold) {
      recommendations.push(
        'Improve evidence grounding by referencing more deterministic findings',
      );
    }

    if (metrics.confidenceInflation > 0.2) {
      recommendations.push(
        'Review confidence scoring to ensure it reflects evidence quality',
      );
    }

    if (metrics.hallucinationRisk > 0.3) {
      recommendations.push(
        'Reduce hallucination risk by limiting new insights and improving adversarial challenges',
      );
    }

    issues.forEach((issue) => {
      if (!recommendations.includes(issue.suggestion)) {
        recommendations.push(issue.suggestion);
      }
    });

    return recommendations;
  }

  // Helper methods
  private extractEvidenceFromText(text: string): string[] {
    // Simple extraction - in practice would be more sophisticated
    const evidencePatterns = [
      /evidence[:\s]+([^\n]+)/gi,
      /data[:\s]+([^\n]+)/gi,
      /analysis[:\s]+([^\n]+)/gi,
    ];

    const evidence: string[] = [];
    evidencePatterns.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        evidence.push(...matches.map((m) => m.trim()));
      }
    });

    return evidence;
  }

  private parseConfidenceFromAssessment(assessment: string): number {
    const confidencePatterns = [
      /(\d+)%/gi,
      /confidence[:\s]+(\d+)/gi,
      /(\d+)\s*percent/gi,
    ];

    for (const pattern of confidencePatterns) {
      const match = assessment.match(pattern);
      if (match?.[1]) {
        return Number.parseInt(match[1], 10);
      }
    }

    return 75; // Default confidence
  }

  private countPriorityShifts(enhancedInsights: string[]): number {
    // Simplified count - in practice would parse actual priorities
    return Math.floor(enhancedInsights.length * 0.1);
  }

  private findContradictions(
    enhancedInsights: string[],
    deterministicInsights: PersonaInsight[],
  ): string[] {
    const contradictions: string[] = [];

    // Simple contradiction detection - in practice would be more sophisticated
    deterministicInsights.forEach((deterministic) => {
      enhancedInsights.forEach((enhanced) => {
        if (
          enhanced.toLowerCase().includes('not') &&
          deterministic.description
            .toLowerCase()
            .includes(enhanced.replace(/\s+not\s+/gi, ' ').trim())
        ) {
          contradictions.push(`${deterministic.title} vs enhanced insight`);
        }
      });
    });

    return contradictions;
  }
}
