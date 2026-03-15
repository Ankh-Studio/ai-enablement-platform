/**
 * Score Analyzer Utility
 * 
 * Analyzes and validates score progression and consistency
 */

export class ScoreAnalyzer {

  validateScoreProgression(testResults: any): ScoreProgressionResult {
    const result: ScoreProgressionResult = {
      isValid: true,
      worstToBestDifference: 0,
      middleInRange: false,
      details: [],
      errors: []
    };

    try {
      const worstScores = testResults.worst?.scores;
      const middleScores = testResults.middle?.scores;
      const bestScores = testResults.best?.scores;

      if (!worstScores || !bestScores) {
        result.isValid = false;
        result.errors.push('Missing worst or best case scores for progression validation');
        return result;
      }

      // Check that best > worst
      const worstOverall = worstScores.overallMaturity;
      const bestOverall = bestScores.overallMaturity;
      
      if (bestOverall <= worstOverall) {
        result.isValid = false;
        result.errors.push('Best case should score higher than worst case');
      }

      result.worstToBestDifference = bestOverall - worstOverall;

      // Check that middle is between worst and best (if available)
      if (middleScores) {
        const middleOverall = middleScores.overallMaturity;
        result.middleInRange = middleOverall > worstOverall && middleOverall < bestOverall;
        
        if (!result.middleInRange) {
          result.isValid = false;
          result.errors.push('Middle case should score between worst and best cases');
        }
      }

      // Check individual score categories
      const categories = ['repoReadiness', 'teamReadiness', 'orgReadiness'];
      categories.forEach(category => {
        const worst = worstScores[category as keyof typeof worstScores];
        const best = bestScores[category as keyof typeof bestScores];
        
        if (best <= worst) {
          result.isValid = false;
          result.errors.push(`Best case ${category} should be higher than worst case`);
        }
      });

      result.details.push(`Overall progression: Worst(${worstOverall}) -> Best(${bestOverall})`);
      result.details.push(`Difference: ${result.worstToBestDifference} points`);

    } catch (error) {
      result.isValid = false;
      result.errors.push(`Error validating score progression: ${error}`);
    }

    return result;
  }

  validateScoreConsistency(scores: any[]): ConsistencyResult {
    const result: ConsistencyResult = {
      isConsistent: true,
      maxVariance: 0,
      variances: {},
      details: [],
      errors: []
    };

    try {
      if (scores.length < 2) {
        result.isConsistent = false;
        result.errors.push('Need at least 2 score sets to validate consistency');
        return result;
      }

      const categories = ['repoReadiness', 'teamReadiness', 'orgReadiness', 'overallMaturity'];
      
      categories.forEach(category => {
        const values = scores.map(s => s[category as keyof typeof s]);
        const variance = this.calculateVariance(values);
        
        result.variances[category] = variance;
        
        // Allow some variance but not too much
        if (variance > 10) {
          result.isConsistent = false;
          result.errors.push(`High variance in ${category}: ${variance.toFixed(2)}`);
        }
      });

      result.maxVariance = Math.max(...Object.values(result.variances));
      result.details.push(`Max variance across categories: ${result.maxVariance.toFixed(2)}`);

    } catch (error) {
      result.isConsistent = false;
      result.errors.push(`Error validating score consistency: ${error}`);
    }

    return result;
  }

  analyzeScorePatterns(testResults: any): PatternAnalysisResult {
    const result: PatternAnalysisResult = {
      hasLogicalPatterns: true,
      patterns: [],
      anomalies: [],
      details: [],
      errors: []
    };

    try {
      const scores = {
        worst: testResults.worst?.scores,
        middle: testResults.middle?.scores,
        best: testResults.best?.scores
      };

      // Analyze patterns across repository types
      Object.entries(scores).forEach(([repoType, scoreSet]) => {
        if (!scoreSet) return;

        const patterns = this.identifyScorePatterns(scoreSet);
        result.patterns.push({ repoType, patterns });

        const anomalies = this.identifyAnomalies(scoreSet);
        result.anomalies.push({ repoType, anomalies });
      });

      // Check for logical patterns
      const allAnomalies = result.anomalies.flatMap(a => a.anomalies);
      if (allAnomalies.length > 0) {
        result.hasLogicalPatterns = false;
        result.errors.push(`Found ${allAnomalies.length} score anomalies`);
      }

      result.details.push(`Analyzed patterns for ${Object.keys(scores).length} repository types`);

    } catch (error) {
      result.hasLogicalPatterns = false;
      result.errors.push(`Error analyzing score patterns: ${error}`);
    }

    return result;
  }

