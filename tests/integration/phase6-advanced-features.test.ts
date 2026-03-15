/**
 * Phase 6 Advanced Features Integration Tests
 *
 * Tests LLM Integration, Historical Tracking, and Organization Benchmarking
 */

import { HistoricalTracking } from '../../src/core/historical-tracking';
import { LLMIntegration } from '../../src/core/llm-integration';
import { MultiPerspectiveEngine } from '../../src/core/multi-perspective-engine';
import { OrganizationBenchmarking } from '../../src/core/organization-benchmarking';
import type { PersonaContext } from '../../src/types/persona';

describe('Phase 6 Advanced Features', () => {
  let llmIntegration: LLMIntegration;
  let historicalTracking: HistoricalTracking;
  let orgBenchmarking: OrganizationBenchmarking;
  let multiPerspectiveEngine: MultiPerspectiveEngine;

  beforeEach(() => {
    llmIntegration = new LLMIntegration();
    historicalTracking = new HistoricalTracking();
    orgBenchmarking = new OrganizationBenchmarking();
    multiPerspectiveEngine = new MultiPerspectiveEngine();
  });

  describe('LLM Integration', () => {
    let context: PersonaContext;
    let multiPerspectiveResult: any;

    beforeEach(async () => {
      context = {
        repository: 'test-repository',
        assessmentResults: {
          techStack: { languages: ['TypeScript'], frameworks: ['React', 'Bun'] },
          codebaseMetrics: { totalFiles: 300, totalLines: 30000 },
          securityFeatures: { authentication: true, encryption: false },
          collaborationMetrics: { contributors: 8, commits: 1200 },
          deploymentMetrics: { frequency: 'weekly', successRate: 0.95 },
        },
        scores: {
          repoReadiness: 75,
          teamReadiness: 70,
          orgReadiness: 80,
          overallMaturity: 6,
        },
        recommendations: [
          { id: '1', title: 'Add more tests', description: 'Expand test coverage', priority: 'high', category: 'foundation' }
        ],
        targetAudience: 'team',
      };

      multiPerspectiveResult = await multiPerspectiveEngine.analyzeRepository(context);
    });

    it('should enhance persona insights with LLM coalescing', async () => {
      const personaAnalysis = multiPerspectiveResult.personaAnalyses[0];
      
      const request = {
        repository: context.repository,
        persona: personaAnalysis.persona,
        context,
        insights: personaAnalysis.insights,
        prompt: personaAnalysis.summary,
      };

      const response = await llmIntegration.enhancePersonaInsights(request);

      expect(response.enhancedInsights).toBeDefined();
      expect(response.enhancedInsights.length).toBeGreaterThan(personaAnalysis.insights.length);
      expect(response.dynamicResponse).toBeDefined();
      expect(response.confidenceAdjustment).toBeDefined();
      expect(response.reasoning).toBeDefined();
      expect(response.suggestedQuestions).toBeDefined();
      expect(response.evidenceValidation).toBeDefined();
    });

    it('should create and manage interactive discussions', async () => {
      const discussion = await llmIntegration.createInteractiveDiscussion(
        'AI Adoption Strategy',
        ['Dana Shah', 'Leo Alvarez', 'Priya Nair'],
        context
      );

      expect(discussion.id).toBeDefined();
      expect(discussion.topic).toBe('AI Adoption Strategy');
      expect(discussion.participants).toHaveLength(3);
      expect(discussion.status).toBe('active');
      expect(discussion.messages).toHaveLength(3); // Opening statements
    });

    it('should handle discussion messages and responses', async () => {
      const discussion = await llmIntegration.createInteractiveDiscussion(
        'AI Adoption Strategy',
        ['Dana Shah', 'Leo Alvarez'],
        context
      );

      const message = await llmIntegration.addMessage(
        discussion.id,
        'Dana Shah',
        'I think we need to focus more on quality and maintainability.',
        'statement'
      );

      expect(message.id).toBeDefined();
      expect(message.persona).toBe('Dana Shah');
      expect(message.content).toContain('quality and maintainability');
      expect(message.type).toBe('statement');
      expect(message.metadata).toBeDefined();

      // Check that responses were generated
      const updatedDiscussion = llmIntegration.getDiscussion(discussion.id);
      expect(updatedDiscussion?.messages.length).toBeGreaterThan(3);
    });

    it('should conclude discussions with summaries and outcomes', async () => {
      const discussion = await llmIntegration.createInteractiveDiscussion(
        'AI Adoption Strategy',
        ['Dana Shah', 'Leo Alvarez'],
        context
      );

      // Add some messages
      await llmIntegration.addMessage(discussion.id, 'Dana Shah', 'Quality is paramount', 'statement');
      await llmIntegration.addMessage(discussion.id, 'Leo Alvarez', 'Learning opportunities are important', 'statement');

      const result = await llmIntegration.concludeDiscussion(discussion.id);

      expect(result.summary).toBeDefined();
      expect(result.outcomes).toBeDefined();
      expect(result.outcomes.length).toBeGreaterThan(0);

      const concludedDiscussion = llmIntegration.getDiscussion(discussion.id);
      expect(concludedDiscussion?.status).toBe('concluded');
    });
  });

  describe('Historical Tracking', () => {
    let context: PersonaContext;
    let multiPerspectiveResult: any;

    beforeEach(async () => {
      context = {
        repository: 'historical-test-repo',
        assessmentResults: {
          techStack: { languages: ['TypeScript'], frameworks: ['React'] },
          codebaseMetrics: { totalFiles: 200, totalLines: 20000 },
          securityFeatures: { authentication: true, encryption: false },
          collaborationMetrics: { contributors: 5, commits: 800 },
          deploymentMetrics: { frequency: 'biweekly', successRate: 0.90 },
        },
        scores: {
          repoReadiness: 60,
          teamReadiness: 65,
          orgReadiness: 70,
          overallMaturity: 5,
        },
        recommendations: [
          { id: '1', title: 'Improve testing', description: 'Add unit tests', priority: 'medium', category: 'foundation' }
        ],
        targetAudience: 'team',
      };

      multiPerspectiveResult = await multiPerspectiveEngine.analyzeRepository(context);
    });

    it('should record and track analyses over time', async () => {
      const analysis = historicalTracking.recordAnalysis(
        context.repository,
        context,
        multiPerspectiveResult,
        5000 // 5 seconds analysis duration
      );

      expect(analysis.id).toBeDefined();
      expect(analysis.repository).toBe(context.repository);
      expect(analysis.timestamp).toBeInstanceOf(Date);
      expect(analysis.metadata).toBeDefined();
      expect(analysis.metadata.personaCount).toBe(5);
      expect(analysis.metadata.totalInsights).toBeGreaterThan(0);
    });

    it('should track perspective evolution for personas', async () => {
      // Record first analysis
      historicalTracking.recordAnalysis(context.repository, context, multiPerspectiveResult);

      // Modify context and record second analysis
      const updatedContext = {
        ...context,
        scores: { ...context.scores, repoReadiness: 80, teamReadiness: 75 },
      };
      const updatedResult = await multiPerspectiveEngine.analyzeRepository(updatedContext);
      historicalTracking.recordAnalysis(context.repository, updatedContext, updatedResult);

      const evolution = historicalTracking.getPerspectiveEvolution('Dana Shah');
      
      expect(evolution).toBeDefined();
      expect(evolution?.persona).toBe('Dana Shah');
      expect(evolution?.evolutionPoints).toHaveLength(2);
      expect(evolution?.trends).toBeDefined();
      expect(evolution?.confidenceEvolution).toHaveLength(2);
      expect(evolution?.insightEvolution).toHaveLength(2);
    });

    it('should identify learning patterns', async () => {
      // Record multiple analyses to establish patterns
      for (let i = 0; i < 3; i++) {
        const analysisContext = {
          ...context,
          scores: {
            ...context.scores,
            repoReadiness: 60 + i * 10,
            teamReadiness: 65 + i * 5,
          },
        };
        const result = await multiPerspectiveEngine.analyzeRepository(analysisContext);
        historicalTracking.recordAnalysis(`repo-${i}`, analysisContext, result);
      }

      const patterns = historicalTracking.getLearningPatterns();
      
      expect(patterns).toBeDefined();
      expect(patterns.length).toBeGreaterThan(0);
      
      patterns.forEach(pattern => {
        expect(pattern.persona).toBeDefined();
        expect(pattern.pattern).toBeDefined();
        expect(pattern.description).toBeDefined();
        expect(pattern.frequency).toBeGreaterThan(0);
        expect(['positive', 'negative', 'neutral']).toContain(pattern.impact);
      });
    });

    it('should compare time periods', async () => {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      // Record analyses at different times
      historicalTracking.recordAnalysis('repo-1', context, multiPerspectiveResult);
      
      const laterContext = {
        ...context,
        scores: { ...context.scores, repoReadiness: 85 },
      };
      const laterResult = await multiPerspectiveEngine.analyzeRepository(laterContext);
      historicalTracking.recordAnalysis('repo-2', laterContext, laterResult);

      const comparison = historicalTracking.compareTimePeriods(
        'Dana Shah',
        twoWeeksAgo,
        oneWeekAgo,
        oneWeekAgo,
        now
      );

      expect(comparison.persona).toBe('Dana Shah');
      expect(comparison.period1).toBeDefined();
      expect(comparison.period2).toBeDefined();
      expect(comparison.changes).toBeDefined();
    });

    it('should generate evolution reports', async () => {
      // Record some analyses
      historicalTracking.recordAnalysis(context.repository, context, multiPerspectiveResult);

      const report = historicalTracking.generateEvolutionReport('Dana Shah');

      expect(report.persona).toBe('Dana Shah');
      expect(report.summary).toBeDefined();
      expect(report.trends).toBeDefined();
      expect(report.learningPatterns).toBeDefined();
      expect(report.confidenceEvolution).toBeDefined();
      expect(report.insightEvolution).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });
  });

  describe('Organization Benchmarking', () => {
    let organization: any;

    beforeEach(() => {
      organization = orgBenchmarking.registerOrganization({
        name: 'TechCorp',
        industry: 'technology',
        size: 'medium',
        maturity: 'developing',
        location: 'San Francisco',
      });
    });

    it('should register organizations and track profiles', () => {
      expect(organization.id).toBeDefined();
      expect(organization.name).toBe('TechCorp');
      expect(organization.industry).toBe('technology');
      expect(organization.size).toBe('medium');
      expect(organization.createdAt).toBeInstanceOf(Date);
      expect(organization.benchmarks).toBeDefined();
    });

    it('should add analyses to organization profiles', async () => {
      const context: PersonaContext = {
        repository: 'techcorp-repo',
        assessmentResults: {
          techStack: { languages: ['TypeScript'], frameworks: ['React'] },
          codebaseMetrics: { totalFiles: 400, totalLines: 40000 },
          securityFeatures: { authentication: true, encryption: true },
          collaborationMetrics: { contributors: 12, commits: 2000 },
          deploymentMetrics: { frequency: 'daily', successRate: 0.95 },
        },
        scores: {
          repoReadiness: 80,
          teamReadiness: 75,
          orgReadiness: 85,
          overallMaturity: 7,
        },
        recommendations: [
          { id: '1', title: 'Scale AI adoption', description: 'Expand AI usage', priority: 'high', category: 'ai' }
        ],
        targetAudience: 'organization',
      };

      const result = await multiPerspectiveEngine.analyzeRepository(context);
      const teamProfile = {
        name: 'Engineering Team',
        size: 12,
        composition: { technical: 8, product: 2, design: 1, management: 1, other: 0 },
        experience: { averageYears: 5, seniorityDistribution: { junior: 3, mid: 5, senior: 3, lead: 1 }, aiExperience: 'intermediate' },
        culture: { collaboration: 'high', innovation: 'moderate', riskTolerance: 'medium', communication: 'mixed' },
      };

      const analysis = orgBenchmarking.addAnalysis(organization.id, context.repository, context, result, teamProfile);

      expect(analysis.id).toBeDefined();
      expect(analysis.repository).toBe(context.repository);
      expect(analysis.teamProfile).toBeDefined();
      expect(organization.analyses).toHaveLength(1);
    });

    it('should compare organizations against benchmarks', async () => {
      // Add an analysis first
      const context: PersonaContext = {
        repository: 'benchmark-test-repo',
        assessmentResults: {
          techStack: { languages: ['Python'], frameworks: ['Django'] },
          codebaseMetrics: { totalFiles: 300, totalLines: 35000 },
          securityFeatures: { authentication: true, encryption: true },
          collaborationMetrics: { contributors: 10, commits: 1500 },
          deploymentMetrics: { frequency: 'weekly', successRate: 0.92 },
        },
        scores: {
          repoReadiness: 70,
          teamReadiness: 72,
          orgReadiness: 78,
          overallMaturity: 6,
        },
        recommendations: [
          { id: '1', title: 'Improve security', description: 'Enhance security measures', priority: 'high', category: 'security' }
        ],
        targetAudience: 'organization',
      };

      const result = await multiPerspectiveEngine.analyzeRepository(context);
      const teamProfile = {
        name: 'Platform Team',
        size: 10,
        composition: { technical: 7, product: 2, design: 1, management: 0, other: 0 },
        experience: { averageYears: 6, seniorityDistribution: { junior: 2, mid: 4, senior: 3, lead: 1 }, aiExperience: 'advanced' },
        culture: { collaboration: 'high', innovation: 'aggressive', riskTolerance: 'high', communication: 'informal' },
      };

      orgBenchmarking.addAnalysis(organization.id, context.repository, context, result, teamProfile);

      const comparison = orgBenchmarking.compareOrganization(organization.id);

      expect(comparison.organization).toBe(organization);
      expect(comparison.comparisons).toHaveLength(4); // industry, size, maturity, historical
      expect(comparison.insights).toBeDefined();
      expect(comparison.recommendations).toBeDefined();
      expect(comparison.ranking).toBeDefined();
    });

    it('should provide industry benchmarks', () => {
      const techBenchmark = orgBenchmarking.getIndustryBenchmarks('technology');
      
      expect(techBenchmark).toBeDefined();
      expect(techBenchmark?.industry).toBe('technology');
      expect(techBenchmark?.averageAIAdoption).toBeDefined();
      expect(techBenchmark?.commonInsights).toBeDefined();
      expect(techBenchmark?.recommendedActions).toBeDefined();
    });

    it('should identify top performers', () => {
      // Register multiple organizations
      const org2 = orgBenchmarking.registerOrganization({
        name: 'StartupX',
        industry: 'technology',
        size: 'startup',
        maturity: 'emerging',
        location: 'New York',
      });

      const org3 = orgBenchmarking.registerOrganization({
        name: 'EnterpriseCo',
        industry: 'technology',
        size: 'enterprise',
        maturity: 'advanced',
        location: 'Seattle',
      });

      const topPerformers = orgBenchmarking.getTopPerformers('technology', 3);

      expect(topPerformers).toHaveLength(3);
      expect(topPerformers[0].score).toBeGreaterThanOrEqual(topPerformers[1].score);
      expect(topPerformers[1].score).toBeGreaterThanOrEqual(topPerformers[2].score);
    });

    it('should generate comprehensive benchmark reports', async () => {
      // Add analysis data
      const context: PersonaContext = {
        repository: 'report-test-repo',
        assessmentResults: {
          techStack: { languages: ['TypeScript'], frameworks: ['Next.js'] },
          codebaseMetrics: { totalFiles: 500, totalLines: 50000 },
          securityFeatures: { authentication: true, encryption: true },
          collaborationMetrics: { contributors: 15, commits: 3000 },
          deploymentMetrics: { frequency: 'daily', successRate: 0.98 },
        },
        scores: {
          repoReadiness: 85,
          teamReadiness: 80,
          orgReadiness: 90,
          overallMaturity: 8,
        },
        recommendations: [
          { id: '1', title: 'Expand AI features', description: 'Add more AI capabilities', priority: 'high', category: 'ai' }
        ],
        targetAudience: 'organization',
      };

      const result = await multiPerspectiveEngine.analyzeRepository(context);
      const teamProfile = {
        name: 'AI Team',
        size: 15,
        composition: { technical: 10, product: 3, design: 1, management: 1, other: 0 },
        experience: { averageYears: 7, seniorityDistribution: { junior: 3, mid: 6, senior: 4, lead: 2 }, aiExperience: 'expert' },
        culture: { collaboration: 'high', innovation: 'aggressive', riskTolerance: 'high', communication: 'mixed' },
      };

      orgBenchmarking.addAnalysis(organization.id, context.repository, context, result, teamProfile);

      const report = orgBenchmarking.generateBenchmarkReport(organization.id);

      expect(report.organization).toBe(organization);
      expect(report.reportDate).toBeInstanceOf(Date);
      expect(report.summary).toBeDefined();
      expect(report.comparisons).toBeDefined();
      expect(report.insights).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(report.ranking).toBeDefined();
      expect(report.actionPlan).toBeDefined();
    });
  });

  describe('Integration Test - All Advanced Features', () => {
    it('should work together across all advanced features', async () => {
      // 1. Create organization
      const organization = orgBenchmarking.registerOrganization({
        name: 'AdvancedTech',
        industry: 'technology',
        size: 'large',
        maturity: 'mature',
        location: 'Austin',
      });

      // 2. Perform analysis and track historically
      const context: PersonaContext = {
        repository: 'advanced-integration-repo',
        assessmentResults: {
          techStack: { languages: ['TypeScript', 'Python'], frameworks: ['React', 'FastAPI'] },
          codebaseMetrics: { totalFiles: 600, totalLines: 60000 },
          securityFeatures: { authentication: true, encryption: true },
          collaborationMetrics: { contributors: 20, commits: 4000 },
          deploymentMetrics: { frequency: 'daily', successRate: 0.97 },
        },
        scores: {
          repoReadiness: 90,
          teamReadiness: 85,
          orgReadiness: 88,
          overallMaturity: 8,
        },
        recommendations: [
          { id: '1', title: 'Optimize workflows', description: 'Streamline development processes', priority: 'high', category: 'workflow' }
        ],
        targetAudience: 'organization',
      };

      const result = await multiPerspectiveEngine.analyzeRepository(context);
      const historicalAnalysis = historicalTracking.recordAnalysis(context.repository, context, result);

      const teamProfile = {
        name: 'Advanced Engineering',
        size: 20,
        composition: { technical: 14, product: 3, design: 2, management: 1, other: 0 },
        experience: { averageYears: 8, seniorityDistribution: { junior: 4, mid: 8, senior: 6, lead: 2 }, aiExperience: 'expert' },
        culture: { collaboration: 'high', innovation: 'aggressive', riskTolerance: 'medium', communication: 'mixed' },
      };

      const orgAnalysis = orgBenchmarking.addAnalysis(organization.id, context.repository, context, result, teamProfile);

      // 3. Enhance with LLM integration
      const personaAnalysis = result.personaAnalyses[0];
      const llmRequest = {
        repository: context.repository,
        persona: personaAnalysis.persona,
        context,
        insights: personaAnalysis.insights,
        prompt: personaAnalysis.summary,
      };

      const llmResponse = await llmIntegration.enhancePersonaInsights(llmRequest);

      // 4. Create interactive discussion
      const discussion = await llmIntegration.createInteractiveDiscussion(
        'Strategic AI Adoption',
        ['Dana Shah', 'Ben Okafor'],
        context
      );

      // 5. Add some discussion messages
      await llmIntegration.addMessage(discussion.id, 'Dana Shah', 'Quality must remain our top priority', 'statement');
      await llmIntegration.addMessage(discussion.id, 'Ben Okafor', 'Customer value is critical', 'statement');

      // 6. Conclude discussion
      const discussionResult = await llmIntegration.concludeDiscussion(discussion.id);

      // 7. Generate benchmark report
      const benchmarkReport = orgBenchmarking.generateBenchmarkReport(organization.id);

      // 8. Generate evolution report
      const evolutionReport = historicalTracking.generateEvolutionReport('Dana Shah');

      // Verify all components worked together
      expect(historicalAnalysis.id).toBeDefined();
      expect(orgAnalysis.id).toBeDefined();
      expect(llmResponse.enhancedInsights.length).toBeGreaterThan(personaAnalysis.insights.length);
      expect(discussion.messages.length).toBeGreaterThan(2);
      expect(discussionResult.summary).toBeDefined();
      expect(benchmarkReport.actionPlan).toBeDefined();
      expect(evolutionReport.trends).toBeDefined();

      // Verify integration data flows
      expect(benchmarkReport.organization.analyses).toHaveLength(1);
      expect(historicalTracking.getRepositoryAnalyses(context.repository)).toHaveLength(1);
      expect(llmIntegration.getActiveDiscussions()).not.toContain(discussion); // Should be concluded
    });
  });
});
