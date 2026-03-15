/**
 * Feedback Collection
 *
 * Simple local feedback mechanism for iterative improvement.
 * Allows human reviewers to grade recommendation quality.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RecommendationFeedback, RecommendationV2 } from './types';

export class FeedbackCollector {
  private feedbackPath: string;
  private feedback: RecommendationFeedback[] = [];

  constructor(repoPath: string) {
    this.feedbackPath = join(
      repoPath,
      '.ai-enablement',
      'recommendation-feedback.json',
    );
  }

  async loadFeedback(): Promise<void> {
    try {
      const data = await readFile(this.feedbackPath, 'utf-8');
      this.feedback = JSON.parse(data);
    } catch (error) {
      // File doesn't exist or is invalid, start with empty feedback
      this.feedback = [];
    }
  }

  async saveFeedback(): Promise<void> {
    try {
      await writeFile(
        this.feedbackPath,
        JSON.stringify(this.feedback, null, 2),
        'utf-8',
      );
    } catch (error) {
      console.warn('Could not save feedback file:', error);
    }
  }

  addFeedback(feedback: Omit<RecommendationFeedback, 'timestamp'>): void {
    const fullFeedback: RecommendationFeedback = {
      ...feedback,
      timestamp: new Date().toISOString(),
    };

    this.feedback.push(fullFeedback);
  }

  getFeedbackForRecommendation(
    recommendationId: string,
  ): RecommendationFeedback[] {
    return this.feedback.filter((f) => f.recommendationId === recommendationId);
  }

  getAllFeedback(): RecommendationFeedback[] {
    return this.feedback;
  }

  getFeedbackStats(): {
    total: number;
    averageScores: {
      grounded: number;
      correct: number;
      specific: number;
      actionable: number;
      valuable: number;
    };
    implementationRate: number;
  } {
    if (this.feedback.length === 0) {
      return {
        total: 0,
        averageScores: {
          grounded: 0,
          correct: 0,
          specific: 0,
          actionable: 0,
          valuable: 0,
        },
        implementationRate: 0,
      };
    }

    const scores = this.feedback.reduce(
      (acc, f) => ({
        grounded: acc.grounded + f.scores.grounded,
        correct: acc.correct + f.scores.correct,
        specific: acc.specific + f.scores.specific,
        actionable: acc.actionable + f.scores.actionable,
        valuable: acc.valuable + f.scores.valuable,
      }),
      { grounded: 0, correct: 0, specific: 0, actionable: 0, valuable: 0 },
    );

    const implemented = this.feedback.filter((f) => f.implemented).length;

    return {
      total: this.feedback.length,
      averageScores: {
        grounded: scores.grounded / this.feedback.length,
        correct: scores.correct / this.feedback.length,
        specific: scores.specific / this.feedback.length,
        actionable: scores.actionable / this.feedback.length,
        valuable: scores.valuable / this.feedback.length,
      },
      implementationRate: implemented / this.feedback.length,
    };
  }

  generateFeedbackTemplate(recommendations: RecommendationV2[]): string {
    const template = {
      instructions:
        'Rate each recommendation on a scale of 0-2 for each criterion',
      criteria: {
        grounded:
          'How well is the recommendation grounded in concrete evidence?',
        correct: 'How accurate is the recommendation for this repository?',
        specific: 'How specific and actionable is the recommendation?',
        actionable: 'How easy is it to implement this recommendation?',
        valuable: 'How valuable would this recommendation be if implemented?',
      },
      scale: {
        0: 'Poor - fails completely',
        1: 'Fair - meets expectations',
        2: 'Excellent - exceeds expectations',
      },
      recommendations: recommendations.map((rec) => ({
        recommendationId: rec.id,
        title: rec.title,
        category: rec.category,
        priority: rec.priority,
        summary: rec.summary,
        scores: {
          grounded: 0, // Fill in 0-2
          correct: 0, // Fill in 0-2
          specific: 0, // Fill in 0-2
          actionable: 0, // Fill in 0-2
          valuable: 0, // Fill in 0-2
        },
        notes: '', // Optional notes about this recommendation
        implemented: false, // Will you implement this?
        implementationNotes: '', // Notes about implementation if applicable
      })),
    };

    return JSON.stringify(template, null, 2);
  }

  async processFeedbackTemplate(templateJson: string): Promise<void> {
    try {
      const template = JSON.parse(templateJson);

      if (
        !template.recommendations ||
        !Array.isArray(template.recommendations)
      ) {
        throw new Error('Invalid template format');
      }

      for (const recFeedback of template.recommendations) {
        this.addFeedback({
          recommendationId: recFeedback.recommendationId,
          reviewer: 'human', // Could be parameterized
          scores: recFeedback.scores,
          notes: recFeedback.notes,
          implemented: recFeedback.implemented,
          implementationNotes: recFeedback.implementationNotes,
        });
      }

      await this.saveFeedback();
    } catch (error) {
      console.error('Error processing feedback template:', error);
      throw error;
    }
  }

  getRecommendationQualityTrends(): {
    byCategory: Record<
      string,
      {
        count: number;
        averageScore: number;
        implementationRate: number;
      }
    >;
    byPriority: Record<
      string,
      {
        count: number;
        averageScore: number;
        implementationRate: number;
      }
    >;
  } {
    const trends = {
      byCategory: {} as Record<string, any>,
      byPriority: {} as Record<string, any>,
    };

    // Group feedback by category and priority
    for (const feedback of this.feedback) {
      // Find the recommendation to get category/priority (this would need to be passed in)
      // For now, we'll just aggregate by scores

      const totalScore = Object.values(feedback.scores).reduce(
        (sum, score) => sum + score,
        0,
      );
      const maxScore = Object.values(feedback.scores).length * 2;
      const normalizedScore = totalScore / maxScore;
    }

    return trends;
  }

  identifyLowQualityRecommendations(threshold: number = 0.5): string[] {
    const lowQualityIds: string[] = [];

    for (const feedback of this.feedback) {
      const totalScore = Object.values(feedback.scores).reduce(
        (sum, score) => sum + score,
        0,
      );
      const maxScore = Object.values(feedback.scores).length * 2;
      const normalizedScore = totalScore / maxScore;

      if (normalizedScore < threshold) {
        lowQualityIds.push(feedback.recommendationId);
      }
    }

    return [...new Set(lowQualityIds)]; // Remove duplicates
  }

  identifyHighValueRecommendations(threshold: number = 0.8): string[] {
    const highValueIds: string[] = [];

    for (const feedback of this.feedback) {
      if (feedback.scores.valuable >= 1.5 && feedback.implemented) {
        highValueIds.push(feedback.recommendationId);
      }
    }

    return [...new Set(highValueIds)]; // Remove duplicates
  }

  generateQualityReport(): string {
    const stats = this.getFeedbackStats();
    const lowQuality = this.identifyLowQualityRecommendations();
    const highValue = this.identifyHighValueRecommendations();

    return `
# Recommendation Quality Report

## Overall Statistics
- Total recommendations reviewed: ${stats.total}
- Average scores (0-2 scale):
  - Grounded: ${stats.averageScores.grounded.toFixed(2)}
  - Correct: ${stats.averageScores.correct.toFixed(2)}
  - Specific: ${stats.averageScores.specific.toFixed(2)}
  - Actionable: ${stats.averageScores.actionable.toFixed(2)}
  - Valuable: ${stats.averageScores.valuable.toFixed(2)}
- Implementation rate: ${(stats.implementationRate * 100).toFixed(1)}%

## Quality Insights
- Low quality recommendations (<50% score): ${lowQuality.length}
- High value implemented recommendations (>80% valuable): ${highValue.length}

## Recommendations
- Focus on improving: ${lowQuality.length > 0 ? lowQuality.join(', ') : 'None identified'}
- Replicate success patterns: ${highValue.length > 0 ? highValue.join(', ') : 'Insufficient data'}

## Next Steps
1. Address low-quality recommendation patterns
2. Analyze high-value recommendations for common characteristics
3. Use feedback to tune confidence thresholds and validation criteria
    `.trim();
  }
}
