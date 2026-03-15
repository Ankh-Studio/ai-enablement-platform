/**
 * Hypothesis Engine
 *
 * Converts findings into repo-specific hypotheses.
 * A hypothesis is an inferred issue/opportunity that needs validation.
 */

import type {
  Finding,
  Hypothesis,
  RecommendationContext,
  ValidationCheck,
} from './types';

export class HypothesisEngine {
  private context: RecommendationContext;

  constructor(context: RecommendationContext) {
    this.context = context;
  }

  generateHypotheses(findings: Finding[]): Hypothesis[] {
    const hypotheses: Hypothesis[] = [];

    // Group findings by category for hypothesis generation
    const findingsByCategory = this.groupFindingsByCategory(findings);

    // Generate hypotheses for each category
    for (const [category, categoryFindings] of Object.entries(
      findingsByCategory,
    )) {
      hypotheses.push(
        ...this.generateCategoryHypotheses(
          category as Finding['category'],
          categoryFindings,
        ),
      );
    }

    // Generate cross-category hypotheses
    hypotheses.push(...this.generateCrossCategoryHypotheses(findings));

    return hypotheses;
  }

  private groupFindingsByCategory(
    findings: Finding[],
  ): Record<string, Finding[]> {
    const grouped: Record<string, Finding[]> = {};

    for (const finding of findings) {
      if (!grouped[finding.category]) {
        grouped[finding.category] = [];
      }
      grouped[finding.category].push(finding);
    }

    return grouped;
  }

  private generateCategoryHypotheses(
    category: Finding['category'],
    findings: Finding[],
  ): Hypothesis[] {
    const hypotheses: Hypothesis[] = [];

    switch (category) {
      case 'security':
        hypotheses.push(...this.generateSecurityHypotheses(findings));
        break;
      case 'foundation':
        hypotheses.push(...this.generateFoundationHypotheses(findings));
        break;
      case 'workflow':
        hypotheses.push(...this.generateWorkflowHypotheses(findings));
        break;
      case 'ai':
        hypotheses.push(...this.generateAIHypotheses(findings));
        break;
      case 'governance':
        hypotheses.push(...this.generateGovernanceHypotheses(findings));
        break;
    }

    return hypotheses;
  }

  private generateSecurityHypotheses(findings: Finding[]): Hypothesis[] {
    const hypotheses: Hypothesis[] = [];

    // CODEOWNERS hypothesis
    const codeownersFinding = findings.find(
      (f) => f.id === 'found-missing-codeowners',
    );
    if (codeownersFinding) {
      hypotheses.push({
        id: 'hyp-codeowners-velocity',
        title: 'Lack of CODEOWNERS may reduce safe AI-assisted change velocity',
        description:
          'Without clear code ownership, AI-assisted changes may lack proper review and approval pathways, potentially reducing the safety and speed of AI-driven development.',
        category: 'security',
        supportingFindings: [codeownersFinding.id],
        reasoning:
          'CODEOWNERS files establish clear ownership and review requirements. In AI-assisted development, this becomes critical for ensuring AI-generated changes receive appropriate human oversight.',
        confidence: 75,
        alternativeInterpretations: [
          'Team may use alternative approval mechanisms',
          'Repository may not require formal review processes',
          'Code ownership might be documented elsewhere',
        ],
        validationChecks: [
          {
            id: 'vc-codeowners-alternatives',
            type: 'repo_specificity',
            description: 'Check if alternative approval mechanisms exist',
            expected: 'No alternative approval mechanisms found',
          },
          {
            id: 'vc-codeowners-necessity',
            type: 'actionability',
            description: 'Assess if CODEOWNERS is necessary for this repo type',
            expected: 'Repository would benefit from clear ownership',
          },
        ],
        estimatedImpact: 'high',
        estimatedEffort: 'small',
      });
    }

    // Dependency health hypothesis
    const depFinding = findings.find((f) => f.id === 'found-poor-dependencies');
    if (depFinding) {
      hypotheses.push({
        id: 'hyp-deps-security-risk',
        title:
          'Poor dependency health indicates potential security vulnerabilities',
        description:
          "The repository's dependencies show signs of poor maintenance, which could introduce security vulnerabilities and compatibility issues.",
        category: 'security',
        supportingFindings: [depFinding.id],
        reasoning:
          'Poor dependency health often indicates outdated packages with known vulnerabilities or lack of security updates.',
        confidence: 70,
        alternativeInterpretations: [
          'Dependencies may be stable but infrequently updated',
          'Security scanning might be handled separately',
          'Repository might use dependency pinning for stability',
        ],
        validationChecks: [
          {
            id: 'vc-deps-actual-vulnerabilities',
            type: 'evidence_strength',
            description: 'Check for actual security vulnerabilities',
            expected: 'Security audit would reveal vulnerabilities',
          },
          {
            id: 'vc-deps-update-frequency',
            type: 'repo_specificity',
            description: 'Assess dependency update patterns',
            expected: 'Dependencies are significantly outdated',
          },
        ],
        estimatedImpact: 'high',
        estimatedEffort: 'medium',
      });
    }

    return hypotheses;
  }

