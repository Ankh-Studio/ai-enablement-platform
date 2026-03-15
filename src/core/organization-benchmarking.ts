/**
 * Organization Benchmarking - Compare Across Teams/Companies
 *
 * Enables comparison of AI adoption patterns, persona perspectives, and
 * organizational maturity across different teams and companies.
 */

import type { PersonaContext } from '../types/persona';
import { HistoricalTracking } from './historical-tracking';
import {
  MultiPerspectiveEngine,
  type MultiPerspectiveResult,
} from './multi-perspective-engine';

export interface OrganizationProfile {
  id: string;
  name: string;
  industry: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  maturity: 'emerging' | 'developing' | 'mature' | 'advanced';
  location: string;
  createdAt: Date;
  lastUpdated: Date;
  analyses: OrganizationAnalysis[];
  benchmarks: BenchmarkData;
}

export interface OrganizationAnalysis {
  id: string;
  repository: string;
  timestamp: Date;
  context: PersonaContext;
  result: MultiPerspectiveResult;
  teamProfile: TeamProfile;
}

export interface TeamProfile {
  name: string;
  size: number;
  composition: TeamComposition;
  experience: TeamExperience;
  culture: TeamCulture;
}

export interface TeamComposition {
  technical: number;
  product: number;
  design: number;
  management: number;
  other: number;
}

export interface TeamExperience {
  averageYears: number;
  seniorityDistribution: {
    junior: number;
    mid: number;
    senior: number;
    lead: number;
  };
  aiExperience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface TeamCulture {
  collaboration: 'low' | 'medium' | 'high';
  innovation: 'conservative' | 'moderate' | 'aggressive';
  riskTolerance: 'low' | 'medium' | 'high';
  communication: 'formal' | 'mixed' | 'informal';
}

export interface BenchmarkData {
  industryBenchmarks: IndustryBenchmark[];
  sizeBenchmarks: SizeBenchmark[];
  maturityBenchmarks: MaturityBenchmark[];
  historicalTrends: HistoricalTrend[];
}

export interface IndustryBenchmark {
  industry: string;
  averageAIAdoption: number;
  averageTeamReadiness: number;
  averageConflicts: number;
  commonInsights: string[];
  recommendedActions: string[];
  topPerformers: OrganizationReference[];
}

export interface SizeBenchmark {
  size: string;
  typicalPatterns: SizePattern[];
  challenges: string[];
  successFactors: string[];
  timeToAdoption: string;
}

export interface SizePattern {
  persona: string;
  typicalConfidence: string;
  typicalInsightCount: number;
  commonConcerns: string[];
  typicalTimeframe: string;
}

export interface MaturityBenchmark {
  maturity: string;
  characteristics: string[];
  nextSteps: string[];
  riskFactors: string[];
  bestPractices: string[];
}

export interface HistoricalTrend {
  metric: string;
  trend: 'improving' | 'stable' | 'declining';
  rate: number; // change per month
  prediction: number; // predicted value in 6 months
  confidence: number; // 0-100
}

export interface OrganizationReference {
  id: string;
  name: string;
  score: number;
  characteristics: string[];
}

export interface ComparisonResult {
  organization: OrganizationProfile;
  comparisons: Comparison[];
  insights: ComparisonInsight[];
  recommendations: BenchmarkRecommendation[];
  ranking: OrganizationRanking;
}

export interface Comparison {
  type: 'industry' | 'size' | 'maturity' | 'historical';
  target: string;
  score: number;
  percentile: number;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
}

export interface ComparisonInsight {
  category: string;
  insight: string;
  evidence: string[];
  impact: 'high' | 'medium' | 'low';
  actionability: 'immediate' | 'short-term' | 'long-term';
}

export interface BenchmarkRecommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'process' | 'technical' | 'cultural' | 'strategic';
  effort: 'low' | 'medium' | 'high';
  timeframe: string;
  expectedImpact: string;
  supportingData: string[];
}

