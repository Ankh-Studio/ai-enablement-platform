/**
 * Recommendation Engine V2
 *
 * Main orchestrator for the evidence-based recommendation pipeline.
 * Implements the 8-layer agentic architecture principles without fake multi-agent complexity.
 */

import type { TechStackAnalysis } from '../analyzers/tech-stack-analyzer';
import type { EvidenceData } from '../collectors/evidence-collector';
import type { CopilotFeatureAnalysis } from '../scanners/copilot-feature-scanner';
import type { ReadinessScores } from '../scorers/readiness-scorer';
import { Challenger } from './challenger';
import { FeedbackCollector } from './feedback';
import { FindingBuilder } from './finding-builder';
import { HypothesisEngine } from './hypothesis-engine';
import { Ranker } from './ranker';
import type {
  PipelineStageResult,
  RecommendationContext,
  RecommendationEngineResult,
  RecommendationV2,
} from './types';
import { Validator } from './validator';

export interface RecommendationEngineConfig {
  enableChallenger: boolean;
  confidenceThreshold: number;
  humanReviewThreshold: number;
  enableFeedback: boolean;
}

export class RecommendationEngine {
  private config: RecommendationEngineConfig;

  constructor(config: Partial<RecommendationEngineConfig> = {}) {
    this.config = {
      enableChallenger: true,
      confidenceThreshold: 50,
      humanReviewThreshold: 70,
      enableFeedback: true,
      ...config,
    };
  }

  async generateRecommendations(
    repoPath: string,
    evidence: EvidenceData,
    scores: ReadinessScores,
    copilotFeatures: CopilotFeatureAnalysis,
    techStack: TechStackAnalysis,
  ): Promise<RecommendationEngineResult> {
    const startTime = Date.now();

    // Create recommendation context
    const context: RecommendationContext = {
      repoPath,
      evidence,
      scores,
      copilotFeatures,
      techStack,
      config: this.config,
    };

    // Stage 1: Findings - Convert evidence to structured findings
    const findingsResult = await this.runFindingsStage(context);

    // Stage 2: Hypotheses - Generate repo-specific hypotheses
    const hypothesesResult = await this.runHypothesesStage(
      context,
      findingsResult.data,
    );

    // Stage 3: Validation - Validate hypotheses
    const validationResult = await this.runValidationStage(
      context,
      hypothesesResult.data,
      findingsResult.data,
    );

    // Stage 4: Challenger - Challenge weak recommendations
    const challengerResult = await this.runChallengerStage(
      context,
      validationResult.data,
      findingsResult.data,
      hypothesesResult.data,
    );

    // Stage 5: Ranking - Final ranking and prioritization
    const rankingResult = await this.runRankingStage(
      validationResult.data,
      challengerResult.data,
      findingsResult.data,
      hypothesesResult.data,
    );

    const totalDuration = Date.now() - startTime;

    // Compile final result
    const result: RecommendationEngineResult = {
      findings: findingsResult.data,
      hypotheses: hypothesesResult.data,
      validationResults: validationResult.data,
      challengerAssessments: challengerResult.data,
      recommendations: rankingResult.data,
      pipeline: {
        findings: findingsResult,
        hypotheses: hypothesesResult,
        validation: validationResult,
        challenger: challengerResult,
        ranking: rankingResult,
      },
      metadata: {
        totalDuration,
        evidenceCount: this.countEvidenceItems(evidence),
        confidenceDistribution: this.calculateConfidenceDistribution(
          rankingResult.data,
        ),
        categoryDistribution: this.calculateCategoryDistribution(
          rankingResult.data,
        ),
      },
    };

    // Save feedback template if enabled
    if (this.config.enableFeedback) {
      await this.saveFeedbackTemplate(repoPath, rankingResult.data);
    }

    return result;
  }

