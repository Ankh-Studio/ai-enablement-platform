/**
 * Phase 6 Advanced Features Demo
 *
 * Demonstrates LLM Integration, Historical Tracking, and Organization Benchmarking
 */

import { LLMIntegration } from '../../src/core/llm-integration';
import { HistoricalTracking } from '../../src/core/historical-tracking';
import { OrganizationBenchmarking } from '../../src/core/organization-benchmarking';
import { MultiPerspectiveEngine } from '../../src/core/multi-perspective-engine';
import type { PersonaContext } from '../../src/types/persona';

describe('Phase 6 Advanced Features Demo', () => {
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

  it('should demonstrate all Phase 6 advanced features', async () => {
    console.log('\n🚀 PHASE 6 ADVANCED FEATURES DEMO');
    console.log('===============================\n');

    // 1. LLM Integration Demo
    console.log('🤖 1. LLM INTEGRATION');
    console.log('===================\n');

    const context: PersonaContext = {
      repository: 'advanced-features-demo',
      assessmentResults: {
        techStack: { languages: ['TypeScript'], frameworks: ['React', 'Node.js'] },
        codebaseMetrics: { totalFiles: 400, totalLines: 40000 },
        securityFeatures: { authentication: true, encryption: true },
        collaborationMetrics: { contributors: 12, commits: 2500 },
        deploymentMetrics: { frequency: 'daily', successRate: 0.96 },
      },
      scores: {
        repoReadiness: 85,
        teamReadiness: 80,
        orgReadiness: 82,
        overallMaturity: 7,
      },
      recommendations: [
        { id: '1', title: 'Scale AI adoption', description: 'Expand AI usage across teams', priority: 'high', category: 'ai' }
      ],
      targetAudience: 'organization',
    };

    const result = await multiPerspectiveEngine.analyzeRepository(context);
    const personaAnalysis = result.personaAnalyses[0]; // Dana Shah

    console.log(`Enhancing insights for ${personaAnalysis.persona}...`);
    
    const llmRequest = {
      repository: context.repository,
      persona: personaAnalysis.persona,
      context,
      insights: personaAnalysis.insights,
      prompt: personaAnalysis.summary,
    };

    const llmResponse = await llmIntegration.enhancePersonaInsights(llmRequest);

    console.log(`✅ Enhanced ${personaAnalysis.insights.length} insights to ${llmResponse.enhancedInsights.length} insights`);
    console.log(`✅ Confidence adjustment: +${llmResponse.confidenceAdjustment}`);
    console.log(`✅ Generated ${llmResponse.suggestedQuestions.length} suggested questions`);
    console.log(`✅ Validated ${llmResponse.evidenceValidation.length} evidence points\n`);

    // 2. Interactive Discussion Demo
    console.log('💬 2. INTERACTIVE DISCUSSION');
    console.log('========================\n');

    const discussion = await llmIntegration.createInteractiveDiscussion(
      'AI Adoption Strategy',
      ['Dana Shah', 'Leo Alvarez', 'Priya Nair'],
      context
    );

    console.log(`Created discussion: "${discussion.topic}"`);
    console.log(`Participants: ${discussion.participants.join(', ')}`);
    console.log(`Opening statements: ${discussion.messages.length}\n`);

    // Add some messages
    const message1 = await llmIntegration.addMessage(
      discussion.id,
      'Dana Shah',
      'We must maintain code quality and avoid technical debt.',
      'statement'
    );

    console.log(`Added message from ${message1.persona}: "${message1.content}"`);

    const message2 = await llmIntegration.addMessage(
      discussion.id,
      'Leo Alvarez',
      'How can we balance quality with learning opportunities?',
      'question'
    );

    console.log(`Added message from ${message2.persona}: "${message2.content}"`);

    const discussionResult = await llmIntegration.concludeDiscussion(discussion.id);

    console.log(`✅ Discussion concluded with ${discussion.messages.length} total messages`);
    console.log(`✅ Generated summary: ${discussionResult.summary.substring(0, 100)}...`);
    console.log(`✅ Identified ${discussionResult.outcomes.length} outcomes\n`);

    // 3. Historical Tracking Demo
    console.log('📈 3. HISTORICAL TRACKING');
    console.log('========================\n');

    // Record multiple analyses over time
    console.log('Recording analyses over time...');

    const analysis1 = historicalTracking.recordAnalysis(context.repository, context, result, 5000);
    console.log(`✅ Recorded analysis 1: ${analysis1.id}`);

    // Simulate time progression with different scores
    const laterContext = {
      ...context,
      scores: { ...context.scores, repoReadiness: 90, teamReadiness: 85 },
    };
    const laterResult = await multiPerspectiveEngine.analyzeRepository(laterContext);
    const analysis2 = historicalTracking.recordAnalysis(context.repository, laterContext, laterResult, 4500);
    console.log(`✅ Recorded analysis 2: ${analysis2.id} (improved scores)`);

    const finalContext = {
      ...context,
      scores: { ...context.scores, repoReadiness: 95, teamReadiness: 90, orgReadiness: 88 },
    };
    const finalResult = await multiPerspectiveEngine.analyzeRepository(finalContext);
    const analysis3 = historicalTracking.recordAnalysis(context.repository, finalContext, finalResult, 4000);
    console.log(`✅ Recorded analysis 3: ${analysis3.id} (further improvement)`);

    // Get perspective evolution
    const evolution = historicalTracking.getPerspectiveEvolution('Dana Shah');
    if (evolution) {
      console.log(`✅ Tracked ${evolution.evolutionPoints.length} evolution points for Dana Shah`);
      console.log(`✅ Identified ${evolution.trends.length} trends`);
      console.log(`✅ Generated ${evolution.confidenceEvolution.length} confidence data points`);
      
      const learningPatterns = historicalTracking.getLearningPatterns();
      const danaPatterns = learningPatterns.filter(p => p.persona === 'Dana Shah');
      console.log(`✅ Found ${danaPatterns.length} learning patterns for Dana Shah\n`);
    }

    // 4. Organization Benchmarking Demo
    console.log('🏢 4. ORGANIZATION BENCHMARKING');
    console.log('============================\n');

    // Register organizations
    const techCorp = orgBenchmarking.registerOrganization({
      name: 'TechCorp',
      industry: 'technology',
      size: 'medium',
      maturity: 'developing',
      location: 'San Francisco',
    });

    const startupX = orgBenchmarking.registerOrganization({
      name: 'StartupX',
      industry: 'technology',
      size: 'startup',
      maturity: 'emerging',
      location: 'New York',
    });

    const enterpriseCo = orgBenchmarking.registerOrganization({
      name: 'EnterpriseCo',
      industry: 'technology',
      size: 'enterprise',
      maturity: 'advanced',
      location: 'Seattle',
    });

    console.log(`✅ Registered 3 organizations: ${techCorp.name}, ${startupX.name}, ${enterpriseCo.name}`);

    // Add analysis to TechCorp
    const teamProfile = {
      name: 'Engineering Team',
      size: 12,
      composition: { technical: 8, product: 2, design: 1, management: 1, other: 0 },
      experience: { averageYears: 5, seniorityDistribution: { junior: 3, mid: 5, senior: 3, lead: 1 }, aiExperience: 'intermediate' },
      culture: { collaboration: 'high', innovation: 'moderate', riskTolerance: 'medium', communication: 'mixed' },
    };

    const orgAnalysis = orgBenchmarking.addAnalysis(techCorp.id, context.repository, context, result, teamProfile);
    console.log(`✅ Added analysis to ${techCorp.name}: ${orgAnalysis.id}`);

    // Get benchmarks
    const industryBenchmark = orgBenchmarking.getIndustryBenchmarks('technology');
    if (industryBenchmark) {
      console.log(`✅ Industry benchmark for technology:`);
      console.log(`   Average AI adoption: ${industryBenchmark.averageAIAdoption}%`);
      console.log(`   Average team readiness: ${industryBenchmark.averageTeamReadiness}%`);
      console.log(`   Common insights: ${industryBenchmark.commonInsights.join(', ')}`);
    }

    // Get top performers
    const topPerformers = orgBenchmarking.getTopPerformers('technology', 3);
    console.log(`✅ Top 3 performers in technology industry:`);
    topPerformers.forEach((perf, i) => {
      console.log(`   ${i + 1}. ${perf.name} (Score: ${perf.score})`);
    });

    // Generate comparison
    const comparison = orgBenchmarking.compareOrganization(techCorp.id);
    console.log(`✅ Generated comparison for ${techCorp.name}:`);
    console.log(`   Overall ranking: ${comparison.ranking.overall}/${comparison.ranking.totalOrganizations}`);
    console.log(`   Top quartile: ${comparison.ranking.topQuartile ? 'Yes' : 'No'}`);
    console.log(`   Comparisons: ${comparison.comparisons.length} categories`);
    console.log(`   Insights: ${comparison.insights.length} identified`);
    console.log(`   Recommendations: ${comparison.recommendations.length} provided\n`);

    // 5. Comprehensive Report
    console.log('📊 5. COMPREHENSIVE REPORT');
    console.log('========================\n');

    const benchmarkReport = orgBenchmarking.generateBenchmarkReport(techCorp.id);
    console.log(`✅ Benchmark Report for ${techCorp.name}:`);
    console.log(`   Report date: ${benchmarkReport.reportDate.toLocaleDateString()}`);
    console.log(`   Summary: ${benchmarkReport.summary.substring(0, 150)}...`);
    console.log(`   Action plan items: ${benchmarkReport.actionPlan.immediateActions.length + benchmarkReport.actionPlan.shortTermGoals.length + benchmarkReport.actionPlan.longTermObjectives.length}`);

    const evolutionReport = historicalTracking.generateEvolutionReport('Dana Shah');
    console.log(`✅ Evolution Report for Dana Shah:`);
    console.log(`   Summary: ${evolutionReport.summary}`);
    console.log(`   Trends: ${evolutionReport.trends.length} identified`);
    console.log(`   Learning patterns: ${evolutionReport.learningPatterns.length} found`);

    // 6. Integration Summary
    console.log('\n🎯 PHASE 6 INTEGRATION SUMMARY');
    console.log('============================\n');

    console.log('✅ LLM Integration Features:');
    console.log('   • Enhanced persona insights with AI coalescing');
    console.log('   • Dynamic response generation');
    console.log('   • Evidence validation and reasoning');
    console.log('   • Interactive adversarial discussions');
    console.log('   • Real-time conversation facilitation\n');

    console.log('✅ Historical Tracking Features:');
    console.log('   • Perspective evolution over time');
    console.log('   • Confidence trend analysis');
    console.log('   • Learning pattern identification');
    console.log('   • Priority shift detection');
    console.log('   • Time period comparisons\n');

    console.log('✅ Organization Benchmarking Features:');
    console.log('   • Industry and size comparisons');
    console.log('   • Maturity level benchmarks');
    console.log('   • Top performer identification');
    console.log('   • Comprehensive ranking system');
    console.log('   • Action plan generation\n');

    console.log('🚀 READY FOR CLIENT TESTING!');
    console.log('========================\n');

    console.log('The advanced features system provides:');
    console.log('• Real-time AI-enhanced persona insights');
    console.log('• Interactive adversarial discussions');
    console.log('• Historical perspective tracking');
    console.log('• Cross-organization benchmarking');
    console.log('• Comprehensive reporting and analytics');
    console.log('• Actionable recommendations and insights\n');

    // Validation
    expect(llmResponse.enhancedInsights.length).toBeGreaterThan(0);
    expect(discussion.messages.length).toBeGreaterThan(0);
    expect(historicalTracking.getRepositoryAnalyses(context.repository)).toHaveLength(3);
    expect(comparison.organization).toBe(techCorp);
    expect(benchmarkReport.actionPlan).toBeDefined();
    expect(evolutionReport.trends).toBeDefined();

    console.log('✅ Phase 6 Advanced Features Demo Complete!');
    console.log('🚀 System ready for comprehensive AI adoption analysis and organizational benchmarking!');
  });
});
