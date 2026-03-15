/**
 * Validator
 *
 * Runs deterministic validation checks before promoting hypotheses into recommendations.
 * Validates evidence strength, repo-specificity, actionability, and consistency.
 */

import type {
  Finding,
  Hypothesis,
  RecommendationContext,
  ValidationCheck,
  ValidationResult,
} from './types';

export class Validator {
  private context: RecommendationContext;

  constructor(context: RecommendationContext) {
    this.context = context;
  }

  validateHypotheses(
    hypotheses: Hypothesis[],
    findings: Finding[],
  ): ValidationResult[] {
    const results: ValidationResult[] = [];

    for (const hypothesis of hypotheses) {
      const result = this.validateHypothesis(hypothesis, findings);
      results.push(result);
    }

    return results;
  }

  private validateHypothesis(
    hypothesis: Hypothesis,
    findings: Finding[],
  ): ValidationResult {
    const validationChecks: ValidationCheck[] = [];
    const blockers: string[] = [];
    const warnings: string[] = [];

    // Run all validation checks
    for (const check of hypothesis.validationChecks) {
      const result = this.executeValidationCheck(check, hypothesis, findings);
      validationChecks.push(result);

      if (!result.passed) {
        if (this.isBlocker(check.type, result.reason)) {
          blockers.push(result.reason || 'Validation failed');
        } else {
          warnings.push(result.reason || 'Validation warning');
        }
      }
    }

    // Calculate final confidence
    const adjustedConfidence = this.calculateAdjustedConfidence(
      hypothesis.confidence,
      validationChecks,
    );

    // Determine recommendation
    const recommendation = this.determineRecommendation(
      blockers,
      warnings,
      adjustedConfidence,
    );

    return {
      hypothesisId: hypothesis.id,
      passed: recommendation === 'promote',
      confidence: adjustedConfidence,
      validationChecks,
      blockers,
      warnings,
      recommendation,
    };
  }

  private executeValidationCheck(
    check: ValidationCheck,
    hypothesis: Hypothesis,
    findings: Finding[],
  ): ValidationCheck {
    const resultCheck = { ...check };

    switch (check.type) {
      case 'evidence_strength':
        resultCheck.passed = this.validateEvidenceStrength(
          hypothesis,
          findings,
        );
        resultCheck.actual = resultCheck.passed
          ? 'Strong evidence'
          : 'Weak evidence';
        resultCheck.reason = resultCheck.passed
          ? 'Supporting findings provide strong evidence'
          : 'Supporting findings are weak or insufficient';
        break;

      case 'repo_specificity':
        resultCheck.passed = this.validateRepoSpecificity(hypothesis);
        resultCheck.actual = resultCheck.passed ? 'Repo-specific' : 'Generic';
        resultCheck.reason = resultCheck.passed
          ? 'Hypothesis addresses repo-specific characteristics'
          : 'Hypothesis appears generic and could apply to any repo';
        break;

      case 'actionability':
        resultCheck.passed = this.validateActionability(hypothesis);
        resultCheck.actual = resultCheck.passed ? 'Actionable' : 'Vague';
        resultCheck.reason = resultCheck.passed
          ? 'Clear, actionable steps can be taken'
          : 'Hypothesis lacks clear actionable steps';
        break;

      case 'redundancy':
        resultCheck.passed = this.validateRedundancy(hypothesis, findings);
        resultCheck.actual = resultCheck.passed ? 'Unique' : 'Redundant';
        resultCheck.reason = resultCheck.passed
          ? 'Hypothesis provides unique insight'
          : 'Hypothesis overlaps with other findings/hypotheses';
        break;

      case 'contradiction':
        resultCheck.passed = this.validateContradiction(hypothesis, findings);
        resultCheck.actual = resultCheck.passed
          ? 'Consistent'
          : 'Contradictory';
        resultCheck.reason = resultCheck.passed
          ? 'Hypothesis is consistent with evidence'
          : 'Hypothesis contradicts available evidence';
        break;
    }

    return resultCheck;
  }