  private async runFindingsStage(
    context: RecommendationContext,
  ): Promise<PipelineStageResult<any>> {
    const startTime = Date.now();
    const findingBuilder = new FindingBuilder(context);

    try {
      const findings = findingBuilder.buildFindings();

      return {
        stage: 'findings',
        success: true,
        data: findings,
        errors: [],
        warnings: [],
        metadata: {
          duration: Date.now() - startTime,
          inputCount: 1, // context
          outputCount: findings.length,
        },
      };
    } catch (error) {
      return {
        stage: 'findings',
        success: false,
        data: [],
        errors: [
          error instanceof Error
            ? error.message
            : 'Unknown error in findings stage',
        ],
        warnings: [],
        metadata: {
          duration: Date.now() - startTime,
          inputCount: 1,
          outputCount: 0,
        },
      };
    }
  }

  private async runHypothesesStage(
    context: RecommendationContext,
    findings: any[],
  ): Promise<PipelineStageResult<any>> {
    const startTime = Date.now();
    const hypothesisEngine = new HypothesisEngine(context);

    try {
      const hypotheses = hypothesisEngine.generateHypotheses(findings);

      return {
        stage: 'hypotheses',
        success: true,
        data: hypotheses,
        errors: [],
        warnings: [],
        metadata: {
          duration: Date.now() - startTime,
          inputCount: findings.length,
          outputCount: hypotheses.length,
        },
      };
    } catch (error) {
      return {
        stage: 'hypotheses',
        success: false,
        data: [],
        errors: [
          error instanceof Error
            ? error.message
            : 'Unknown error in hypotheses stage',
        ],
        warnings: [],
        metadata: {
          duration: Date.now() - startTime,
          inputCount: findings.length,
          outputCount: 0,
        },
      };
    }
  }

  private async runValidationStage(
    context: RecommendationContext,
    hypotheses: any[],
    findings: any[],
  ): Promise<PipelineStageResult<any>> {
    const startTime = Date.now();
    const validator = new Validator(context);

    try {
      const validationResults = validator.validateHypotheses(
        hypotheses,
        findings,
      );

      return {
        stage: 'validation',
        success: true,
        data: validationResults,
        errors: [],
        warnings: [],
        metadata: {
          duration: Date.now() - startTime,
          inputCount: hypotheses.length,
          outputCount: validationResults.length,
        },
      };
    } catch (error) {
      return {
        stage: 'validation',
        success: false,
        data: [],
        errors: [
          error instanceof Error
            ? error.message
            : 'Unknown error in validation stage',
        ],
        warnings: [],
        metadata: {
          duration: Date.now() - startTime,
          inputCount: hypotheses.length,
          outputCount: 0,
        },
      };
    }
  }

  private async runChallengerStage(
    context: RecommendationContext,
    validationResults: any[],
    findings: any[],
    hypotheses: any[],
  ): Promise<PipelineStageResult<any>> {
    const startTime = Date.now();

    if (!this.config.enableChallenger) {
      return {
        stage: 'challenger',
        success: true,
        data: [],
        errors: [],
        warnings: ['Challenger stage disabled by configuration'],
        metadata: {
          duration: Date.now() - startTime,
          inputCount: validationResults.length,
          outputCount: 0,
        },
      };
    }

    try {
      // First, create preliminary recommendations from validated hypotheses
      const ranker = new Ranker(context);
      const preliminaryRecommendations = ranker.rankRecommendations(
        validationResults,
        [], // No challenger assessments yet
        findings,
        hypotheses,
      );

      // Then challenge them
      const challenger = new Challenger(context);
      const challengerAssessments = challenger.challengeRecommendations(
        preliminaryRecommendations,
        findings,
        hypotheses,
        validationResults,
      );

      return {
        stage: 'challenger',
        success: true,
        data: challengerAssessments,
        errors: [],
        warnings: [],
        metadata: {
          duration: Date.now() - startTime,
          inputCount: validationResults.length,
          outputCount: challengerAssessments.length,
        },
      };
    } catch (error) {
      return {
        stage: 'challenger',
        success: false,
        data: [],
        errors: [
          error instanceof Error
            ? error.message
            : 'Unknown error in challenger stage',
        ],
        warnings: [],
        metadata: {
          duration: Date.now() - startTime,
          inputCount: validationResults.length,
          outputCount: 0,
        },
      };
    }
  }

