/**
 * Ranker
 *
 * Final ranking and prioritization of validated recommendations.
 * Only validated recommendations become final recommendations.
 */

import type {
  ChallengerAssessment,
  Finding,
  Hypothesis,
  RecommendationContext,
  RecommendationV2,
  ValidationResult,
} from './types';

export class Ranker {
  private context: RecommendationContext;

  constructor(context: RecommendationContext) {
    this.context = context;
  }

  rankRecommendations(
    validationResults: ValidationResult[],
    challengerAssessments: ChallengerAssessment[],
    findings: Finding[],
    hypotheses: Hypothesis[],
  ): RecommendationV2[] {
    // Filter to only promoted recommendations
    const promotedValidations = validationResults.filter(
      (v) => v.recommendation === 'promote' || v.recommendation === 'downgrade',
    );

    // Filter challenger-approved recommendations
    const approvedRecommendations = challengerAssessments.filter(
      (a) =>
        a.finalVerdict === 'approve' ||
        a.finalVerdict === 'require_human_review',
    );

    // Generate final recommendations
    const finalRecommendations: RecommendationV2[] = [];

    for (const validation of promotedValidations) {
      const hypothesis = hypotheses.find(
        (h) => h.id === validation.hypothesisId,
      );
      if (!hypothesis) continue;

      const challengerAssessment = approvedRecommendations.find(
        (a) => a.recommendationId === hypothesis.id,
      );

      // Skip if challenger rejected
      if (challengerAssessment?.finalVerdict === 'reject') {
        continue;
      }

      const recommendation = this.createRecommendation(
        hypothesis,
        validation,
        challengerAssessment,
        findings,
      );

      finalRecommendations.push(recommendation);
    }

    // Sort by final priority score
    return finalRecommendations.sort((a, b) => {
      const scoreA = this.calculatePriorityScore(a);
      const scoreB = this.calculatePriorityScore(b);
      return scoreB - scoreA; // Highest score first
    });
  }

  private createRecommendation(
    hypothesis: Hypothesis,
    validation: ValidationResult,
    challengerAssessment: ChallengerAssessment | undefined,
    findings: Finding[],
  ): RecommendationV2 {
    const supportingFindings = findings.filter((f) =>
      hypothesis.supportingFindings.includes(f.id),
    );

    const evidenceAnchors = supportingFindings.flatMap(
      (f) => f.evidenceAnchors,
    );
    const affectedFiles = [
      ...new Set(supportingFindings.flatMap((f) => f.affectedFiles)),
    ];

    // Calculate final confidence
    const baseConfidence = validation.confidence;
    const challengerAdjustment =
      challengerAssessment?.confidenceAdjustment || 0;
    const finalConfidence = Math.max(
      0,
      Math.min(100, baseConfidence + challengerAdjustment),
    );

    // Determine if human review is needed
    const needsHumanReview =
      validation.recommendation === 'human_review' ||
      challengerAssessment?.finalVerdict === 'require_human_review' ||
      finalConfidence < this.context.config.humanReviewThreshold;

    // Create recommendation
    const recommendation: RecommendationV2 = {
      id: `rec-${hypothesis.id}`,
      title: hypothesis.title,
      category: hypothesis.category,
      priority: this.determinePriority(hypothesis, validation, finalConfidence),
      summary: hypothesis.description,
      whyThisMatters: this.generateWhyMatters(hypothesis, supportingFindings),
      evidenceAnchors,
      affectedFiles,
      supportingFindings: hypothesis.supportingFindings,
      supportingHypotheses: [hypothesis.id],
      validationSummary: {
        passed: validation.passed,
        confidence: validation.confidence,
        blockers: validation.blockers,
        warnings: validation.warnings,
      },
      expectedImpact: {
        description: this.generateImpactDescription(hypothesis),
        areas: this.determineImpactAreas(hypothesis),
        metrics: this.generateImpactMetrics(hypothesis),
      },
      estimatedEffort: {
        size: hypothesis.estimatedEffort,
        timeframes: this.generateTimeframes(hypothesis.estimatedEffort),
        resources: this.generateResourceList(hypothesis),
      },
      confidence: {
        overall: finalConfidence,
        evidenceQuality: this.calculateEvidenceQuality(evidenceAnchors),
        repoSpecificity: this.calculateRepoSpecificity(hypothesis),
        actionability: this.calculateActionability(hypothesis),
      },
      caveats: this.generateCaveats(validation, challengerAssessment),
      suggestedNextStep: this.generateNextStep(hypothesis, supportingFindings),
      humanReviewNeeded: needsHumanReview,
      implementationHints: this.generateImplementationHints(
        hypothesis,
        supportingFindings,
      ),
      tags: this.generateTags(hypothesis, supportingFindings),
      metadata: {
        generated: new Date().toISOString(),
        version: '2.0.0',
        pipeline: [
          'findings',
          'hypotheses',
          'validation',
          'challenger',
          'ranking',
        ],
      },
    };

    return recommendation;
  }