  private generateFoundationHypotheses(findings: Finding[]): Hypothesis[] {
    const hypotheses: Hypothesis[] = [];

    // Multiple foundation issues hypothesis
    const criticalFoundationFindings = findings.filter(
      (f) =>
        f.category === 'foundation' &&
        (f.severity === 'high' || f.severity === 'critical'),
    );

    if (criticalFoundationFindings.length >= 2) {
      hypotheses.push({
        id: 'hyp-foundation-immaturity',
        title: 'Multiple foundation issues indicate repository immaturity',
        description:
          "The repository shows several foundational gaps that suggest it's in early stages of development or lacks proper project hygiene.",
        category: 'foundation',
        supportingFindings: criticalFoundationFindings.map((f) => f.id),
        reasoning:
          'Multiple foundational issues (README, license, .gitignore, etc.) indicate lack of project maturity and potentially poor developer experience.',
        confidence: 85,
        alternativeInterpretations: [
          'Repository might be intentionally minimal',
          'Project might be internal or temporary',
          'Documentation might exist in external systems',
        ],
        validationChecks: [
          {
            id: 'vc-foundation-repo-age',
            type: 'repo_specificity',
            description: 'Check repository age and activity',
            expected: 'Repository is relatively new or inactive',
          },
          {
            id: 'vc-foundation-project-type',
            type: 'actionability',
            description:
              'Assess if foundation items are needed for this project type',
            expected: 'Project would benefit from standard foundation items',
          },
        ],
        estimatedImpact: 'medium',
        estimatedEffort: 'medium',
      });
    }

    // TypeScript configuration hypothesis
    const tsFinding = findings.find(
      (f) => f.id === 'found-typescript-unconfigured',
    );
    if (tsFinding) {
      hypotheses.push({
        id: 'hyp-typescript-consistency',
        title: 'Unconfigured TypeScript may lead to inconsistent code quality',
        description:
          'TypeScript files exist without proper configuration, which could lead to inconsistent type checking and reduced developer experience.',
        category: 'foundation',
        supportingFindings: [tsFinding.id],
        reasoning:
          'TypeScript configuration ensures consistent type checking across the project. Without it, developers may have different experiences and code quality may vary.',
        confidence: 80,
        alternativeInterpretations: [
          'TypeScript might be used with default settings',
          'Configuration might be inherited from parent package',
          'Project might be in migration phase',
        ],
        validationChecks: [
          {
            id: 'vc-typescript-usage',
            type: 'evidence_strength',
            description: 'Verify actual TypeScript usage extent',
            expected: 'Significant TypeScript files exist',
          },
          {
            id: 'vc-typescript-config-impact',
            type: 'actionability',
            description: 'Assess impact of missing configuration',
            expected: 'Configuration would significantly improve development',
          },
        ],
        estimatedImpact: 'medium',
        estimatedEffort: 'small',
      });
    }

    return hypotheses;
  }

