/**
 * Challenger
 *
 * Adds a challenger pass whose only job is to attack or downgrade weak recommendations.
 * Questions genericness, redundancy, evidence support, impact claims, and priority.
 */

import type {
  ChallengerAssessment,
  Finding,
  Hypothesis,
  RecommendationContext,
  RecommendationV2,
  ValidationResult,
} from './types';

export class Challenger {
  private context: RecommendationContext;

  constructor(context: RecommendationContext) {
    this.context = context;
  }

  challengeRecommendations(
    recommendations: RecommendationV2[],
    findings: Finding[],
    hypotheses: Hypothesis[],
    validationResults: ValidationResult[],
  ): ChallengerAssessment[] {
    const assessments: ChallengerAssessment[] = [];

    for (const recommendation of recommendations) {
      const assessment = this.challengeRecommendation(
        recommendation,
        findings,
        hypotheses,
        validationResults,
      );
      assessments.push(assessment);
    }

    return assessments;
  }

  private challengeRecommendation(
    recommendation: RecommendationV2,
    findings: Finding[],
    hypotheses: Hypothesis[],
    validationResults: ValidationResult[],
  ): ChallengerAssessment {
    const criticisms: string[] = [];
    const strengths: string[] = [];
    const alternativeActions: string[] = [];
    const downgradeReasons: string[] = [];

    // Challenge 1: Genericness
    const genericnessCheck = this.challengeGenericness(recommendation);
    criticisms.push(...genericnessCheck.criticisms);
    strengths.push(...genericnessCheck.strengths);
    downgradeReasons.push(...genericnessCheck.downgradeReasons);

    // Challenge 2: Redundancy
    const redundancyCheck = this.challengeRedundancy(
      recommendation,
      findings,
      hypotheses,
    );
    criticisms.push(...redundancyCheck.criticisms);
    strengths.push(...redundancyCheck.strengths);
    downgradeReasons.push(...redundancyCheck.downgradeReasons);

    // Challenge 3: Evidence Support
    const evidenceCheck = this.challengeEvidenceSupport(
      recommendation,
      findings,
    );
    criticisms.push(...evidenceCheck.criticisms);
    strengths.push(...evidenceCheck.strengths);
    downgradeReasons.push(...evidenceCheck.downgradeReasons);

    // Challenge 4: Impact Claims
    const impactCheck = this.challengeImpactClaims(recommendation);
    criticisms.push(...impactCheck.criticisms);
    strengths.push(...impactCheck.strengths);
    downgradeReasons.push(...impactCheck.downgradeReasons);

    // Challenge 5: Priority and Effort
    const priorityCheck = this.challengePriority(recommendation);
    criticisms.push(...priorityCheck.criticisms);
    strengths.push(...priorityCheck.strengths);
    downgradeReasons.push(...priorityCheck.downgradeReasons);

    // Challenge 6: Repo-Specificity
    const specificityCheck = this.challengeSpecificity(recommendation);
    criticisms.push(...specificityCheck.criticisms);
    strengths.push(...specificityCheck.strengths);
    downgradeReasons.push(...specificityCheck.downgradeReasons);

    // Generate alternative actions
    alternativeActions.push(...this.generateAlternatives(recommendation));

    // Determine final verdict
    const { verdict, confidenceAdjustment } = this.determineVerdict(
      criticisms,
      strengths,
      downgradeReasons,
      recommendation,
    );

    return {
      recommendationId: recommendation.id,
      criticisms,
      strengths,
      alternativeActions,
      downgradeReasons,
      finalVerdict: verdict,
      confidenceAdjustment,
    };
  }