  private calculatePriorityScore(recommendation: RecommendationV2): number {
    let score = 0;

    // Priority base score
    const priorityScores = { critical: 100, high: 75, medium: 50, low: 25 };
    score += priorityScores[recommendation.priority];

    // Confidence bonus
    score += (recommendation.confidence.overall / 100) * 20;

    // Impact bonus
    const impactBonus = recommendation.expectedImpact.areas.length * 5;
    score += impactBonus;

    // Effort penalty (higher effort = lower priority score)
    const effortPenalties = { small: 0, medium: -5, large: -10 };
    score += effortPenalties[recommendation.estimatedEffort.size];

    // Evidence quality bonus
    score += (recommendation.confidence.evidenceQuality / 100) * 10;

    // Repo specificity bonus
    score += (recommendation.confidence.repoSpecificity / 100) * 10;

    // Category weighting
    const categoryWeights = {
      security: 1.2,
      foundation: 1.1,
      workflow: 1.0,
      ai: 0.9,
      governance: 0.8,
    };
    score *= categoryWeights[recommendation.category];

    return Math.round(score);
  }

  private determinePriority(
    hypothesis: Hypothesis,
    validation: ValidationResult,
    confidence: number,
  ): RecommendationV2['priority'] {
    // Start with hypothesis impact
    let priority: RecommendationV2['priority'] = hypothesis.estimatedImpact;

    // Adjust based on confidence
    if (confidence < 30) {
      priority = 'low';
    } else if (confidence < 60 && priority === 'critical') {
      priority = 'high';
    } else if (confidence < 80 && priority === 'high') {
      priority = 'medium';
    }

    // Adjust based on validation warnings
    if (validation.warnings.length > 2 && priority !== 'low') {
      const priorities: RecommendationV2['priority'][] = [
        'critical',
        'high',
        'medium',
        'low',
      ];
      const currentIndex = priorities.indexOf(priority);
      if (currentIndex < priorities.length - 1) {
        priority = priorities[currentIndex + 1];
      }
    }

    return priority;
  }

  private generateWhyMatters(
    hypothesis: Hypothesis,
    findings: Finding[],
  ): string {
    const categoryReasons = {
      security:
        'Security issues pose risks to code integrity, team safety, and organizational compliance. Addressing security gaps is foundational to safe AI-assisted development.',
      foundation:
        'Foundation issues affect developer experience, onboarding, and project maintainability. Strong foundations enable scalable, sustainable development.',
      workflow:
        'Workflow improvements directly impact development velocity, code quality, and team collaboration. Better workflows reduce friction and increase productivity.',
      ai: 'AI readiness improvements enhance the effectiveness of AI assistance, leading to better code suggestions and more efficient development.',
      governance:
        'Governance improvements ensure consistent decision-making, clear contribution processes, and long-term project health.',
    };

    let baseReason = categoryReasons[hypothesis.category] || '';

    // Add specific context from findings
    if (findings.length > 0) {
      const highSeverityFindings = findings.filter(
        (f) => f.severity === 'high' || f.severity === 'critical',
      );
      if (highSeverityFindings.length > 0) {
        baseReason += ` This is particularly important given the ${highSeverityFindings.length} high-severity issues detected.`;
      }
    }

    return baseReason;
  }