  compareWithBenchmarks(testResults: any, benchmarks: any): BenchmarkComparisonResult {
    const result: BenchmarkComparisonResult = {
      meetsBenchmarks: true,
      comparisons: [],
      deviations: [],
      details: [],
      errors: []
    };

    try {
      const repoTypes = ['worst', 'middle', 'best'];
      
      repoTypes.forEach(repoType => {
        const scores = testResults[repoType]?.scores;
        const benchmark = benchmarks[repoType];

        if (!scores || !benchmark) return;

        const comparison = this.compareScores(scores, benchmark);
        result.comparisons.push({ repoType, comparison });

        if (comparison.deviation > 20) { // Allow 20% deviation
          result.meetsBenchmarks = false;
          result.deviations.push({
            repoType,
            expected: benchmark,
            actual: scores,
            deviation: comparison.deviation
          });
        }
      });

      result.details.push(`Compared ${result.comparisons.length} repository types against benchmarks`);

    } catch (error) {
      result.meetsBenchmarks = false;
      result.errors.push(`Error comparing with benchmarks: ${error}`);
    }

    return result;
  }

  validateScoreDistribution(testResults: any): DistributionResult {
    const result: DistributionResult = {
      isWellDistributed: true,
      distribution: {},
      gaps: [],
      overlaps: [],
      details: [],
      errors: []
    };

    try {
      const scores = {
        worst: testResults.worst?.scores,
        middle: testResults.middle?.scores,
        best: testResults.best?.scores
      };

      const categories = ['repoReadiness', 'teamReadiness', 'orgReadiness', 'overallMaturity'];
      
      categories.forEach(category => {
        const values = Object.values(scores)
          .filter(Boolean)
          .map(s => s[category as keyof typeof s])
          .sort((a, b) => a - b);

        result.distribution[category] = values;

        // Check for gaps
        const gaps = this.findGaps(values);
        if (gaps.length > 0) {
          result.gaps.push({ category, gaps });
        }

        // Check for overlaps (shouldn't be many)
        const overlaps = this.findOverlaps(values);
        if (overlaps.length > 0) {
          result.overlaps.push({ category, overlaps });
        }
      });

      // Evaluate overall distribution
      const totalGaps = result.gaps.reduce((sum, g) => sum + g.gaps.length, 0);
      const totalOverlaps = result.overlaps.reduce((sum, o) => sum + o.overlaps.length, 0);

      if (totalGaps > categories.length || totalOverlaps > categories.length * 2) {
        result.isWellDistributed = false;
        result.errors.push('Score distribution has too many gaps or overlaps');
      }

      result.details.push(`Found ${totalGaps} gaps and ${totalOverlaps} overlaps across ${categories.length} categories`);

    } catch (error) {
      result.isWellDistributed = false;
      result.errors.push(`Error validating score distribution: ${error}`);
    }

    return result;
  }

