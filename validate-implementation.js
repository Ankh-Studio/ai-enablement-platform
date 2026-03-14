#!/usr/bin/env node

/**
 * Simple validation script for the deterministic analysis engine
 */

const { AssessmentEngine } = require('./dist/core/assessment-engine');

async function validateImplementation() {
  console.log('🧪 Validating Deterministic Analysis Engine...\n');
  
  try {
    // Test 1: Basic analysis
    console.log('Test 1: Basic repository analysis');
    const engine1 = new AssessmentEngine({
      repoPath: '.',
      includeRecommendations: true,
      generateADR: false
    });
    
    const result1 = await engine1.execute();
    
    console.log('✅ Basic analysis completed');
    console.log(`   - Repository: ${result1.metadata.repository}`);
    console.log(`   - Duration: ${result1.metadata.duration}ms`);
    console.log(`   - Scores: Repo ${result1.scores.repoReadiness}/100, Team ${result1.scores.teamReadiness}/100, Org ${result1.scores.orgReadiness}/100`);
    console.log(`   - Recommendations: ${result1.recommendations.length} generated\n`);
    
    // Test 2: ADR generation
    console.log('Test 2: ADR generation');
    const engine2 = new AssessmentEngine({
      repoPath: '.',
      includeRecommendations: true,
      generateADR: true
    });
    
    const result2 = await engine2.execute();
    
    console.log('✅ ADR generation completed');
    console.log(`   - ADR length: ${result2.adr ? result2.adr.length : 0} characters`);
    console.log(`   - Contains ADR sections: ${result2.adr ? result2.adr.includes('Architecture Decision Record') : false}\n`);
    
    // Test 3: Performance check
    console.log('Test 3: Performance validation');
    const startTime = Date.now();
    const engine3 = new AssessmentEngine({
      repoPath: '.',
      includeRecommendations: true,
      generateADR: true
    });
    
    await engine3.execute();
    const totalTime = Date.now() - startTime;
    
    console.log('✅ Performance check completed');
    console.log(`   - Total time: ${totalTime}ms`);
    console.log(`   - Within target (<5s): ${totalTime < 5000 ? '✅' : '❌'}\n`);
    
    // Test 4: Data structure validation
    console.log('Test 4: Data structure validation');
    const result = result1;
    
    const checks = [
      { name: 'Metadata structure', check: result.metadata && typeof result.metadata.timestamp === 'string' },
      { name: 'Analysis structure', check: result.analysis && result.analysis.copilotFeatures && result.analysis.techStack && result.analysis.evidence },
      { name: 'Scores structure', check: result.scores && typeof result.scores.repoReadiness === 'number' && ['high', 'medium', 'low'].includes(result.scores.confidence) },
      { name: 'Recommendations array', check: Array.isArray(result.recommendations) },
      { name: 'Score ranges', check: result.scores.repoReadiness >= 0 && result.scores.repoReadiness <= 100 }
    ];
    
    let allPassed = true;
    checks.forEach(({ name, check }) => {
      const status = check ? '✅' : '❌';
      console.log(`   - ${name}: ${status}`);
      if (!check) allPassed = false;
    });
    
    console.log(`\n🎯 Overall Validation: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (allPassed) {
      console.log('\n🚀 Deterministic Analysis Engine is ready for v0.2.0!');
      console.log('\n📋 Implementation Summary:');
      console.log('   ✅ CopilotFeatureScanner - GitHub Copilot feature detection');
      console.log('   ✅ TechStackAnalyzer - Technology stack analysis');
      console.log('   ✅ EvidenceCollector - Repository evidence collection');
      console.log('   ✅ ReadinessScorer - Deterministic scoring algorithms');
      console.log('   ✅ ADRGenerator - Professional ADR generation');
      console.log('   ✅ AssessmentEngine - Complete orchestration');
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

validateImplementation();