  private generateImpactDescription(hypothesis: Hypothesis): string {
    const impactTemplates = {
      critical:
        'Critical impact on {category} posture and overall development safety',
      high: 'Significant improvement in {category} practices and team productivity',
      medium:
        'Moderate enhancement to {category} processes and developer experience',
      low: 'Minor improvement to {category} hygiene and best practices',
    };

    return impactTemplates[hypothesis.estimatedImpact].replace(
      '{category}',
      hypothesis.category,
    );
  }

  private determineImpactAreas(hypothesis: Hypothesis): string[] {
    const areaMap = {
      security: ['security', 'compliance', 'risk_management'],
      foundation: ['developer_experience', 'onboarding', 'maintainability'],
      workflow: ['productivity', 'code_quality', 'collaboration'],
      ai: ['ai_effectiveness', 'code_generation', 'development_speed'],
      governance: [
        'process_consistency',
        'contribution_quality',
        'project_health',
      ],
    };

    return areaMap[hypothesis.category] || [];
  }

  private generateImpactMetrics(hypothesis: Hypothesis): string[] {
    const metricsMap = {
      security: ['security_score', 'vulnerability_count', 'compliance_status'],
      foundation: [
        'setup_time',
        'onboarding_success_rate',
        'documentation_coverage',
      ],
      workflow: ['deployment_frequency', 'lead_time', 'change_failure_rate'],
      ai: ['ai_adoption_rate', 'code_acceptance_rate', 'development_velocity'],
      governance: [
        'contribution_rate',
        'process_adherence',
        'decision_quality',
      ],
    };

    return metricsMap[hypothesis.category] || [];
  }

  private generateTimeframes(effort: Hypothesis['estimatedEffort']) {
    const timeframes = {
      small: {
        best: '1-2 days',
        expected: '3-5 days',
        worst: '1 week',
      },
      medium: {
        best: '1 week',
        expected: '2-3 weeks',
        worst: '1 month',
      },
      large: {
        best: '2-3 weeks',
        expected: '1-2 months',
        worst: '3 months',
      },
    };

    return timeframes[effort];
  }

  private generateResourceList(hypothesis: Hypothesis): string[] {
    const baseResources = ['developer_time', 'code_review'];

    const categoryResources = {
      security: ['security_review', 'compliance_check'],
      foundation: ['documentation_effort', 'setup_configuration'],
      workflow: ['devops_time', 'process_design'],
      ai: ['ai_tool_configuration', 'team_training'],
      governance: ['stakeholder_input', 'process_documentation'],
    };

    return [
      ...baseResources,
      ...(categoryResources[hypothesis.category] || []),
    ];
  }

  private calculateEvidenceQuality(evidenceAnchors: any[]): number {
    if (evidenceAnchors.length === 0) return 0;

    const totalConfidence = evidenceAnchors.reduce(
      (sum, anchor) => sum + anchor.confidence,
      0,
    );
    return Math.round(totalConfidence / evidenceAnchors.length);
  }

  private calculateRepoSpecificity(hypothesis: Hypothesis): number {
    // Based on validation checks and hypothesis content
    let specificity = 50; // Base score

    // Bonus for specific file references
    if (
      hypothesis.validationChecks.some(
        (check) =>
          check.description.includes('specific') ||
          check.description.includes('file'),
      )
    ) {
      specificity += 20;
    }

    // Bonus for repo-specific language
    if (
      hypothesis.reasoning.includes('this repository') ||
      hypothesis.reasoning.includes('the repository')
    ) {
      specificity += 15;
    }

    // Penalty for generic language
    if (
      hypothesis.description.includes('all repositories') ||
      hypothesis.description.includes('every project')
    ) {
      specificity -= 20;
    }

    return Math.max(0, Math.min(100, specificity));
  }