  private challengeGenericness(recommendation: RecommendationV2) {
    const result = {
      criticisms: [] as string[],
      strengths: [] as string[],
      downgradeReasons: [] as string[],
    };

    const title = recommendation.title.toLowerCase();
    const summary = recommendation.summary.toLowerCase();
    const whyMatters = recommendation.whyThisMatters.toLowerCase();

    // Generic patterns to detect
    const genericPatterns = [
      'improve',
      'enhance',
      'optimize',
      'better',
      'best practices',
      'standardize',
      'add',
      'implement',
      'establish',
    ];

    const hasGenericLanguage = genericPatterns.some(
      (pattern) => title.includes(pattern) || summary.includes(pattern),
    );

    // Check for specific, actionable language
    const specificPatterns = [
      'codeowners',
      'ci/cd',
      'typescript',
      'readme',
      'license',
      'gitignore',
      'copilot',
      'tests',
      'contributing',
    ];

    const hasSpecificLanguage = specificPatterns.some(
      (pattern) =>
        title.includes(pattern) ||
        summary.includes(pattern) ||
        whyMatters.includes(pattern),
    );

    if (hasGenericLanguage && !hasSpecificLanguage) {
      result.criticisms.push(
        'Recommendation uses generic language without specific references',
      );
      result.downgradeReasons.push('Generic advice lacks specificity');
    }

    if (hasSpecificLanguage) {
      result.strengths.push('Recommendation addresses specific tools or files');
    }

    // Check for vague impact statements
    const vagueImpactPatterns = [
      'will improve',
      'will enhance',
      'will help',
      'will make better',
      'will increase quality',
    ];

    const hasVagueImpact = vagueImpactPatterns.some((pattern) =>
      whyMatters.includes(pattern),
    );

    if (hasVagueImpact) {
      result.criticisms.push('Impact statement is vague and non-specific');
      result.downgradeReasons.push('Unclear value proposition');
    }

    return result;
  }

  private challengeRedundancy(
    recommendation: RecommendationV2,
    findings: Finding[],
    hypotheses: Hypothesis[],
  ) {
    const result = {
      criticisms: [] as string[],
      strengths: [] as string[],
      downgradeReasons: [] as string[],
    };

    // Check if recommendation just restates findings
    const supportingFindings = findings.filter((f) =>
      recommendation.supportingFindings.includes(f.id),
    );

    for (const finding of supportingFindings) {
      // If recommendation title is very similar to finding summary
      if (
        this.calculateSimilarity(recommendation.title, finding.summary) > 0.8
      ) {
        result.criticisms.push(
          `Recommendation appears to restate finding: "${finding.summary}"`,
        );
        result.downgradeReasons.push('Redundant with existing findings');
        break;
      }
    }

    // Check if recommendation adds insight beyond hypotheses
    const supportingHypotheses = hypotheses.filter((h) =>
      recommendation.supportingHypotheses.includes(h.id),
    );

    if (supportingHypotheses.length === 0 && supportingFindings.length > 0) {
      result.criticisms.push('Recommendation lacks hypothesis-driven insight');
      result.downgradeReasons.push('No analytical depth beyond findings');
    }

    if (supportingHypotheses.length > 0) {
      result.strengths.push(
        'Recommendation builds on hypothesis-driven analysis',
      );
    }

    return result;
  }

  private challengeEvidenceSupport(
    recommendation: RecommendationV2,
    findings: Finding[],
  ) {
    const result = {
      criticisms: [] as string[],
      strengths: [] as string[],
      downgradeReasons: [] as string[],
    };

    // Check evidence anchor quality
    const strongAnchors = recommendation.evidenceAnchors.filter(
      (a) => a.confidence >= 80,
    );
    const weakAnchors = recommendation.evidenceAnchors.filter(
      (a) => a.confidence < 60,
    );

    if (weakAnchors.length > strongAnchors.length) {
      result.criticisms.push('Evidence anchors are predominantly weak');
      result.downgradeReasons.push('Insufficient evidence support');
    }

    if (strongAnchors.length > 0) {
      result.strengths.push('Strong evidence anchors support recommendation');
    }

    // Check if evidence actually supports the recommendation
    for (const anchor of recommendation.evidenceAnchors) {
      if (
        anchor.type === 'missing' &&
        recommendation.title.toLowerCase().includes('improve')
      ) {
        result.criticisms.push(
          'Recommendation to "improve" something that doesn\'t exist',
        );
        result.downgradeReasons.push('Logical inconsistency in evidence');
        break;
      }
    }

    // Check for evidence diversity
    const anchorTypes = new Set(
      recommendation.evidenceAnchors.map((a) => a.type),
    );
    if (anchorTypes.size === 1) {
      result.criticisms.push('Evidence comes from only one type of source');
      result.downgradeReasons.push('Limited evidence diversity');
    }

    return result;
  }

