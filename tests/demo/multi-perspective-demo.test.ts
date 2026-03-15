/**
 * Multi-Perspective Engine Demo
 *
 * Demonstrates the complete "one signal, five interpretations" analysis
 */

import { MultiPerspectiveEngine } from '../../src/core/multi-perspective-engine';
import type { PersonaContext } from '../../src/types/persona';

describe('Multi-Perspective Engine Demo', () => {
  let engine: MultiPerspectiveEngine;

  beforeEach(() => {
    engine = new MultiPerspectiveEngine();
  });

  it('should demonstrate complete multi-perspective analysis', async () => {
    console.log('\n🎯 MULTI-PERSPECTIVE ENGINE DEMO');
    console.log('================================\n');

    // Analyze this AI Enablement Platform repository
    const context: PersonaContext = {
      repository: 'ai-enablement-platform',
      assessmentResults: {
        techStack: { languages: ['TypeScript'], frameworks: ['React', 'Bun'] },
        codebaseMetrics: { totalFiles: 300, totalLines: 30000 },
        securityFeatures: { authentication: true, encryption: false },
        collaborationMetrics: { contributors: 8, commits: 1200 },
        deploymentMetrics: { frequency: 'weekly', successRate: 0.95 },
      },
      scores: {
        repoReadiness: 75, // High AI adoption
        teamReadiness: 70, // Good team readiness
        orgReadiness: 80, // Good org readiness
        overallMaturity: 6, // Good maturity
      },
      recommendations: [
        { id: '1', title: 'Add more tests', description: 'Expand test coverage', priority: 'high', category: 'foundation' }
      ],
      targetAudience: 'team',
    };

    console.log('📊 Repository Context:');
    console.log(`- Repository: ${context.repository}`);
    console.log(`- AI Adoption: ${context.scores.repoReadiness}/100`);
    console.log(`- Team Readiness: ${context.scores.teamReadiness}/100`);
    console.log(`- Org Readiness: ${context.scores.orgReadiness}/100`);
    console.log(`- Overall Maturity: ${context.scores.overallMaturity}/8\n`);

    const result = await engine.analyzeRepository(context);

    console.log('👥 PERSONA PERSPECTIVES:');
    console.log('========================\n');

    result.personaAnalyses.forEach((analysis, index) => {
      console.log(`${index + 1}. ${analysis.persona}`);
      console.log(`   Perspective: "${analysis.perspective}"`);
      console.log(`   Confidence: ${analysis.confidence} | Timeframe: ${analysis.timeframe}`);
      console.log(`   Insights: ${analysis.insights.length}`);
      
      // Show top insight
      if (analysis.insights.length > 0) {
        const topInsight = analysis.insights[0];
        console.log(`   Top Insight: [${topInsight.type.toUpperCase()}] ${topInsight.title}`);
        console.log(`   ${topInsight.description.substring(0, 120)}...`);
      }
      console.log('');
    });

    console.log('🔄 COMPARATIVE ANALYSIS:');
    console.log('=======================\n');

    result.comparativeInsights.forEach((insight, index) => {
      console.log(`${index + 1}. ${insight.topic}`);
      console.log(`   Consensus: ${insight.consensus.toUpperCase()}`);
      console.log(`   Explanation: ${insight.explanation}`);
      console.log(`   Personas involved: ${Object.keys(insight.personas).join(', ')}`);
      console.log('');
    });

    console.log('✅ CONSENSUS AREAS:');
    console.log('==================\n');

    if (result.consensusAreas.length > 0) {
      result.consensusAreas.forEach(area => {
        console.log(`✓ ${area}`);
      });
    } else {
      console.log('No strong consensus areas identified');
    }
    console.log('');

    console.log('⚠️  CONFLICT AREAS:');
    console.log('==================\n');

    if (result.conflictAreas.length > 0) {
      result.conflictAreas.forEach(area => {
        console.log(`⚠️ ${area}`);
      });
    } else {
      console.log('No significant conflicts identified');
    }
    console.log('');

    console.log('🎯 RECOMMENDATIONS:');
    console.log('====================\n');

    result.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.title} (${rec.priority} priority)`);
      console.log(`   Category: ${rec.category}`);
      console.log(`   Supporting: ${rec.supportingPersonas.join(', ')}`);
      if (rec.opposingPersonas.length > 0) {
        console.log(`   Opposing: ${rec.opposingPersonas.join(', ')}`);
      }
      console.log(`   ${rec.description.substring(0, 100)}...`);
      console.log('');
    });

    console.log('📈 ANALYSIS SUMMARY:');
    console.log('===================\n');

    console.log(`Total Persona Analyses: ${result.personaAnalyses.length}`);
    console.log(`Comparative Insights: ${result.comparativeInsights.length}`);
    console.log(`Consensus Areas: ${result.consensusAreas.length}`);
    console.log(`Conflict Areas: ${result.conflictAreas.length}`);
    console.log(`Recommendations: ${result.recommendations.length}`);
    console.log('');

    // Show adversarial dynamics
    const dana = result.personaAnalyses.find(a => a.persona === 'Dana Shah');
    const priya = result.personaAnalyses.find(a => a.persona === 'Priya Nair');
    
    if (dana && priya) {
      console.log('🎭 KEY ADVERSARIAL DYNAMIC:');
      console.log('=========================\n');
      console.log('Dana (Quality-focused):');
      console.log(`"${dana.perspective}"`);
      console.log('vs');
      console.log('Priya (Speed-focused):');
      console.log(`"${priya.perspective}"`);
      console.log('');
    }

    console.log('📋 GENERATING COMPREHENSIVE REPORT...');
    console.log('====================================\n');

    const report = engine.generateReport(result);
    
    // Show report preview
    const lines = report.split('\n');
    console.log('Report Preview (first 20 lines):');
    console.log('─'.repeat(50));
    lines.slice(0, 20).forEach(line => {
      console.log(line);
    });
    console.log('─'.repeat(50));
    console.log(`[Report continues with ${lines.length - 20} more lines]`);

    // Validation
    expect(result.personaAnalyses).toHaveLength(5);
    expect(result.comparativeInsights.length).toBeGreaterThan(0);
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(report).toContain('# Multi-Perspective AI Adoption Analysis');

    console.log('\n✅ Multi-Perspective Analysis Complete!');
    console.log('🚀 Ready for organizational AI adoption conversations');
  });
});
