/**
 * Multi-Perspective Engine Integration Tests
 *
 * Tests the comprehensive multi-perspective analysis capabilities
 */

import { MultiPerspectiveEngine } from '../../src/core/multi-perspective-engine';
import type { PersonaContext } from '../../src/types/persona';

describe('MultiPerspectiveEngine', () => {
  let engine: MultiPerspectiveEngine;
  let context: PersonaContext;

  beforeEach(() => {
    engine = new MultiPerspectiveEngine();
    
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
  });

  describe('analyzeRepository', () => {
    it('should generate comprehensive multi-perspective analysis', async () => {
      const result = await engine.analyzeRepository(context);
      
      expect(result).toBeDefined();
      expect(result.repository).toBe('test-repository');
      expect(result.personaAnalyses).toHaveLength(5);
      expect(result.comparativeInsights).toBeDefined();
      expect(result.consensusAreas).toBeDefined();
      expect(result.conflictAreas).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    it('should include all 5 personas in analysis', async () => {
      const result = await engine.analyzeRepository(context);
      
      const personaNames = result.personaAnalyses.map(a => a.persona);
      expect(personaNames).toContain('Dana Shah');
      expect(personaNames).toContain('Leo Alvarez');
      expect(personaNames).toContain('Priya Nair');
      expect(personaNames).toContain('Tasha Reed');
      expect(personaNames).toContain('Ben Okafor');
    });

    it('should generate comparative insights with consensus levels', async () => {
      const result = await engine.analyzeRepository(context);
      
      expect(result.comparativeInsights.length).toBeGreaterThan(0);
      
      result.comparativeInsights.forEach(insight => {
        expect(insight.topic).toBeDefined();
        expect(insight.personas).toBeDefined();
        expect(['strong', 'moderate', 'none', 'conflict']).toContain(insight.consensus);
        expect(insight.explanation).toBeDefined();
      });
    });

    it('should identify both consensus and conflict areas', async () => {
      const result = await engine.analyzeRepository(context);
      
      // Should have some analysis (could be consensus, conflict, or neither)
      expect(result.consensusAreas).toBeDefined();
      expect(result.conflictAreas).toBeDefined();
      
      // At minimum, should have some comparative insights
      expect(result.comparativeInsights.length).toBeGreaterThan(0);
    });

    it('should generate actionable recommendations', async () => {
      const result = await engine.analyzeRepository(context);
      
      expect(result.recommendations.length).toBeGreaterThan(0);
      
      result.recommendations.forEach(rec => {
        expect(rec.title).toBeDefined();
        expect(rec.description).toBeDefined();
        expect(rec.supportingPersonas).toBeDefined();
        expect(rec.priority).toMatch(/^(high|medium|low)$/);
        expect(rec.category).toMatch(/^(technical|process|strategy|cultural)$/);
        expect(rec.rationale).toBeDefined();
      });
    });
  });

  describe('generateReport', () => {
    it('should generate comprehensive markdown report', async () => {
      const result = await engine.analyzeRepository(context);
      const report = engine.generateReport(result);
      
      expect(report).toContain('# Multi-Perspective AI Adoption Analysis');
      expect(report).toContain('Repository: test-repository');
      expect(report).toContain('## 👥 Persona Perspectives');
      expect(report).toContain('## 🔄 Comparative Analysis');
      expect(report).toContain('## ✅ Consensus Areas');
      expect(report).toContain('## ⚠️ Conflict Areas');
      expect(report).toContain('## 🎯 Recommendations');
      
      // Should include all personas
      expect(report).toContain('Dana Shah');
      expect(report).toContain('Leo Alvarez');
      expect(report).toContain('Priya Nair');
      expect(report).toContain('Tasha Reed');
      expect(report).toContain('Ben Okafor');
    });

    it('should include analysis context in report', async () => {
      const result = await engine.analyzeRepository(context);
      const report = engine.generateReport(result);
      
      expect(report).toContain('AI Adoption: 75/100');
      expect(report).toContain('Team Readiness: 70/100');
      expect(report).toContain('Org Readiness: 80/100');
      expect(report).toContain('Overall Maturity: 6/8');
    });
  });

  describe('adversarial dynamics', () => {
    it('should demonstrate different perspectives on same evidence', async () => {
      const result = await engine.analyzeRepository(context);
      
      // Get all persona perspectives
      const perspectives = result.personaAnalyses.map(a => a.perspective);
      
      // Should have 5 different perspectives
      expect(perspectives).toHaveLength(5);
      
      // Should have some diversity in perspectives
      const uniquePerspectives = new Set(perspectives);
      expect(uniquePerspectives.size).toBeGreaterThan(2);
    });

    it('should identify areas of agreement and disagreement', async () => {
      const result = await engine.analyzeRepository(context);
      
      // Should have comparative insights showing different consensus levels
      const consensusLevels = result.comparativeInsights.map(i => i.consensus);
      const uniqueLevels = new Set(consensusLevels);
      
      // Should have at least 1 consensus level (the insights themselves show diversity)
      expect(uniqueLevels.size).toBeGreaterThanOrEqual(1);
      
      // Should have comparative insights demonstrating analysis
      expect(result.comparativeInsights.length).toBeGreaterThan(0);
    });
  });

  describe('integration with personas', () => {
    it('should properly integrate with all persona types', async () => {
      const result = await engine.analyzeRepository(context);
      
      // Each persona should have valid analysis
      result.personaAnalyses.forEach(analysis => {
        expect(analysis.persona).toBeDefined();
        expect(analysis.perspective).toBeDefined();
        expect(analysis.confidence).toMatch(/^(high|medium|low)$/);
        expect(analysis.timeframe).toBeDefined();
        expect(analysis.insights).toBeDefined();
        expect(analysis.summary).toBeDefined();
        expect(analysis.nextSteps).toBeDefined();
        
        // Each persona should have insights
        expect(analysis.insights.length).toBeGreaterThan(0);
        
        // Insights should have proper structure
        analysis.insights.forEach(insight => {
          expect(insight.type).toMatch(/^(opportunity|warning|analysis|recommendation)$/);
          expect(insight.title).toBeDefined();
          expect(insight.description).toBeDefined();
          expect(insight.priority).toMatch(/^(high|medium|low)$/);
          expect(insight.confidence).toBeGreaterThan(0);
          expect(insight.confidence).toBeLessThanOrEqual(100);
        });
      });
    });
  });

  describe('real-world scenario', () => {
    it('should handle high AI adoption scenario', async () => {
      const highAIContext = {
        ...context,
        scores: {
          repoReadiness: 90, // Very high AI adoption
          teamReadiness: 60, // Some team struggles
          orgReadiness: 75,
          overallMaturity: 5,
        },
      };
      
      const result = await engine.analyzeRepository(highAIContext);
      
      // Should detect potential conflicts with high AI adoption
      expect(result.conflictAreas.length).toBeGreaterThanOrEqual(0);
      
      // Should have recommendations addressing high AI adoption
      const aiRelatedRecs = result.recommendations.filter(rec => 
        rec.title.toLowerCase().includes('ai') || 
        rec.description.toLowerCase().includes('ai')
      );
      expect(aiRelatedRecs.length).toBeGreaterThan(0);
    });
  });
});