  private generateWorkflowHypotheses(findings: Finding[]): Hypothesis[] {
    const hypotheses: Hypothesis[] = [];

    // No CI/CD hypothesis
    const ciFinding = findings.find((f) => f.id === 'found-no-ci');
    if (ciFinding) {
      hypotheses.push({
        id: 'hyp-ci-automation-gap',
        title: 'Lack of CI/CD indicates manual deployment and higher risk',
        description:
          'Without automated CI/CD, the repository relies on manual processes which increase deployment risk and reduce development velocity.',
        category: 'workflow',
        supportingFindings: [ciFinding.id],
        reasoning:
          'CI/CD automation is standard practice for reliable deployments and quality control. Manual processes are error-prone and slow.',
        confidence: 90,
        alternativeInterpretations: [
          'Repository might be deployed through external systems',
          'Project might not require automated deployments',
          'CI/CD might be handled at organizational level',
        ],
        validationChecks: [
          {
            id: 'vc-ci-deployment-frequency',
            type: 'repo_specificity',
            description: 'Check deployment patterns and frequency',
            expected: 'Manual deployments would benefit from automation',
          },
          {
            id: 'vc-ci-complexity',
            type: 'actionability',
            description: 'Assess if CI/CD setup is feasible',
            expected: 'Project complexity warrants CI/CD implementation',
          },
        ],
        estimatedImpact: 'high',
        estimatedEffort: 'medium',
      });
    }

    // No tests hypothesis
    const testFinding = findings.find((f) => f.id === 'found-no-tests');
    if (testFinding) {
      hypotheses.push({
        id: 'hyp-testing-quality-risk',
        title: 'No test configuration indicates quality and maintenance risks',
        description:
          'The absence of test configuration suggests minimal automated testing, which increases the risk of bugs and makes changes more dangerous.',
        category: 'workflow',
        supportingFindings: [testFinding.id],
        reasoning:
          'Automated testing is essential for maintaining code quality and enabling safe refactoring. Without tests, changes are risky and maintenance is costly.',
        confidence: 85,
        alternativeInterpretations: [
          'Testing might be done manually or externally',
          'Project might be simple enough to not need tests',
          'Tests might exist but not be configured for the test runner',
        ],
        validationChecks: [
          {
            id: 'vc-testing-complexity',
            type: 'repo_specificity',
            description: 'Assess project complexity and testing needs',
            expected: 'Project complexity warrants automated testing',
          },
          {
            id: 'vc-testing-implementation',
            type: 'actionability',
            description: 'Evaluate feasibility of implementing tests',
            expected: 'Testing implementation would provide significant value',
          },
        ],
        estimatedImpact: 'high',
        estimatedEffort: 'large',
      });
    }

    return hypotheses;
  }

  private generateAIHypotheses(findings: Finding[]): Hypothesis[] {
    const hypotheses: Hypothesis[] = [];

    // No Copilot instructions hypothesis
    const copilotFinding = findings.find(
      (f) => f.id === 'found-no-copilot-instructions',
    );
    if (copilotFinding) {
      hypotheses.push({
        id: 'hyp-copilot-effectiveness',
        title:
          'Lack of Copilot instructions reduces AI assistance effectiveness',
        description:
          'Without specific Copilot instructions, AI assistance may not align with project standards and coding practices, reducing its effectiveness.',
        category: 'ai',
        supportingFindings: [copilotFinding.id],
        reasoning:
          'Copilot instructions guide AI tools to generate code that matches project patterns, standards, and preferences. Without them, AI assistance is generic and less valuable.',
        confidence: 75,
        alternativeInterpretations: [
          'Code patterns might be self-documenting',
          'Team might not use AI assistance extensively',
          'Instructions might exist in project documentation',
        ],
        validationChecks: [
          {
            id: 'vc-copilot-usage',
            type: 'repo_specificity',
            description: 'Assess AI tool usage in the project',
            expected: 'AI assistance would benefit from specific guidance',
          },
          {
            id: 'vc-copilot-patterns',
            type: 'actionability',
            description:
              'Evaluate if project has specific patterns worth documenting',
            expected: 'Project has unique patterns that AI should follow',
          },
        ],
        estimatedImpact: 'medium',
        estimatedEffort: 'small',
      });
    }

    return hypotheses;
  }

