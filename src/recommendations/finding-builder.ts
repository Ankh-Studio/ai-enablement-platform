/**
 * Finding Builder
 *
 * Converts collected evidence into structured findings.
 * A finding is a grounded fact, not advice.
 */

import type { TechStackAnalysis } from '../analyzers/tech-stack-analyzer';
import type { EvidenceData } from '../collectors/evidence-collector';
import type { CopilotFeatureAnalysis } from '../scanners/copilot-feature-scanner';
import type { EvidenceAnchor, Finding, RecommendationContext } from './types';

export class FindingBuilder {
  private context: RecommendationContext;

  constructor(context: RecommendationContext) {
    this.context = context;
  }

  buildFindings(): Finding[] {
    const findings: Finding[] = [];

    // Foundation findings
    findings.push(...this.buildFoundationFindings());

    // Security findings
    findings.push(...this.buildSecurityFindings());

    // Workflow findings
    findings.push(...this.buildWorkflowFindings());

    // AI findings
    findings.push(...this.buildAIFindings());

    // Governance findings
    findings.push(...this.buildGovernanceFindings());

    return findings;
  }

  private buildFoundationFindings(): Finding[] {
    const findings: Finding[] = [];
    const { evidence } = this.context;

    // Missing README
    if (!evidence.structure.hasReadme) {
      findings.push(
        this.createFinding(
          'found-missing-readme',
          'foundation',
          'medium',
          'Repository lacks README documentation',
          [
            {
              type: 'missing',
              path: 'README.md',
              description: 'No README.md found in repository root',
              confidence: 100,
            },
          ],
          ['README.md'],
        ),
      );
    }

    // Missing license
    if (!evidence.structure.hasLicense) {
      findings.push(
        this.createFinding(
          'found-missing-license',
          'foundation',
          'high',
          'Repository lacks license file',
          [
            {
              type: 'missing',
              path: 'LICENSE',
              description: 'No LICENSE file found',
              confidence: 100,
            },
          ],
          ['LICENSE'],
        ),
      );
    }

    // Poor structure depth
    if (evidence.structure.directoryDepth > 8) {
      findings.push(
        this.createFinding(
          'found-deep-structure',
          'foundation',
          'medium',
          'Repository has excessively deep directory structure',
          [
            {
              type: 'metric',
              metric: {
                name: 'directory_depth',
                value: evidence.structure.directoryDepth,
                threshold: 8,
              },
              description: `Directory depth is ${evidence.structure.directoryDepth} levels (recommended: ≤8)`,
              confidence: 90,
            },
          ],
          [],
        ),
      );
    }

    // Missing .gitignore
    if (!evidence.configuration.hasGitignore) {
      findings.push(
        this.createFinding(
          'found-missing-gitignore',
          'foundation',
          'high',
          'Repository lacks .gitignore file',
          [
            {
              type: 'missing',
              path: '.gitignore',
              description: 'No .gitignore file found',
              confidence: 100,
            },
          ],
          ['.gitignore'],
        ),
      );
    }

    // No TypeScript configuration
    if (!evidence.configuration.hasTypeScript && this.isTypeScriptProject()) {
      findings.push(
        this.createFinding(
          'found-typescript-unconfigured',
          'foundation',
          'medium',
          'TypeScript project lacks configuration',
          [
            {
              type: 'missing',
              path: 'tsconfig.json',
              description:
                'TypeScript files detected but no tsconfig.json found',
              confidence: 95,
            },
          ],
          ['tsconfig.json'],
        ),
      );
    }

    return findings;
  }

  private buildSecurityFindings(): Finding[] {
    const findings: Finding[] = [];
    const { copilotFeatures } = this.context;

    // Missing CODEOWNERS
    if (!copilotFeatures.githubFeatures.codeowners.found) {
      findings.push(
        this.createFinding(
          'found-missing-codeowners',
          'security',
          'high',
          'Repository lacks CODEOWNERS file',
          [
            {
              type: 'missing',
              path: '.github/CODEOWNERS',
              description: 'No CODEOWNERS file found for code ownership rules',
              confidence: 100,
            },
          ],
          ['.github/CODEOWNERS'],
        ),
      );
    }

    // Weak dependency health
    if (this.context.evidence.metrics.dependencyHealth === 'poor') {
      findings.push(
        this.createFinding(
          'found-poor-dependencies',
          'security',
          'high',
          'Repository has poor dependency health',
          [
            {
              type: 'metric',
              metric: {
                name: 'dependency_health',
                value: this.context.evidence.metrics.dependencyHealth,
              },
              description:
                'Dependency health assessment indicates security or maintenance issues',
              confidence: 70,
            },
          ],
          ['package.json', 'yarn.lock', 'package-lock.json'],
        ),
      );
    }

    return findings;
  }