  private validateEvidenceStrength(
    hypothesis: Hypothesis,
    findings: Finding[],
  ): boolean {
    // Get supporting findings
    const supportingFindings = findings.filter((f) =>
      hypothesis.supportingFindings.includes(f.id),
    );

    if (supportingFindings.length === 0) {
      return false;
    }

    // Check evidence quality
    let totalEvidenceQuality = 0;
    let evidenceCount = 0;

    for (const finding of supportingFindings) {
      for (const anchor of finding.evidenceAnchors) {
        totalEvidenceQuality += anchor.confidence;
        evidenceCount++;
      }
    }

    if (evidenceCount === 0) {
      return false;
    }

    const averageConfidence = totalEvidenceQuality / evidenceCount;

    // Require at least 70% average evidence confidence
    return averageConfidence >= 70;
  }

  private validateRepoSpecificity(hypothesis: Hypothesis): boolean {
    // Check if hypothesis references specific repo characteristics
    const repoSpecificIndicators = [
      this.context.repoPath,
      this.context.evidence.structure.fileCount,
      this.context.evidence.structure.directoryDepth,
      this.context.techStack.primaryLanguage,
      this.context.techStack.frameworks?.length || 0,
    ];

    // Check if hypothesis description mentions specific characteristics
    const description = hypothesis.description.toLowerCase();
    const reasoning = hypothesis.reasoning.toLowerCase();

    // Look for indicators of repo-specific analysis
    const specificIndicators = [
      'this repository',
      'the repository',
      'project shows',
      'codebase indicates',
      'analysis reveals',
      'detected',
      'found',
      'shows signs of',
    ];

    const hasSpecificLanguage = specificIndicators.some(
      (indicator) =>
        description.includes(indicator) || reasoning.includes(indicator),
    );

    // Check if hypothesis avoids generic language
    const genericIndicators = [
      'all repositories',
      'every project',
      'always',
      'never',
      'should always',
    ];

    const hasGenericLanguage = genericIndicators.some(
      (indicator) =>
        description.includes(indicator) || reasoning.includes(indicator),
    );

    return hasSpecificLanguage && !hasGenericLanguage;
  }

  private validateActionability(hypothesis: Hypothesis): boolean {
    // Check if hypothesis suggests clear actions
    const actionableIndicators = [
      'add',
      'create',
      'implement',
      'configure',
      'establish',
      'set up',
      'enable',
      'introduce',
      'define',
      'document',
    ];

    const description = hypothesis.description.toLowerCase();
    const reasoning = hypothesis.reasoning.toLowerCase();

    const hasActionableLanguage = actionableIndicators.some(
      (indicator) =>
        description.includes(indicator) || reasoning.includes(indicator),
    );

    // Check if effort estimate is realistic
    const hasRealisticEffort = ['small', 'medium', 'large'].includes(
      hypothesis.estimatedEffort,
    );

    // Check if impact is meaningful
    const hasMeaningfulImpact = ['critical', 'high', 'medium', 'low'].includes(
      hypothesis.estimatedImpact,
    );

    return hasActionableLanguage && hasRealisticEffort && hasMeaningfulImpact;
  }

  private validateRedundancy(
    hypothesis: Hypothesis,
    findings: Finding[],
  ): boolean {
    // Check if hypothesis just repeats findings without adding insight
    const supportingFindings = findings.filter((f) =>
      hypothesis.supportingFindings.includes(f.id),
    );

    if (supportingFindings.length === 0) {
      return true; // No redundancy if no supporting findings
    }

    // Check if hypothesis adds value beyond just restating findings
    const findingSummaries = supportingFindings
      .map((f) => f.summary.toLowerCase())
      .join(' ');
    const hypothesisContent = (
      hypothesis.description +
      ' ' +
      hypothesis.reasoning
    ).toLowerCase();

    // Simple similarity check - if hypothesis content is too similar to findings, it's redundant
    const commonWords = this.getCommonWords(
      findingSummaries,
      hypothesisContent,
    );
    const similarityRatio =
      commonWords.length / Math.max(findingSummaries.split(' ').length, 1);

    // If more than 80% similar, consider it redundant
    return similarityRatio < 0.8;
  }