export interface OrganizationRanking {
  overall: number;
  byCategory: { [category: string]: number };
  totalOrganizations: number;
  topQuartile: boolean;
}

export class OrganizationBenchmarking {
  private organizations: Map<string, OrganizationProfile> = new Map();
  private historicalTracking: HistoricalTracking;
  private multiPerspectiveEngine: MultiPerspectiveEngine;

  constructor() {
    this.historicalTracking = new HistoricalTracking();
    this.multiPerspectiveEngine = new MultiPerspectiveEngine();
    this.initializeBenchmarks();
  }

  /**
   * Register a new organization for benchmarking
   */
  registerOrganization(
    organization: Omit<
      OrganizationProfile,
      'id' | 'createdAt' | 'lastUpdated' | 'analyses' | 'benchmarks'
    >,
  ): OrganizationProfile {
    const orgProfile: OrganizationProfile = {
      ...organization,
      id: this.generateOrganizationId(),
      createdAt: new Date(),
      lastUpdated: new Date(),
      analyses: [],
      benchmarks: this.generateBenchmarksForOrganization(organization),
    };

    this.organizations.set(orgProfile.id, orgProfile);
    return orgProfile;
  }

  /**
   * Add analysis to organization profile
   */
  addAnalysis(
    organizationId: string,
    repository: string,
    context: PersonaContext,
    result: MultiPerspectiveResult,
    teamProfile: TeamProfile,
  ): OrganizationAnalysis {
    const organization = this.organizations.get(organizationId);
    if (!organization) {
      throw new Error(`Organization ${organizationId} not found`);
    }

    const analysis: OrganizationAnalysis = {
      id: this.generateAnalysisId(),
      repository,
      timestamp: new Date(),
      context,
      result,
      teamProfile,
    };

    organization.analyses.push(analysis);
    organization.lastUpdated = new Date();

    // Record in historical tracking
    this.historicalTracking.recordAnalysis(repository, context, result);

    // Update benchmarks
    this.updateOrganizationBenchmarks(organization);

    return analysis;
  }

  /**
   * Compare organization against benchmarks
   */
  compareOrganization(organizationId: string): ComparisonResult {
    const organization = this.organizations.get(organizationId);
    if (!organization) {
      throw new Error(`Organization ${organizationId} not found`);
    }

    const comparisons: Comparison[] = [];

    // Industry comparison
    const industryComparison = this.compareByIndustry(organization);
    comparisons.push(industryComparison);

    // Size comparison
    const sizeComparison = this.compareBySize(organization);
    comparisons.push(sizeComparison);

    // Maturity comparison
    const maturityComparison = this.compareByMaturity(organization);
    comparisons.push(maturityComparison);

    // Historical comparison
    const historicalComparison = this.compareHistorical(organization);
    comparisons.push(historicalComparison);

    const insights = this.generateComparisonInsights(organization, comparisons);
    const recommendations = this.generateBenchmarkRecommendations(
      organization,
      insights,
    );
    const ranking = this.calculateRanking(organization);

    return {
      organization,
      comparisons,
      insights,
      recommendations,
      ranking,
    };
  }

  /**
   * Get industry benchmarks
   */
  getIndustryBenchmarks(industry: string): IndustryBenchmark | undefined {
    const allBenchmarks = Array.from(this.organizations.values()).flatMap(
      (org) => org.benchmarks.industryBenchmarks,
    );

    return allBenchmarks.find((b) => b.industry === industry);
  }