  private challengeImpactClaims(recommendation: RecommendationV2) {
    const result = {
      criticisms: [] as string[],
      strengths: [] as string[],
      downgradeReasons: [] as string[],
    };

    const impact = recommendation.expectedImpact;
    const effort = recommendation.estimatedEffort;

    // Check effort vs impact ratio
    const effortValue = { small: 1, medium: 2, large: 3 }[effort.size];
    const impactValue = { low: 1, medium: 2, high: 3, critical: 4 }[
      recommendation.priority
    ];

    if (effortValue > impactValue) {
      result.criticisms.push('Estimated effort outweighs expected impact');
      result.downgradeReasons.push('Poor effort-to-impact ratio');
    }

    if (effortValue < impactValue) {
      result.strengths.push('Good effort-to-impact ratio');
    }

    // Check for specific impact metrics
    if (impact.metrics.length === 0) {
      result.criticisms.push('No specific impact metrics identified');
      result.downgradeReasons.push('Impact cannot be measured');
    } else {
      result.strengths.push('Specific impact metrics identified');
    }

    // Check impact description specificity
    if (impact.description.length < 50) {
      result.criticisms.push('Impact description is too brief');
      result.downgradeReasons.push('Impact not clearly explained');
    }

    return result;
  }

  private challengePriority(recommendation: RecommendationV2) {
    const result = {
      criticisms: [] as string[],
      strengths: [] as string[],
      downgradeReasons: [] as string[],
    };

    // Check if priority matches evidence strength
    const avgEvidenceConfidence =
      recommendation.evidenceAnchors.reduce((sum, a) => sum + a.confidence, 0) /
      recommendation.evidenceAnchors.length;

    const priorityValue = { critical: 4, high: 3, medium: 2, low: 1 }[
      recommendation.priority
    ];

    if (priorityValue === 4 && avgEvidenceConfidence < 70) {
      result.criticisms.push('Critical priority with weak evidence support');
      result.downgradeReasons.push(
        'Priority overestimated relative to evidence',
      );
    }

    if (priorityValue === 1 && avgEvidenceConfidence > 85) {
      result.criticisms.push('Low priority with strong evidence support');
      result.downgradeReasons.push(
        'Priority underestimated relative to evidence',
      );
    }

    // Check if priority makes sense for category
    const categoryPriorityMap = {
      security: 'should be high or critical',
      foundation: 'should be medium or high',
      workflow: 'should be medium or high',
      ai: 'should be low or medium',
      governance: 'should be low or medium',
    };

    const expectedPriority = categoryPriorityMap[recommendation.category];
    const actualPriority = recommendation.priority;

    if (
      (expectedPriority.includes('critical') &&
        actualPriority !== 'critical') ||
      (expectedPriority.includes('high') &&
        !['critical', 'high'].includes(actualPriority)) ||
      (expectedPriority.includes('low') &&
        !['low', 'medium'].includes(actualPriority))
    ) {
      result.criticisms.push(
        `Priority seems inappropriate for ${recommendation.category} category`,
      );
      result.downgradeReasons.push('Category-priority mismatch');
    }

    return result;
  }