  private validateContradiction(
    hypothesis: Hypothesis,
    findings: Finding[],
  ): boolean {
    // Check if hypothesis contradicts available evidence
    const supportingFindings = findings.filter((f) =>
      hypothesis.supportingFindings.includes(f.id),
    );

    // Check for contradictory evidence
    for (const finding of supportingFindings) {
      // If finding severity is low but hypothesis impact is critical, might be contradiction
      if (
        finding.severity === 'low' &&
        hypothesis.estimatedImpact === 'critical'
      ) {
        // Check if reasoning addresses this discrepancy
        if (
          !hypothesis.reasoning.toLowerCase().includes('despite') &&
          !hypothesis.reasoning.toLowerCase().includes('even though') &&
          !hypothesis.reasoning.toLowerCase().includes('potential')
        ) {
          return false;
        }
      }

      // If finding suggests absence of something but hypothesis assumes presence
      for (const anchor of finding.evidenceAnchors) {
        if (
          anchor.type === 'missing' &&
          !hypothesis.description.toLowerCase().includes('lack') &&
          !hypothesis.description.toLowerCase().includes('missing') &&
          !hypothesis.description.toLowerCase().includes('without')
        ) {
          return false;
        }
      }
    }

    return true;
  }

  private calculateAdjustedConfidence(
    originalConfidence: number,
    validationChecks: ValidationCheck[],
  ): number {
    let adjustedConfidence = originalConfidence;

    // Adjust confidence based on failed validations
    for (const check of validationChecks) {
      if (!check.passed) {
        switch (check.type) {
          case 'evidence_strength':
            adjustedConfidence -= 30;
            break;
          case 'repo_specificity':
            adjustedConfidence -= 25;
            break;
          case 'actionability':
            adjustedConfidence -= 20;
            break;
          case 'redundancy':
            adjustedConfidence -= 15;
            break;
          case 'contradiction':
            adjustedConfidence -= 35;
            break;
        }
      }
    }

    // Ensure confidence stays within bounds
    return Math.max(0, Math.min(100, adjustedConfidence));
  }

  private determineRecommendation(
    blockers: string[],
    warnings: string[],
    confidence: number,
  ): ValidationResult['recommendation'] {
    // Critical blockers lead to rejection
    if (blockers.length > 0) {
      return 'reject';
    }

    // Low confidence with warnings requires human review
    if (confidence < 50 && warnings.length > 0) {
      return 'human_review';
    }

    // Medium confidence with warnings gets downgraded
    if (confidence < 70 && warnings.length > 0) {
      return 'downgrade';
    }

    // High confidence with minimal warnings gets promoted
    if (confidence >= 70 && warnings.length <= 1) {
      return 'promote';
    }

    // Default to human review for edge cases
    return 'human_review';
  }

  private isBlocker(
    checkType: ValidationCheck['type'],
    reason?: string,
  ): boolean {
    // Some validation failures are blockers
    const blockerTypes: ValidationCheck['type'][] = [
      'contradiction',
      'evidence_strength',
    ];

    if (blockerTypes.includes(checkType)) {
      return true;
    }

    // Some reasons are always blockers
    const blockerReasons = [
      'Supporting findings are weak or insufficient',
      'Hypothesis contradicts available evidence',
    ];

    return blockerReasons.includes(reason || '');
  }

  private getCommonWords(text1: string, text2: string): string[] {
    const words1 = text1.split(' ').filter((w) => w.length > 3);
    const words2 = text2.split(' ').filter((w) => w.length > 3);

    return words1.filter((word) => words2.includes(word));
  }
}