  /**
   * Get top performers by industry
   */
  getTopPerformers(
    industry: string,
    limit: number = 10,
  ): OrganizationReference[] {
    const industryOrgs = Array.from(this.organizations.values()).filter(
      (org) => org.industry === industry,
    );

    return industryOrgs
      .map((org) => ({
        id: org.id,
        name: org.name,
        score: this.calculateOrganizationScore(org),
        characteristics: this.extractOrganizationCharacteristics(org),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Generate benchmark report
   */
  generateBenchmarkReport(organizationId: string): BenchmarkReport {
    const comparison = this.compareOrganization(organizationId);

    return {
      organization: comparison.organization,
      reportDate: new Date(),
      summary: this.generateBenchmarkSummary(comparison),
      comparisons: comparison.comparisons,
      insights: comparison.insights,
      recommendations: comparison.recommendations,
      ranking: comparison.ranking,
      actionPlan: this.generateActionPlan(comparison),
    };
  }

  private initializeBenchmarks(): void {
    // Initialize with default benchmark data
    // In a real implementation, this would load from a database or external service
  }

  private generateBenchmarksForOrganization(
    organization: Omit<
      OrganizationProfile,
      'id' | 'createdAt' | 'lastUpdated' | 'analyses' | 'benchmarks'
    >,
  ): BenchmarkData {
    return {
      industryBenchmarks: this.getIndustryBenchmarkData(organization.industry),
      sizeBenchmarks: this.getSizeBenchmarkData(organization.size),
      maturityBenchmarks: this.getMaturityBenchmarkData(organization.maturity),
      historicalTrends: [],
    };
  }

  private getIndustryBenchmarkData(industry: string): IndustryBenchmark[] {
    // Simulated industry benchmark data
    const benchmarks: { [key: string]: IndustryBenchmark } = {
      technology: {
        industry: 'technology',
        averageAIAdoption: 75,
        averageTeamReadiness: 70,
        averageConflicts: 4,
        commonInsights: [
          'Technical debt concerns',
          'Skill gaps',
          'Process optimization',
        ],
        recommendedActions: [
          'Invest in training',
          'Establish AI guidelines',
          'Create mentorship programs',
        ],
        topPerformers: [],
      },
      healthcare: {
        industry: 'healthcare',
        averageAIAdoption: 45,
        averageTeamReadiness: 55,
        averageConflicts: 6,
        commonInsights: [
          'Regulatory compliance',
          'Data privacy',
          'Patient safety',
        ],
        recommendedActions: [
          'Focus on compliance',
          'Implement robust testing',
          'Establish ethics review',
        ],
        topPerformers: [],
      },
      finance: {
        industry: 'finance',
        averageAIAdoption: 60,
        averageTeamReadiness: 65,
        averageConflicts: 5,
        commonInsights: [
          'Risk management',
          'Regulatory requirements',
          'Security concerns',
        ],
        recommendedActions: [
          'Strengthen security',
          'Enhance risk assessment',
          'Improve documentation',
        ],
        topPerformers: [],
      },
    };

    return benchmarks[industry] ? [benchmarks[industry]] : [];
  }

  private getSizeBenchmarkData(size: string): SizeBenchmark[] {
    const sizePatterns: { [key: string]: SizePattern[] } = {
      startup: [
        {
          persona: 'Leo Alvarez',
          typicalConfidence: 'high',
          typicalInsightCount: 3,
          commonConcerns: ['Learning curve', 'Resource constraints'],
          typicalTimeframe: '1-2 weeks',
        },
        {
          persona: 'Priya Nair',
          typicalConfidence: 'high',
          typicalInsightCount: 4,
          commonConcerns: ['Speed vs quality'],
          typicalTimeframe: '2-3 weeks',
        },
      ],
      enterprise: [
        {
          persona: 'Dana Shah',
          typicalConfidence: 'high',
          typicalInsightCount: 2,
          commonConcerns: ['Technical debt', 'Governance'],
          typicalTimeframe: '3-4 months',
        },
        {
          persona: 'Ben Okafor',
          typicalConfidence: 'high',
          typicalInsightCount: 2,
          commonConcerns: ['Stakeholder alignment'],
          typicalTimeframe: '3-4 weeks',
        },
      ],
    };

    return [
      {
        size,
        typicalPatterns: sizePatterns[size] || [],
        challenges:
          size === 'startup'
            ? ['Limited resources', 'Rapid growth']
            : ['Bureaucracy', 'Legacy systems'],
        successFactors:
          size === 'startup'
            ? ['Agility', 'Innovation']
            : ['Stability', 'Resources'],
        timeToAdoption: size === 'startup' ? '1-3 months' : '6-12 months',
      },
    ];
  }

  private getMaturityBenchmarkData(maturity: string): MaturityBenchmark[] {
    const maturityData: { [key: string]: MaturityBenchmark } = {
      emerging: {
        maturity: 'emerging',
        characteristics: [
          'Low AI adoption',
          'High resistance',
          'Learning focus',
        ],
        nextSteps: ['Build awareness', 'Start small pilots', 'Education'],
        riskFactors: ['Skill gaps', 'Cultural resistance'],
        bestPractices: ['Start small', 'Focus on learning', 'Build confidence'],
      },
      advanced: {
        maturity: 'advanced',
        characteristics: [
          'High AI adoption',
          'Optimized processes',
          'Innovation focus',
        ],
        nextSteps: [
          'Scale successes',
          'Explore new use cases',
          'Mentor others',
        ],
        riskFactors: ['Over-optimization', 'Complacency'],
        bestPractices: [
          'Continuous improvement',
          'Knowledge sharing',
          'Innovation culture',
        ],
      },
    };

    return maturityData[maturity] ? [maturityData[maturity]] : [];
  }

  private updateOrganizationBenchmarks(
    organization: OrganizationProfile,
  ): void {
    // Update benchmarks based on new analysis data
    // In a real implementation, this would recalculate benchmarks based on accumulated data
  }

  private compareByIndustry(organization: OrganizationProfile): Comparison {
    const industryBenchmark = organization.benchmarks.industryBenchmarks[0];
    if (!industryBenchmark) {
      return this.createDefaultComparison(
        'industry',
        'No industry data available',
      );
    }

    const orgScore = this.calculateOrganizationScore(organization);
    const benchmarkScore = industryBenchmark.averageAIAdoption;
    const score = orgScore - benchmarkScore;
    const percentile = this.calculatePercentile(score, 'industry');

    return {
      type: 'industry',
      target: organization.industry,
      score,
      percentile,
      strengths: this.identifyStrengths(organization, industryBenchmark),
      weaknesses: this.identifyWeaknesses(organization, industryBenchmark),
      opportunities: this.identifyOpportunities(
        organization,
        industryBenchmark,
      ),
    };
  }

  private compareBySize(organization: OrganizationProfile): Comparison {
    const sizeBenchmark = organization.benchmarks.sizeBenchmarks[0];
    if (!sizeBenchmark) {
      return this.createDefaultComparison('size', 'No size data available');
    }

    const orgScore = this.calculateOrganizationScore(organization);
    const typicalScore = this.getTypicalScoreForSize(organization.size);
    const score = orgScore - typicalScore;
    const percentile = this.calculatePercentile(score, 'size');

    return {
      type: 'size',
      target: organization.size,
      score,
      percentile,
      strengths: this.identifySizeStrengths(organization, sizeBenchmark),
      weaknesses: this.identifySizeWeaknesses(organization, sizeBenchmark),
      opportunities: this.identifySizeOpportunities(
        organization,
        sizeBenchmark,
      ),
    };
  }

  private compareByMaturity(organization: OrganizationProfile): Comparison {
    const maturityBenchmark = organization.benchmarks.maturityBenchmarks[0];
    if (!maturityBenchmark) {
      return this.createDefaultComparison(
        'maturity',
        'No maturity data available',
      );
    }

    const orgScore = this.calculateOrganizationScore(organization);
    const typicalScore = this.getTypicalScoreForMaturity(organization.maturity);
    const score = orgScore - typicalScore;
    const percentile = this.calculatePercentile(score, 'maturity');

    return {
      type: 'maturity',
      target: organization.maturity,
      score,
      percentile,
      strengths: this.identifyMaturityStrengths(
        organization,
        maturityBenchmark,
      ),
      weaknesses: this.identifyMaturityWeaknesses(
        organization,
        maturityBenchmark,
      ),
      opportunities: this.identifyMaturityOpportunities(
        organization,
        maturityBenchmark,
      ),
    };
  }

  private compareHistorical(organization: OrganizationProfile): Comparison {
    if (organization.analyses.length < 2) {
      return this.createDefaultComparison(
        'historical',
        'Insufficient historical data',
      );
    }

    const recentAnalyses = organization.analyses.slice(-5);
    const olderAnalyses = organization.analyses.slice(-10, -5);

    const recentScore =
      recentAnalyses.reduce(
        (sum, a) => sum + this.calculateAnalysisScore(a),
        0,
      ) / recentAnalyses.length;
    const olderScore =
      olderAnalyses.length > 0
        ? olderAnalyses.reduce(
            (sum, a) => sum + this.calculateAnalysisScore(a),
            0,
          ) / olderAnalyses.length
        : recentScore - 10;

    const score = recentScore - olderScore;
    const percentile = this.calculatePercentile(score, 'historical');

    return {
      type: 'historical',
      target: 'time progression',
      score,
      percentile,
      strengths: score > 5 ? ['Improving trajectory'] : [],
      weaknesses: score < -5 ? ['Declining performance'] : [],
      opportunities:
        score > 0 ? ['Build on momentum'] : ['Opportunity for improvement'],
    };
  }

  private createDefaultComparison(
    type: Comparison['type'],
    message: string,
  ): Comparison {
    return {
      type,
      target: 'N/A',
      score: 0,
      percentile: 50,
      strengths: [],
      weaknesses: [message],
      opportunities: [],
    };
  }

  private calculateOrganizationScore(
    organization: OrganizationProfile,
  ): number {
    if (organization.analyses.length === 0) {
      return 50; // Default score
    }

    const latestAnalysis =
      organization.analyses[organization.analyses.length - 1];
    return this.calculateAnalysisScore(latestAnalysis);
  }

  private calculateAnalysisScore(analysis: OrganizationAnalysis): number {
    const { result } = analysis;

    // Calculate score based on various factors
    const avgReadiness =
      (analysis.context.scores.repoReadiness +
        analysis.context.scores.teamReadiness +
        analysis.context.scores.orgReadiness) /
      3;

    const insightQuality =
      result.personaAnalyses.reduce((sum, a) => {
        const confidenceScore =
          a.confidence === 'high' ? 85 : a.confidence === 'medium' ? 65 : 35;
        return sum + confidenceScore;
      }, 0) / result.personaAnalyses.length;

    const conflictPenalty = result.conflictAreas.length * 5;
    const consensusBonus = result.consensusAreas.length * 3;

    return Math.round(
      avgReadiness * 0.4 +
        insightQuality * 0.4 +
        consensusBonus -
        conflictPenalty,
    );
  }

  private getTypicalScoreForSize(size: string): number {
    const typicalScores: { [key: string]: number } = {
      startup: 65,
      small: 70,
      medium: 75,
      large: 80,
      enterprise: 85,
    };
    return typicalScores[size] || 70;
  }

  private getTypicalScoreForMaturity(maturity: string): number {
    const typicalScores: { [key: string]: number } = {
      emerging: 45,
      developing: 65,
      mature: 80,
      advanced: 90,
    };
    return typicalScores[maturity] || 65;
  }

  private calculatePercentile(score: number, category: string): number {
    // Simplified percentile calculation
    // In a real implementation, this would use actual distribution data
    const basePercentile = 50 + score / 2; // Simple linear mapping
    return Math.max(0, Math.min(100, Math.round(basePercentile)));
  }

  private identifyStrengths(
    organization: OrganizationProfile,
    benchmark: IndustryBenchmark,
  ): string[] {
    const strengths: string[] = [];
    const orgScore = this.calculateOrganizationScore(organization);

    if (orgScore > benchmark.averageAIAdoption + 10) {
      strengths.push('Above average AI adoption');
    }

    if (organization.analyses.length > 0) {
      const latestAnalysis =
        organization.analyses[organization.analyses.length - 1];
      if (
        latestAnalysis.result.conflictAreas.length < benchmark.averageConflicts
      ) {
        strengths.push('Fewer conflicts than industry average');
      }
    }

    return strengths;
  }

  private identifyWeaknesses(
    organization: OrganizationProfile,
    benchmark: IndustryBenchmark,
  ): string[] {
    const weaknesses: string[] = [];
    const orgScore = this.calculateOrganizationScore(organization);

    if (orgScore < benchmark.averageAIAdoption - 10) {
      weaknesses.push('Below average AI adoption');
    }

    if (organization.analyses.length > 0) {
      const latestAnalysis =
        organization.analyses[organization.analyses.length - 1];
      if (
        latestAnalysis.result.conflictAreas.length > benchmark.averageConflicts
      ) {
        weaknesses.push('More conflicts than industry average');
      }
    }

    return weaknesses;
  }

  private identifyOpportunities(
    organization: OrganizationProfile,
    benchmark: IndustryBenchmark,
  ): string[] {
    return benchmark.recommendedActions.slice(0, 3);
  }

  private identifySizeStrengths(
    organization: OrganizationProfile,
    benchmark: SizeBenchmark,
  ): string[] {
    return benchmark.successFactors.slice(0, 2);
  }

  private identifySizeWeaknesses(
    organization: OrganizationProfile,
    benchmark: SizeBenchmark,
  ): string[] {
    return benchmark.challenges.slice(0, 2);
  }

  private identifySizeOpportunities(
    organization: OrganizationProfile,
    benchmark: SizeBenchmark,
  ): string[] {
    return ['Leverage size advantages', 'Address size-specific challenges'];
  }

  private identifyMaturityStrengths(
    organization: OrganizationProfile,
    benchmark: MaturityBenchmark,
  ): string[] {
    return benchmark.characteristics.slice(0, 2);
  }

  private identifyMaturityWeaknesses(
    organization: OrganizationProfile,
    benchmark: MaturityBenchmark,
  ): string[] {
    return benchmark.riskFactors.slice(0, 2);
  }

  private identifyMaturityOpportunities(
    organization: OrganizationProfile,
    benchmark: MaturityBenchmark,
  ): string[] {
    return benchmark.nextSteps.slice(0, 2);
  }

  private generateComparisonInsights(
    organization: OrganizationProfile,
    comparisons: Comparison[],
  ): ComparisonInsight[] {
    const insights: ComparisonInsight[] = [];

    comparisons.forEach((comparison) => {
      if (comparison.percentile > 75) {
        insights.push({
          category: comparison.type,
          insight: `Organization performs in top quartile for ${comparison.type}`,
          evidence: [
            `Percentile: ${comparison.percentile}%`,
            `Score: ${comparison.score}`,
          ],
          impact: 'high',
          actionability: 'immediate',
        });
      } else if (comparison.percentile < 25) {
        insights.push({
          category: comparison.type,
          insight: `Organization performs in bottom quartile for ${comparison.type}`,
          evidence: [
            `Percentile: ${comparison.percentile}%`,
            `Score: ${comparison.score}`,
          ],
          impact: 'high',
          actionability: 'immediate',
        });
      }
    });

    return insights;
  }

  private generateBenchmarkRecommendations(
    organization: OrganizationProfile,
    insights: ComparisonInsight[],
  ): BenchmarkRecommendation[] {
    const recommendations: BenchmarkRecommendation[] = [];

    insights.forEach((insight) => {
      if (insight.impact === 'high' && insight.actionability === 'immediate') {
        recommendations.push({
          title: `Address ${insight.category} performance`,
          description: insight.insight,
          priority: 'high',
          category: 'strategic',
          effort: 'medium',
          timeframe: '1-3 months',
          expectedImpact: 'Significant performance improvement',
          supportingData: insight.evidence,
        });
      }
    });

    return recommendations;
  }

  private calculateRanking(
    organization: OrganizationProfile,
  ): OrganizationRanking {
    const allOrganizations = Array.from(this.organizations.values());
    const scores = allOrganizations.map((org) =>
      this.calculateOrganizationScore(org),
    );
    const orgScore = this.calculateOrganizationScore(organization);

    const sortedScores = scores.sort((a, b) => b - a);
    const rank = sortedScores.indexOf(orgScore) + 1;

    return {
      overall: rank,
      byCategory: {
        industry: this.calculateCategoryRank(organization, 'industry'),
        size: this.calculateCategoryRank(organization, 'size'),
        maturity: this.calculateCategoryRank(organization, 'maturity'),
      },
      totalOrganizations: allOrganizations.length,
      topQuartile: rank <= Math.ceil(allOrganizations.length * 0.25),
    };
  }

  private calculateCategoryRank(
    organization: OrganizationProfile,
    category: string,
  ): number {
    const categoryOrgs = Array.from(this.organizations.values()).filter(
      (org) => (org as any)[category] === (organization as any)[category],
    );

    const scores = categoryOrgs.map((org) =>
      this.calculateOrganizationScore(org),
    );
    const orgScore = this.calculateOrganizationScore(organization);

    const sortedScores = scores.sort((a, b) => b - a);
    return sortedScores.indexOf(orgScore) + 1;
  }

  private extractOrganizationCharacteristics(
    organization: OrganizationProfile,
  ): string[] {
    const characteristics: string[] = [];

    characteristics.push(`${organization.size} organization`);
    characteristics.push(`${organization.maturity} AI maturity`);
    characteristics.push(`${organization.industry} industry`);

    if (organization.analyses.length > 0) {
      const latestAnalysis =
        organization.analyses[organization.analyses.length - 1];
      characteristics.push(
        `${latestAnalysis.result.conflictAreas.length} conflict areas`,
      );
      characteristics.push(
        `${latestAnalysis.result.consensusAreas.length} consensus areas`,
      );
    }

    return characteristics;
  }

  private generateBenchmarkSummary(comparison: ComparisonResult): string {
    const { organization, ranking } = comparison;

    return `${organization.name} ranks ${ranking.overall}/${ranking.totalOrganizations} overall (${ranking.topQuartile ? 'top quartile' : 'below top quartile'}). Key strengths include ${comparison.comparisons
      .filter((c) => c.strengths.length > 0)
      .map((c) => c.type)
      .join(', ')}. Areas for improvement include ${comparison.comparisons
      .filter((c) => c.weaknesses.length > 0)
      .map((c) => c.type)
      .join(', ')}.`;
  }

  private generateActionPlan(comparison: ComparisonResult): ActionPlan {
    return {
      immediateActions: comparison.recommendations
        .filter(
          (r) =>
            r.timeframe.includes('immediate') || r.timeframe.includes('1-3'),
        )
        .map((r) => r.title),
      shortTermGoals: comparison.recommendations
        .filter((r) => r.timeframe.includes('3-6'))
        .map((r) => r.title),
      longTermObjectives: comparison.recommendations
        .filter(
          (r) => r.timeframe.includes('6-12') || r.timeframe.includes('1 year'),
        )
        .map((r) => r.title),
      successMetrics: this.generateSuccessMetrics(comparison),
      reviewSchedule: 'Quarterly review with annual comprehensive assessment',
    };
  }

  private generateSuccessMetrics(comparison: ComparisonResult): string[] {
    return [
      'Improve overall ranking by 10%',
      'Reduce conflict areas by 20%',
      'Increase consensus areas by 15%',
      'Achieve top quartile performance in at least 2 categories',
    ];
  }

  private generateOrganizationId(): string {
    return `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAnalysisId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export interface BenchmarkReport {
  organization: OrganizationProfile;
  reportDate: Date;
  summary: string;
  comparisons: Comparison[];
  insights: ComparisonInsight[];
  recommendations: BenchmarkRecommendation[];
  ranking: OrganizationRanking;
  actionPlan: ActionPlan;
}

export interface ActionPlan {
  immediateActions: string[];
  shortTermGoals: string[];
  longTermObjectives: string[];
  successMetrics: string[];
  reviewSchedule: string;
}