  private async runRankingStage(
    validationResults: any[],
    challengerAssessments: any[],
    findings: any[],
    hypotheses: any[],
  ): Promise<PipelineStageResult<any>> {
    const startTime = Date.now();
    const ranker = new Ranker(this.createRankingContext());

    try {
      const recommendations = ranker.rankRecommendations(
        validationResults,
        challengerAssessments,
        findings,
        hypotheses,
      );

      return {
        stage: 'ranking',
        success: true,
        data: recommendations,
        errors: [],
        warnings: [],
        metadata: {
          duration: Date.now() - startTime,
          inputCount: validationResults.length,
          outputCount: recommendations.length,
        },
      };
    } catch (error) {
      return {
        stage: 'ranking',
        success: false,
        data: [],
        errors: [
          error instanceof Error
            ? error.message
            : 'Unknown error in ranking stage',
        ],
        warnings: [],
        metadata: {
          duration: Date.now() - startTime,
          inputCount: validationResults.length,
          outputCount: 0,
        },
      };
    }
  }

  private createRankingContext(): RecommendationContext {
    // Create a minimal context for ranking
    // In a real implementation, we'd pass the full context through
    return {
      repoPath: '',
      evidence: {} as any,
      scores: {} as any,
      copilotFeatures: {} as any,
      techStack: {} as any,
      config: this.config,
    };
  }

  private countEvidenceItems(evidence: EvidenceData): number {
    let count = 0;

    // Count file-based evidence
    count += Object.values(evidence.structure).filter(Boolean).length;
    count += Object.values(evidence.configuration).filter(Boolean).length;

    // Count pattern evidence
    count += Object.values(evidence.patterns).filter((p) =>
      typeof p === 'number' ? p > 0 : Boolean(p),
    ).length;

    // Count metrics
    count += Object.values(evidence.metrics).filter(
      (m) => (typeof m === 'number' ? m > 0 : m !== 'fair'), // 'fair' is the default placeholder
    ).length;

    return count;
  }

  private calculateConfidenceDistribution(recommendations: RecommendationV2[]) {
    const distribution = { high: 0, medium: 0, low: 0 };

    for (const rec of recommendations) {
      if (rec.confidence.overall >= 70) distribution.high++;
      else if (rec.confidence.overall >= 40) distribution.medium++;
      else distribution.low++;
    }

    return distribution;
  }

  private calculateCategoryDistribution(
    recommendations: RecommendationV2[],
  ): Record<string, number> {
    const distribution: Record<string, number> = {};

    for (const rec of recommendations) {
      distribution[rec.category] = (distribution[rec.category] || 0) + 1;
    }

    return distribution;
  }

  private async saveFeedbackTemplate(
    repoPath: string,
    recommendations: RecommendationV2[],
  ): Promise<void> {
    try {
      const feedbackCollector = new FeedbackCollector(repoPath);
      const template =
        feedbackCollector.generateFeedbackTemplate(recommendations);

      // Save template file for human review
      const { writeFile } = await import('node:fs/promises');
      const { join } = await import('node:path');

      const templatePath = join(
        repoPath,
        '.ai-enablement',
        'feedback-template.json',
      );
      await writeFile(templatePath, template, 'utf-8');

      console.log(`📝 Feedback template saved to: ${templatePath}`);
    } catch (error) {
      console.warn('Could not save feedback template:', error);
    }
  }

  // Utility method to convert V2 recommendations to legacy format for compatibility
  toLegacyRecommendations(v2Recommendations: RecommendationV2[]): any[] {
    return v2Recommendations.map((rec) => ({
      id: rec.id,
      title: rec.title,
      description: rec.summary,
      priority: rec.priority,
      category: rec.category,
      effort: rec.estimatedEffort.size,
      timeframe: rec.estimatedEffort.timeframes.expected,
      dependencies: [], // V2 doesn't track dependencies the same way
      evidence: rec.evidenceAnchors.map((a) => a.description),
    }));
  }
}
