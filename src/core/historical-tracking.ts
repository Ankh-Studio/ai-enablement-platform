/**
 * Historical Tracking - How Perspectives Evolve Over Time
 *
 * Tracks changes in persona perspectives, confidence levels, and recommendations
 * across multiple analyses to show evolution and learning patterns.
 */

import type { PersonaContext } from '../types/persona';
import { type MultiPerspectiveResult } from './multi-perspective-engine';

export interface HistoricalAnalysis {
  id: string;
  repository: string;
  timestamp: Date;
  context: PersonaContext;
  result: MultiPerspectiveResult;
  metadata: AnalysisMetadata;
}

export interface AnalysisMetadata {
  version: string;
  analysisDuration: number;
  personaCount: number;
  totalInsights: number;
  conflictCount: number;
  consensusCount: number;
  confidenceAverage: number;
}

export interface PerspectiveEvolution {
  persona: string;
  evolutionPoints: EvolutionPoint[];
  analyses: EvolutionPoint[];
  trends: PerspectiveTrend[];
  confidenceEvolution: ConfidencePoint[];
  insightEvolution: InsightEvolutionPoint[];
}

export interface EvolutionPoint {
  timestamp: Date;
  repository: string;
  perspective: string;
  confidence: string;
  timeframe: string;
  insightCount: number;
  priorityShifts: PriorityShift[];
}

export interface PriorityShift {
  from: string;
  to: string;
  category: string;
  reason: string;
  timestamp: Date;
}

export interface PerspectiveTrend {
  type: 'confidence' | 'focus' | 'timeframe' | 'insight-type' | 'insight-count';
  direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  strength: number; // 0-1, how strong the trend is
  description: string;
  evidence: string[];
}

export interface ConfidencePoint {
  timestamp: Date;
  confidence: string;
  score: number; // 0-100 numeric representation
  context: string;
  factors: ConfidenceFactor[];
}

export interface ConfidenceFactor {
  factor: string;
  impact: number; // -1 to 1, negative or positive impact
  description: string;
}

export interface InsightEvolutionPoint {
  timestamp: Date;
  insightType: string;
  count: number;
  averageConfidence: number;
  newThemes: string[];
  recurringThemes: string[];
  deprecatedThemes: string[];
}

export interface LearningPattern {
  persona: string;
  pattern: string;
  description: string;
  frequency: number;
  impact: 'positive' | 'negative' | 'neutral';
  examples: string[];
}

export class HistoricalTracking {
  private analyses: Map<string, HistoricalAnalysis> = new Map();
  private perspectiveEvolutions: Map<string, PerspectiveEvolution> = new Map();

  /**
   * Record a new analysis for historical tracking
   */
  recordAnalysis(
    repository: string,
    context: PersonaContext,
    result: MultiPerspectiveResult,
    analysisDuration: number = 0,
  ): HistoricalAnalysis {
    const analysisId = this.generateAnalysisId();
    const timestamp = new Date();

    const metadata: AnalysisMetadata = {
      version: '1.0.0',
      analysisDuration,
      personaCount: result.personaAnalyses.length,
      totalInsights: result.personaAnalyses.reduce(
        (sum, a) => sum + a.insights.length,
        0,
      ),
      conflictCount: result.conflictAreas.length,
      consensusCount: result.consensusAreas.length,
      confidenceAverage: this.calculateAverageConfidence(result),
    };

    const analysis: HistoricalAnalysis = {
      id: analysisId,
      repository,
      timestamp,
      context,
      result,
      metadata,
    };

    this.analyses.set(analysisId, analysis);
    this.updatePerspectiveEvolutions(analysis);

    return analysis;
  }

  /**
   * Get perspective evolution for a specific persona
   */
  getPerspectiveEvolution(persona: string): PerspectiveEvolution | undefined {
    return this.perspectiveEvolutions.get(persona);
  }

  /**
   * Get all analyses for a repository
   */
  getRepositoryAnalyses(repository: string): HistoricalAnalysis[] {
    return Array.from(this.analyses.values()).filter(
      (a) => a.repository === repository,
    );
  }