  private calculateActionability(hypothesis: Hypothesis): number {
    let actionability = 50; // Base score

    // Bonus for clear effort estimate
    if (['small', 'medium', 'large'].includes(hypothesis.estimatedEffort)) {
      actionability += 15;
    }

    // Bonus for validation checks
    if (
      hypothesis.validationChecks.some(
        (check) => check.type === 'actionability',
      )
    ) {
      actionability += 20;
    }

    // Bonus for specific actions in description
    const actionWords = [
      'add',
      'create',
      'implement',
      'configure',
      'establish',
    ];
    if (actionWords.some((word) => hypothesis.description.includes(word))) {
      actionability += 15;
    }

    return Math.max(0, Math.min(100, actionability));
  }

  private generateCaveats(
    validation: ValidationResult,
    challengerAssessment: ChallengerAssessment | undefined,
  ): string[] {
    const caveats: string[] = [];

    // Validation warnings
    caveats.push(...validation.warnings);

    // Challenger criticisms
    if (challengerAssessment) {
      caveats.push(...challengerAssessment.criticisms);
    }

    // Standard caveats based on confidence
    if (validation.confidence < 70) {
      caveats.push('Limited evidence support - verify before implementation');
    }

    if (validation.confidence < 50) {
      caveats.push('Low confidence - requires human validation');
    }

    return caveats;
  }

  private generateNextStep(
    hypothesis: Hypothesis,
    findings: Finding[],
  ): string {
    const categoryNextSteps = {
      security: 'Conduct security review and implement ownership controls',
      foundation: 'Create foundational files and establish project standards',
      workflow: 'Set up automated workflows and testing infrastructure',
      ai: 'Configure AI tools and establish coding guidelines',
      governance: 'Document processes and establish contribution guidelines',
    };

    let nextStep =
      categoryNextSteps[hypothesis.category] ||
      'Analyze requirements and create implementation plan';

    // Make it more specific based on findings
    const missingFileFindings = findings.filter((f) =>
      f.evidenceAnchors.some((a) => a.type === 'missing' && a.path),
    );

    if (missingFileFindings.length > 0) {
      const missingFiles = missingFileFindings
        .flatMap((f) =>
          f.evidenceAnchors
            .filter((a) => a.type === 'missing' && a.path)
            .map((a) => a.path),
        )
        .slice(0, 2); // Limit to 2 files

      if (missingFiles.length > 0) {
        nextStep = `Create ${missingFiles.join(' and ')} to address immediate gaps`;
      }
    }

    return nextStep;
  }

  private generateImplementationHints(
    hypothesis: Hypothesis,
    findings: Finding[],
  ) {
    const hints: RecommendationV2['implementationHints'] = {
      commands: [],
      fileTemplates: [],
      references: [],
    };

    // Generate commands based on category
    const categoryCommands = {
      security: ['touch .github/CODEOWNERS', 'git add .github/CODEOWNERS'],
      foundation: ['touch README.md', 'touch LICENSE', 'touch .gitignore'],
      workflow: [
        'mkdir -p .github/workflows',
        'touch .github/workflows/ci.yml',
      ],
      ai: ['touch .github/copilot-instructions.md'],
      governance: ['touch CONTRIBUTING.md', 'touch CHANGELOG.md'],
    };

    hints.commands = categoryCommands[hypothesis.category] || [];

    // Generate references
    hints.references = [
      'https://docs.github.com/en/get-started/quickstart',
      'https://www.conventionalcommits.org/',
      'https://semver.org/',
    ];

    return hints;
  }

  private generateTags(hypothesis: Hypothesis, findings: Finding[]): string[] {
    const tags = [hypothesis.category];

    // Add severity-based tags
    if (hypothesis.estimatedImpact === 'critical') {
      tags.push('urgent', 'security');
    }

    // Add effort-based tags
    if (hypothesis.estimatedEffort === 'small') {
      tags.push('quick-win');
    } else if (hypothesis.estimatedEffort === 'large') {
      tags.push('significant-effort');
    }

    // Add evidence-based tags
    if (hypothesis.supportingFindings.length > 1) {
      tags.push('well-supported');
    }

    return tags;
  }
}