  private buildWorkflowFindings(): Finding[] {
    const findings: Finding[] = [];
    const { evidence, copilotFeatures } = this.context;

    // No CI/CD
    if (!evidence.configuration.hasCi) {
      findings.push(
        this.createFinding(
          'found-no-ci',
          'workflow',
          'high',
          'Repository lacks CI/CD configuration',
          [
            {
              type: 'missing',
              path: '.github/workflows/',
              description: 'No CI/CD workflows found in .github/workflows/',
              confidence: 100,
            },
          ],
          ['.github/workflows/'],
        ),
      );
    }

    // No test configuration
    if (!evidence.configuration.hasTests) {
      findings.push(
        this.createFinding(
          'found-no-tests',
          'workflow',
          'high',
          'Repository lacks test configuration',
          [
            {
              type: 'missing',
              description: 'No test framework configuration detected',
              confidence: 90,
            },
          ],
          [],
        ),
      );
    }

    // Missing PR templates
    if (!copilotFeatures.githubFeatures.prTemplates.found) {
      findings.push(
        this.createFinding(
          'found-no-pr-templates',
          'workflow',
          'medium',
          'Repository lacks PR templates',
          [
            {
              type: 'missing',
              path: '.github/pull_request_template.md',
              description:
                'No PR template found for standardizing contributions',
              confidence: 100,
            },
          ],
          ['.github/pull_request_template.md'],
        ),
      );
    }

    return findings;
  }

  private buildAIFindings(): Finding[] {
    const findings: Finding[] = [];
    const { copilotFeatures } = this.context;

    // Missing Copilot instructions
    if (!copilotFeatures.githubFeatures.copilotInstructions.found) {
      findings.push(
        this.createFinding(
          'found-no-copilot-instructions',
          'ai',
          'medium',
          'Repository lacks Copilot instructions',
          [
            {
              type: 'missing',
              path: '.github/copilot-instructions.md',
              description:
                'No Copilot instructions found for AI assistance guidance',
              confidence: 100,
            },
          ],
          ['.github/copilot-instructions.md'],
        ),
      );
    }

    // Low AI-friendly comment ratio
    if (copilotFeatures.codePatterns.aiFriendlyComments < 5) {
      findings.push(
        this.createFinding(
          'found-low-ai-comments',
          'ai',
          'low',
          'Low AI-friendly comment density',
          [
            {
              type: 'metric',
              metric: {
                name: 'ai_friendly_comments',
                value: copilotFeatures.codePatterns.aiFriendlyComments,
                threshold: 5,
              },
              description: `Only ${copilotFeatures.codePatterns.aiFriendlyComments} AI-friendly comment patterns found`,
              confidence: 80,
            },
          ],
          [],
        ),
      );
    }

    return findings;
  }

  private buildGovernanceFindings(): Finding[] {
    const findings: Finding[] = [];
    const { evidence } = this.context;

    // No contributing guidelines
    if (!evidence.structure.hasContributing) {
      findings.push(
        this.createFinding(
          'found-no-contributing',
          'governance',
          'medium',
          'Repository lacks contributing guidelines',
          [
            {
              type: 'missing',
              path: 'CONTRIBUTING.md',
              description: 'No CONTRIBUTING.md found for contribution process',
              confidence: 100,
            },
          ],
          ['CONTRIBUTING.md'],
        ),
      );
    }

    // No changelog
    if (!evidence.structure.hasChangelog) {
      findings.push(
        this.createFinding(
          'found-no-changelog',
          'governance',
          'low',
          'Repository lacks changelog',
          [
            {
              type: 'missing',
              path: 'CHANGELOG.md',
              description: 'No CHANGELOG.md found for tracking changes',
              confidence: 100,
            },
          ],
          ['CHANGELOG.md'],
        ),
      );
    }

    // Low documentation coverage
    if (evidence.patterns.documentationCoverage < 10) {
      findings.push(
        this.createFinding(
          'found-low-docs',
          'governance',
          'medium',
          'Low documentation coverage',
          [
            {
              type: 'metric',
              metric: {
                name: 'documentation_coverage',
                value: evidence.patterns.documentationCoverage,
                threshold: 10,
              },
              description: `Documentation coverage is only ${evidence.patterns.documentationCoverage}%`,
              confidence: 85,
            },
          ],
          [],
        ),
      );
    }

    return findings;
  }

  private createFinding(
    id: string,
    category: Finding['category'],
    severity: Finding['severity'],
    summary: string,
    evidenceAnchors: EvidenceAnchor[],
    affectedFiles: string[],
  ): Finding {
    return {
      id,
      category,
      severity,
      summary,
      evidenceAnchors,
      affectedFiles,
      relatedScores: this.getRelatedScores(category),
      metadata: {
        detectionMethod: 'deterministic_pattern_match',
        reproducible: true,
        timestamp: new Date().toISOString(),
      },
    };
  }

  private getRelatedScores(category: Finding['category']) {
    const { scores } = this.context;
    const scoreMap = {
      foundation: ['foundation'],
      security: ['security'],
      workflow: ['workflow'],
      ai: ['ai'],
      governance: ['governance'],
    };

    return scoreMap[category].map((scoreCategory) => ({
      category: scoreCategory,
      score: scores.breakdown[scoreCategory as keyof typeof scores.breakdown],
      impact: 'negative' as const,
    }));
  }

  private isTypeScriptProject(): boolean {
    // Simple heuristic: check for .ts files or TypeScript dependencies
    const { techStack } = this.context;
    return (
      techStack.aiReadiness.typescriptUsage ||
      this.context.evidence.configuration.hasTypeScript
    );
  }
}