  // Helper methods
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    
    return Math.sqrt(avgSquaredDiff);
  }

  private identifyScorePatterns(scores: any): string[] {
    const patterns: string[] = [];
    
    // Pattern 1: All scores within reasonable range
    const allScores = [
      scores.repoReadiness,
      scores.teamReadiness,
      scores.orgReadiness,
      scores.overallMaturity
    ];
    
    if (allScores.every(score => score >= 0 && score <= 100)) {
      patterns.push('all_scores_in_range');
    }

    // Pattern 2: Overall maturity is average of other scores
    const avgOtherScores = (scores.repoReadiness + scores.teamReadiness + scores.orgReadiness) / 3;
    if (Math.abs(scores.overallMaturity - avgOtherScores) < 5) {
      patterns.push('overall_is_average');
    }

    // Pattern 3: Consistent scoring across categories
    const variance = this.calculateVariance([scores.repoReadiness, scores.teamReadiness, scores.orgReadiness]);
    if (variance < 15) {
      patterns.push('consistent_scoring');
    }

    return patterns;
  }

  private identifyAnomalies(scores: any): string[] {
    const anomalies: string[] = [];
    
    // Anomaly 1: Extreme differences between categories
    const categoryScores = [scores.repoReadiness, scores.teamReadiness, scores.orgReadiness];
    const maxScore = Math.max(...categoryScores);
    const minScore = Math.min(...categoryScores);
    
    if (maxScore - minScore > 50) {
      anomalies.push('extreme_category_variance');
    }

    // Anomaly 2: Overall maturity doesn't align with categories
    const avgCategory = categoryScores.reduce((sum, score) => sum + score, 0) / 3;
    if (Math.abs(scores.overallMaturity - avgCategory) > 20) {
      anomalies.push('overall_misalignment');
    }

    // Anomaly 3: Perfect scores (unlikely in real scenarios)
    if (categoryScores.some(score => score === 100)) {
      anomalies.push('perfect_score');
    }

    return anomalies;
  }

  private compareScores(actual: any, expected: any): ScoreComparison {
    const categories = ['repoReadiness', 'teamReadiness', 'orgReadiness', 'overallMaturity'];
    const deviations: number[] = [];
    
    categories.forEach(category => {
      const actualVal = actual[category as keyof typeof actual];
      const expectedVal = expected[category as keyof typeof expected];
      
      if (expectedVal > 0) {
        const deviation = Math.abs((actualVal - expectedVal) / expectedVal) * 100;
        deviations.push(deviation);
      }
    });

    const avgDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / deviations.length;
    
    return {
      averageDeviation: avgDeviation,
      deviation: avgDeviation,
      categoryDeviations: deviations
    };
  }

  private findGaps(values: number[]): Gap[] {
    const gaps: Gap[] = [];
    
    for (let i = 1; i < values.length; i++) {
      const diff = values[i] - values[i - 1];
      if (diff > 15) { // Consider gaps larger than 15 points
        gaps.push({
          from: values[i - 1],
          to: values[i],
          size: diff
        });
      }
    }
    
    return gaps;
  }

  private findOverlaps(values: number[]): Overlap[] {
    const overlaps: Overlap[] = [];
    
    // Group similar values (within 5 points)
    const groups: number[][] = [];
    let currentGroup: number[] = [values[0]];
    
    for (let i = 1; i < values.length; i++) {
      if (values[i] - currentGroup[0] <= 5) {
        currentGroup.push(values[i]);
      } else {
        groups.push(currentGroup);
        currentGroup = [values[i]];
      }
    }
    groups.push(currentGroup);
    
    // Find groups with multiple values (overlaps)
    groups.forEach(group => {
      if (group.length > 1) {
        overlaps.push({
          values: group,
          range: Math.max(...group) - Math.min(...group)
        });
      }
    });
    
    return overlaps;
  }
}

// Result interfaces
interface ScoreProgressionResult {
  isValid: boolean;
  worstToBestDifference: number;
  middleInRange: boolean;
  details: string[];
  errors: string[];
}

interface ConsistencyResult {
  isConsistent: boolean;
  maxVariance: number;
  variances: Record<string, number>;
  details: string[];
  errors: string[];
}

interface PatternAnalysisResult {
  hasLogicalPatterns: boolean;
  patterns: Array<{ repoType: string; patterns: string[] }>;
  anomalies: Array<{ repoType: string; anomalies: string[] }>;
  details: string[];
  errors: string[];
}

interface BenchmarkComparisonResult {
  meetsBenchmarks: boolean;
  comparisons: Array<{ repoType: string; comparison: ScoreComparison }>;
  deviations: Array<{
    repoType: string;
    expected: any;
    actual: any;
    deviation: number;
  }>;
  details: string[];
  errors: string[];
}

interface DistributionResult {
  isWellDistributed: boolean;
  distribution: Record<string, number[]>;
  gaps: Array<{ category: string; gaps: Gap[] }>;
  overlaps: Array<{ category: string; overlaps: Overlap[] }>;
  details: string[];
  errors: string[];
}

interface ScoreComparison {
  averageDeviation: number;
  deviation: number;
  categoryDeviations: number[];
}

interface Gap {
  from: number;
  to: number;
  size: number;
}

interface Overlap {
  values: number[];
  range: number;
}