  /**
   * Get learning patterns for all personas
   */
  getLearningPatterns(): LearningPattern[] {
    const patterns: LearningPattern[] = [];

    for (const [persona, evolution] of this.perspectiveEvolutions.entries()) {
      const personaPatterns = this.extractLearningPatterns(persona, evolution);
      patterns.push(...personaPatterns);
    }

    return patterns.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Compare perspectives across time periods
   */
  compareTimePeriods(
    persona: string,
    period1Start: Date,
    period1End: Date,
    period2Start: Date,
    period2End: Date,
  ): TimePeriodComparison {
    const evolution = this.perspectiveEvolutions.get(persona);
    if (!evolution) {
      throw new Error(`No evolution data found for persona: ${persona}`);
    }

    const period1Points = evolution.evolutionPoints.filter(
      (p) => p.timestamp >= period1Start && p.timestamp <= period1End,
    );
    const period2Points = evolution.evolutionPoints.filter(
      (p) => p.timestamp >= period2Start && p.timestamp <= period2End,
    );

    return this.generateTimePeriodComparison(
      persona,
      period1Points,
      period2Points,
    );
  }

  /**
   * Generate evolution report
   */
  generateEvolutionReport(persona?: string): EvolutionReport {
    if (persona) {
      const evolution = this.perspectiveEvolutions.get(persona);
      if (!evolution) {
        throw new Error(`No evolution data found for persona: ${persona}`);
      }
      return this.generatePersonaEvolutionReport(persona, evolution);
    }

    return this.generateComprehensiveEvolutionReport();
  }

  private updatePerspectiveEvolutions(analysis: HistoricalAnalysis): void {
    for (const personaAnalysis of analysis.result.personaAnalyses) {
      const persona = personaAnalysis.persona;

      let evolution = this.perspectiveEvolutions.get(persona);
      if (!evolution) {
        evolution = {
          persona,
          analyses: [],
          trends: [],
          confidenceEvolution: [],
          insightEvolution: [],
          evolutionPoints: [],
        };
        this.perspectiveEvolutions.set(persona, evolution);
      }

      // Add evolution point
      const evolutionPoint: EvolutionPoint = {
        timestamp: analysis.timestamp,
        repository: analysis.repository,
        perspective: personaAnalysis.perspective,
        confidence: personaAnalysis.confidence,
        timeframe: personaAnalysis.timeframe,
        insightCount: personaAnalysis.insights.length,
        priorityShifts: [], // Will be calculated after adding to array
      };

      evolution.evolutionPoints.push(evolutionPoint);

      // Now calculate priority shifts after the point is added
      if (evolution && evolution.evolutionPoints.length > 0) {
        evolution.evolutionPoints[
          evolution.evolutionPoints.length - 1
        ].priorityShifts = this.detectPriorityShifts(
          evolution,
          personaAnalysis,
        );
      }

      // Update confidence evolution
      const confidenceScore = this.confidenceToNumber(
        personaAnalysis.confidence,
      );
      evolution.confidenceEvolution.push({
        timestamp: analysis.timestamp,
        confidence: personaAnalysis.confidence,
        score: confidenceScore,
        context: `${analysis.repository} analysis`,
        factors: this.analyzeConfidenceFactors(personaAnalysis, analysis),
      });

      // Update insight evolution
      evolution.insightEvolution.push({
        timestamp: analysis.timestamp,
        insightType: this.getDominantInsightType(personaAnalysis),
        count: personaAnalysis.insights.length,
        averageConfidence:
          this.calculateAverageInsightConfidence(personaAnalysis),
        newThemes: this.identifyNewThemes(personaAnalysis, evolution),
        recurringThemes: this.identifyRecurringThemes(
          personaAnalysis,
          evolution,
        ),
        deprecatedThemes: this.identifyDeprecatedThemes(
          personaAnalysis,
          evolution,
        ),
      });

      // Update trends
      evolution.trends = this.calculateTrends(evolution);
    }
  }

  private detectPriorityShifts(
    evolution: PerspectiveEvolution,
    currentAnalysis: any,
  ): PriorityShift[] {
    const shifts: PriorityShift[] = [];

    if (evolution.evolutionPoints.length === 0) {
      return shifts;
    }

    const lastPoint =
      evolution.evolutionPoints[evolution.evolutionPoints.length - 1];

    // Simple priority shift detection based on insight count and timeframe
    if (currentAnalysis.insights.length > lastPoint.insightCount * 1.5) {
      shifts.push({
        from: 'moderate',
        to: 'high',
        category: 'engagement',
        reason: 'Increased insight generation',
        timestamp: new Date(),
      });
    } else if (currentAnalysis.insights.length < lastPoint.insightCount * 0.7) {
      shifts.push({
        from: 'high',
        to: 'moderate',
        category: 'engagement',
        reason: 'Decreased insight generation',
        timestamp: new Date(),
      });
    }

    return shifts;
  }

  private confidenceToNumber(confidence: string): number {
    switch (confidence) {
      case 'high':
        return 85;
      case 'medium':
        return 65;
      case 'low':
        return 35;
      default:
        return 50;
    }
  }

  private analyzeConfidenceFactors(
    personaAnalysis: any,
    analysis: HistoricalAnalysis,
  ): ConfidenceFactor[] {
    const factors: ConfidenceFactor[] = [];

    // Analyze factors based on repository context
    if (analysis.context.scores.repoReadiness > 80) {
      factors.push({
        factor: 'High AI Adoption',
        impact: 0.3,
        description: 'High AI adoption levels increase confidence',
      });
    }

    if (analysis.context.scores.teamReadiness > 70) {
      factors.push({
        factor: 'Team Readiness',
        impact: 0.2,
        description: 'Good team readiness supports confidence',
      });
    }

    if (personaAnalysis.insights.length > 3) {
      factors.push({
        factor: 'Insight Volume',
        impact: 0.1,
        description: 'Multiple insights indicate thorough analysis',
      });
    }

    return factors;
  }

  private getDominantInsightType(personaAnalysis: any): string {
    const typeCounts = personaAnalysis.insights.reduce(
      (acc: any, insight: any) => {
        acc[insight.type] = (acc[insight.type] || 0) + 1;
        return acc;
      },
      {},
    );

    return Object.keys(typeCounts).reduce((a, b) =>
      typeCounts[a] > typeCounts[b] ? a : b,
    );
  }

  private calculateAverageInsightConfidence(personaAnalysis: any): number {
    const total = personaAnalysis.insights.reduce(
      (sum: number, insight: any) => sum + insight.confidence,
      0,
    );
    return total / personaAnalysis.insights.length;
  }

  private identifyNewThemes(
    personaAnalysis: any,
    evolution: PerspectiveEvolution,
  ): string[] {
    // Simple theme detection based on insight titles
    const currentThemes = personaAnalysis.insights.map(
      (i: any) => i.title.split(' ')[0],
    );
    const historicalThemes = evolution.insightEvolution.flatMap(
      (e) => e.recurringThemes,
    );

    return currentThemes.filter(
      (theme: string) => !historicalThemes.includes(theme),
    );
  }

  private identifyRecurringThemes(
    personaAnalysis: any,
    evolution: PerspectiveEvolution,
  ): string[] {
    const currentThemes = personaAnalysis.insights.map(
      (i: any) => i.title.split(' ')[0],
    );
    const historicalThemes = evolution.insightEvolution.flatMap(
      (e) => e.recurringThemes,
    );

    return currentThemes.filter((theme: string) =>
      historicalThemes.includes(theme),
    );
  }

  private identifyDeprecatedThemes(
    personaAnalysis: any,
    evolution: PerspectiveEvolution,
  ): string[] {
    const historicalThemes = evolution.insightEvolution.flatMap(
      (e) => e.recurringThemes,
    );
    const currentThemes = personaAnalysis.insights.map(
      (i: any) => i.title.split(' ')[0],
    );

    return historicalThemes.filter((theme) => !currentThemes.includes(theme));
  }

  private calculateTrends(evolution: PerspectiveEvolution): PerspectiveTrend[] {
    const trends: PerspectiveTrend[] = [];

    if (evolution.confidenceEvolution.length < 2) {
      return trends;
    }

    // Confidence trend
    const confidenceTrend = this.calculateTrend(
      evolution.confidenceEvolution.map((p) => p.score),
      'confidence',
    );
    trends.push(confidenceTrend);

    // Insight count trend
    const insightCountTrend = this.calculateTrend(
      evolution.evolutionPoints.map((p) => p.insightCount),
      'insight-count',
    );
    trends.push(insightCountTrend);

    return trends;
  }

  private calculateTrend(values: number[], type: string): PerspectiveTrend {
    if (values.length < 2) {
      return {
        type: type as any,
        direction: 'stable',
        strength: 0,
        description: 'Insufficient data for trend analysis',
        evidence: [],
      };
    }

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg =
      firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;
    const strength = Math.abs(difference) / 100; // Normalize to 0-1

    let direction: PerspectiveTrend['direction'];
    if (Math.abs(difference) < 5) {
      direction = 'stable';
    } else if (difference > 0) {
      direction = 'increasing';
    } else {
      direction = 'decreasing';
    }

    return {
      type: type as any,
      direction,
      strength,
      description: this.generateTrendDescription(type, direction, strength),
      evidence: [
        `First half average: ${firstAvg.toFixed(1)}`,
        `Second half average: ${secondAvg.toFixed(1)}`,
      ],
    };
  }

  private generateTrendDescription(
    type: string,
    direction: string,
    strength: number,
  ): string {
    const strengthDesc =
      strength > 0.7 ? 'strong' : strength > 0.3 ? 'moderate' : 'weak';

    const descriptions: { [key: string]: { [key: string]: string } } = {
      confidence: {
        increasing: `Showing ${strengthDesc} increasing confidence in analysis over time`,
        decreasing: `Showing ${strengthDesc} decreasing confidence, possibly due to emerging complexities`,
        stable: `Confidence levels remain stable, indicating consistent perspective`,
      },
      'insight-count': {
        increasing: `Generating ${strengthDesc} more insights over time, indicating deeper analysis`,
        decreasing: `Generating ${strengthDesc} fewer insights, possibly indicating focus refinement`,
        stable: `Insight generation remains consistent, showing steady analysis patterns`,
      },
    };

    return descriptions[type]?.[direction] || `Trend analysis for ${type}`;
  }

  private extractLearningPatterns(
    persona: string,
    evolution: PerspectiveEvolution,
  ): LearningPattern[] {
    const patterns: LearningPattern[] = [];

    // Pattern: Confidence growth with experience
    if (evolution.confidenceEvolution.length > 1) {
      const confidenceGrowth =
        evolution.confidenceEvolution[evolution.confidenceEvolution.length - 1]
          .score - evolution.confidenceEvolution[0].score;

      if (confidenceGrowth > 10) {
        patterns.push({
          persona,
          pattern: 'Confidence Growth',
          description: 'Shows increasing confidence in analysis over time',
          frequency: evolution.confidenceEvolution.length,
          impact: 'positive',
          examples: evolution.confidenceEvolution
            .slice(-3)
            .map(
              (p) =>
                `Confidence ${p.confidence} at ${p.timestamp.toLocaleDateString()}`,
            ),
        });
      }
    }

    // Pattern: Priority shifts based on context
    const priorityShifts = evolution.evolutionPoints.flatMap(
      (p) => p.priorityShifts,
    );
    if (priorityShifts.length > 2) {
      patterns.push({
        persona,
        pattern: 'Adaptive Priorities',
        description:
          'Adjusts priorities based on changing context and experience',
        frequency: priorityShifts.length,
        impact: 'positive',
        examples: priorityShifts
          .slice(-3)
          .map((s) => `Shift from ${s.from} to ${s.to} priority`),
      });
    }

    return patterns;
  }

  private calculateAverageConfidence(result: MultiPerspectiveResult): number {
    const confidenceScores = result.personaAnalyses.map((a) => {
      switch (a.confidence) {
        case 'high':
          return 85;
        case 'medium':
          return 65;
        case 'low':
          return 35;
        default:
          return 50;
      }
    });

    return (
      confidenceScores.reduce((sum, score) => sum + score, 0) /
      confidenceScores.length
    );
  }

  private generateTimePeriodComparison(
    persona: string,
    period1Points: EvolutionPoint[],
    period2Points: EvolutionPoint[],
  ): TimePeriodComparison {
    const period1AvgConfidence =
      period1Points.length > 0
        ? period1Points.reduce(
            (sum, p) => sum + this.confidenceToNumber(p.confidence),
            0,
          ) / period1Points.length
        : 0;

    const period2AvgConfidence =
      period2Points.length > 0
        ? period2Points.reduce(
            (sum, p) => sum + this.confidenceToNumber(p.confidence),
            0,
          ) / period2Points.length
        : 0;

    return {
      persona,
      period1: {
        start: period1Points[0]?.timestamp || new Date(),
        end: period1Points[period1Points.length - 1]?.timestamp || new Date(),
        averageConfidence: period1AvgConfidence,
        insightCount: period1Points.reduce((sum, p) => sum + p.insightCount, 0),
        analysisCount: period1Points.length,
      },
      period2: {
        start: period2Points[0]?.timestamp || new Date(),
        end: period2Points[period2Points.length - 1]?.timestamp || new Date(),
        averageConfidence: period2AvgConfidence,
        insightCount: period2Points.reduce((sum, p) => sum + p.insightCount, 0),
        analysisCount: period2Points.length,
      },
      changes: {
        confidenceChange: period2AvgConfidence - period1AvgConfidence,
        insightCountChange:
          period2Points.reduce((sum, p) => sum + p.insightCount, 0) -
          period1Points.reduce((sum, p) => sum + p.insightCount, 0),
        analysisFrequencyChange: period2Points.length - period1Points.length,
      },
    };
  }

  private generatePersonaEvolutionReport(
    persona: string,
    evolution: PerspectiveEvolution,
  ): EvolutionReport {
    return {
      persona,
      summary: this.generatePersonaSummary(evolution),
      trends: evolution.trends,
      learningPatterns: this.extractLearningPatterns(persona, evolution),
      confidenceEvolution: evolution.confidenceEvolution,
      insightEvolution: evolution.insightEvolution,
      recommendations: this.generatePersonaRecommendations(evolution),
    };
  }

  private generateComprehensiveEvolutionReport(): EvolutionReport {
    const allPersonas = Array.from(this.perspectiveEvolutions.keys());
    const allTrends = Array.from(this.perspectiveEvolutions.values()).flatMap(
      (e) => e.trends,
    );
    const allPatterns = this.getLearningPatterns();

    return {
      summary: this.generateComprehensiveSummary(allPersonas),
      trends: allTrends,
      learningPatterns: allPatterns,
      confidenceEvolution: [],
      insightEvolution: [],
      recommendations: this.generateComprehensiveRecommendations(allPersonas),
    };
  }

  private generatePersonaSummary(evolution: PerspectiveEvolution): string {
    const analysisCount = evolution.evolutionPoints.length;
    const confidenceTrend = evolution.trends.find(
      (t) => t.type === 'confidence',
    );
    const insightTrend = evolution.trends.find(
      (t) => t.type === 'insight-count',
    );

    return `${evolution.persona} has participated in ${analysisCount} analyses showing ${confidenceTrend?.direction || 'stable'} confidence trends and ${insightTrend?.direction || 'stable'} insight generation patterns.`;
  }

  private generateComprehensiveSummary(personas: string[]): string {
    return `Comprehensive analysis across ${personas.length} personas showing evolution patterns, learning behaviors, and trend analysis over time.`;
  }

  private generatePersonaRecommendations(
    evolution: PerspectiveEvolution,
  ): string[] {
    const recommendations: string[] = [];

    const confidenceTrend = evolution.trends.find(
      (t) => t.type === 'confidence',
    );
    if (confidenceTrend?.direction === 'decreasing') {
      recommendations.push(
        'Consider providing additional context or support to address declining confidence',
      );
    }

    const insightTrend = evolution.trends.find(
      (t) => t.type === 'insight-count',
    );
    if (insightTrend?.direction === 'decreasing') {
      recommendations.push(
        'Explore whether focus refinement or analysis fatigue is occurring',
      );
    }

    return recommendations;
  }

  private generateComprehensiveRecommendations(personas: string[]): string[] {
    return [
      'Continue tracking evolution patterns to identify learning opportunities',
      'Use trend analysis to predict future perspective changes',
      'Consider cross-persona learning pattern sharing',
    ];
  }

  private generateAnalysisId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export interface TimePeriodComparison {
  persona: string;
  period1: TimePeriod;
  period2: TimePeriod;
  changes: {
    confidenceChange: number;
    insightCountChange: number;
    analysisFrequencyChange: number;
  };
}

export interface TimePeriod {
  start: Date;
  end: Date;
  averageConfidence: number;
  insightCount: number;
  analysisCount: number;
}

export interface EvolutionReport {
  persona?: string;
  summary: string;
  trends: PerspectiveTrend[];
  learningPatterns: LearningPattern[];
  confidenceEvolution: ConfidencePoint[];
  insightEvolution: InsightEvolutionPoint[];
  recommendations: string[];
}