  private challengeSpecificity(recommendation: RecommendationV2) {
    const result = {
      criticisms: [] as string[],
      strengths: [] as string[],
      downgradeReasons: [] as string[],
    };

    // Check if recommendation mentions specific files
    const fileReferences = recommendation.evidenceAnchors
      .filter((a) => a.type === 'file' || a.type === 'missing')
      .map((a) => a.path)
      .filter(Boolean);

    if (fileReferences.length === 0) {
      result.criticisms.push('No specific file references in evidence');
      result.downgradeReasons.push('Lacks concrete file-level guidance');
    } else {
      result.strengths.push('References specific files for implementation');
    }

    // Check if next step is actionable
    if (recommendation.suggestedNextStep.length < 20) {
      result.criticisms.push('Suggested next step is too brief');
      result.downgradeReasons.push('Next step not clearly actionable');
    }

    // Check if implementation hints are provided
    if (!recommendation.implementationHints) {
      result.criticisms.push('No implementation hints provided');
      result.downgradeReasons.push('Implementation guidance missing');
    } else if (
      (recommendation.implementationHints.commands?.length || 0) > 0 ||
      (recommendation.implementationHints.fileTemplates?.length || 0) > 0
    ) {
      result.strengths.push('Provides concrete implementation guidance');
    }

    return result;
  }

  private generateAlternatives(recommendation: RecommendationV2): string[] {
    const alternatives: string[] = [];

    // Generate alternatives based on category
    switch (recommendation.category) {
      case 'security':
        if (recommendation.title.includes('CODEOWNERS')) {
          alternatives.push('Consider using branch protection rules instead');
          alternatives.push('Implement required reviews for sensitive files');
        }
        break;

      case 'foundation':
        if (recommendation.title.includes('README')) {
          alternatives.push('Add inline code documentation instead');
          alternatives.push('Create video walkthrough for onboarding');
        }
        break;

      case 'workflow':
        if (recommendation.title.includes('CI/CD')) {
          alternatives.push('Start with simple pre-commit hooks');
          alternatives.push('Use external CI service before building internal');
        }
        break;

      case 'ai':
        if (recommendation.title.includes('Copilot')) {
          alternatives.push('Focus on code comments and documentation first');
          alternatives.push('Establish coding standards without AI tools');
        }
        break;
    }

    // Generic alternatives
    if (recommendation.estimatedEffort.size === 'large') {
      alternatives.push('Break down into smaller, incremental changes');
    }

    if (recommendation.priority === 'critical') {
      alternatives.push(
        'Address underlying issues first before this recommendation',
      );
    }

    return alternatives;
  }

  private determineVerdict(
    criticisms: string[],
    strengths: string[],
    downgradeReasons: string[],
    recommendation: RecommendationV2,
  ): {
    verdict: ChallengerAssessment['finalVerdict'];
    confidenceAdjustment: number;
  } {
    const criticismWeight = -10;
    const strengthWeight = 5;
    const downgradeWeight = -15;

    let score = 0;
    score += criticisms.length * criticismWeight;
    score += strengths.length * strengthWeight;
    score += downgradeReasons.length * downgradeWeight;

    // Adjust for baseline confidence
    score += (recommendation.confidence.overall - 50) * 0.5;

    let verdict: ChallengerAssessment['finalVerdict'];
    let confidenceAdjustment: number;

    if (score <= -40) {
      verdict = 'reject';
      confidenceAdjustment = -50;
    } else if (score <= -20) {
      verdict = 'downgrade';
      confidenceAdjustment = -25;
    } else if (score <= 0) {
      verdict = 'require_human_review';
      confidenceAdjustment = -10;
    } else if (downgradeReasons.length > 0) {
      verdict = 'require_human_review';
      confidenceAdjustment = -5;
    } else {
      verdict = 'approve';
      confidenceAdjustment = Math.min(10, score * 0.2);
    }

    return { verdict, confidenceAdjustment };
  }

  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(' ');
    const words2 = text2.toLowerCase().split(' ');

    const commonWords = words1.filter((word) => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;

    return commonWords.length / totalWords;
  }
}