  private generateGovernanceHypotheses(findings: Finding[]): Hypothesis[] {
    const hypotheses: Hypothesis[] = [];

    // No contributing guidelines hypothesis
    const contributingFinding = findings.find(
      (f) => f.id === 'found-no-contributing',
    );
    if (contributingFinding) {
      hypotheses.push({
        id: 'hyp-contribution-barrier',
        title: 'Missing contributing guidelines creates contribution barriers',
        description:
          'Without clear contribution guidelines, potential contributors face uncertainty and may abandon participation, limiting community growth.',
        category: 'governance',
        supportingFindings: [contributingFinding.id],
        reasoning:
          'Contributing guidelines lower the barrier to entry by clearly communicating expectations, processes, and standards for participation.',
        confidence: 70,
        alternativeInterpretations: [
          'Project might not accept external contributions',
          'Guidelines might be documented in README',
          'Project might be intentionally closed to contributions',
        ],
        validationChecks: [
          {
            id: 'vc-contribution-activity',
            type: 'repo_specificity',
            description: 'Check if repository accepts external contributions',
            expected: 'Repository would benefit from external contributions',
          },
          {
            id: 'vc-contribution-clarity',
            type: 'actionability',
            description: 'Assess if contribution process is unclear',
            expected: 'Contribution process would be clearer with guidelines',
          },
        ],
        estimatedImpact: 'medium',
        estimatedEffort: 'small',
      });
    }

    return hypotheses;
  }

  private generateCrossCategoryHypotheses(findings: Finding[]): Hypothesis[] {
    const hypotheses: Hypothesis[] = [];

    // Security + Workflow hypothesis
    const securityFindings = findings.filter(
      (f) => f.category === 'security' && f.severity === 'high',
    );
    const workflowFindings = findings.filter(
      (f) => f.category === 'workflow' && f.severity === 'high',
    );

    if (securityFindings.length > 0 && workflowFindings.length > 0) {
      hypotheses.push({
        id: 'hyp-security-workflow-gap',
        title: 'Security and workflow gaps indicate process immaturity',
        description:
          'The combination of security and workflow issues suggests the repository lacks mature development processes that could pose risks for AI-assisted development.',
        category: 'governance',
        supportingFindings: [
          ...securityFindings.map((f) => f.id),
          ...workflowFindings.map((f) => f.id),
        ],
        reasoning:
          'Mature development processes integrate security practices into automated workflows. Gaps in both areas suggest process immaturity.',
        confidence: 80,
        alternativeInterpretations: [
          'Security might be handled through external processes',
          'Workflow might be intentionally simple',
          'Project might be in early development phase',
        ],
        validationChecks: [
          {
            id: 'vc-process-maturity',
            type: 'repo_specificity',
            description: 'Assess overall development process maturity',
            expected:
              'Process maturity is low and would benefit from improvement',
          },
          {
            id: 'vc-ai-readiness',
            type: 'actionability',
            description: 'Evaluate impact on AI-assisted development',
            expected:
              'Process gaps would significantly impact AI development safety',
          },
        ],
        estimatedImpact: 'high',
        estimatedEffort: 'large',
      });
    }

    return hypotheses;
  }
}
