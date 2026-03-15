/**
 * Dana Shah Persona Tests
 *
 * Tests for the research-backed adversarial persona implementation
 */

import { DanaShahPersona } from '../../src/personas/dana-shah-persona';
import type { PersonaContext } from '../../src/types/persona';

describe('DanaShahPersona', () => {
  let persona: DanaShahPersona;
  let mockContext: PersonaContext;

  beforeEach(() => {
    persona = new DanaShahPersona();
    
    mockContext = {
      repository: 'test-repo',
      assessmentResults: {
        repository: 'test-repo',
        techStack: { languages: ['TypeScript'], frameworks: ['React'] },
        codebaseMetrics: { totalFiles: 100, totalLines: 10000 },
        securityFeatures: { authentication: true, encryption: false },
        collaborationMetrics: { contributors: 5, commits: 500 },
        deploymentMetrics: { frequency: 'weekly', successRate: 0.95 },
      },
      scores: {
        repoReadiness: 75, // High AI adoption
        teamReadiness: 55, // Team readiness issues
        orgReadiness: 60,
        overallMaturity: 4, // Low maturity suggests large PRs
      },
      recommendations: [
        { id: '1', title: 'Test Rec', description: 'Test', priority: 'medium', category: 'process' }
      ],
      targetAudience: 'team',
    };
  });

  describe('generateInsights', () => {
    it('should generate speed hiding debt warning when AI PR volume high and review turnaround low', async () => {
      const insights = await persona.generateInsights(mockContext);
      
      const speedHidingDebtWarning = insights.find(
        insight => insight.title === 'Speed Hiding Debt' && insight.type === 'warning'
      );
      
      expect(speedHidingDebtWarning).toBeDefined();
      expect(speedHidingDebtWarning?.priority).toBe('critical');
      expect(speedHidingDebtWarning?.confidence).toBeGreaterThan(90);
      expect(speedHidingDebtWarning?.description).toContain('hidden technical debt');
    });

    it('should generate architecture drift risk for large PRs and instability', async () => {
      const insights = await persona.generateInsights(mockContext);
      
      const architectureRisk = insights.find(
        insight => insight.title === 'Architecture Drift Risk'
      );
      
      expect(architectureRisk).toBeDefined();
      expect(architectureRisk?.category).toBe('technical');
      expect(architectureRisk?.description).toContain('architectural coherence');
    });

    it('should prioritize quality over speed in recommendations', async () => {
      const insights = await persona.generateInsights(mockContext);
      
      const qualityInsights = insights.filter(
        insight => insight.category === 'risk' || insight.category === 'technical'
      );
      
      expect(qualityInsights.length).toBeGreaterThan(0);
      
      // Check that confidence thresholds are higher than default (Dana is cautious)
      const avgConfidence = insights.reduce((sum, insight) => sum + insight.confidence, 0) / insights.length;
      expect(avgConfidence).toBeGreaterThan(80);
    });

    it('should show concern for junior developer mentorship', async () => {
      const insights = await persona.generateInsights(mockContext);
      
      const mentorshipInsight = insights.find(
        insight => insight.title === 'Junior Developer Guardrails'
      );
      
      expect(mentorshipInsight).toBeDefined();
      expect(mentorshipInsight?.category).toBe('cultural');
      expect(mentorshipInsight?.description).toContain('junior developers');
    });
  });

  describe('generatePrompt', () => {
    it('should generate prompt with Dana Shah perspective', () => {
      const prompt = persona.generatePrompt(mockContext);
      
      expect(prompt).toContain('Dana Shah');
      expect(prompt).toContain("I don't care if it's fast if it leaves mush behind");
      expect(prompt).toContain('maintainability and architectural');
      expect(prompt).toContain('reviewer burden');
    });
  });

  describe('persona characteristics', () => {
    it('should have correct persona configuration', () => {
      expect(persona.type).toBe('dana-shah');
      expect(persona.config.name).toBe('Dana Shah');
      expect(persona.config.focus).toContain('maintainability');
      expect(persona.config.focus).toContain('code-quality');
    });

    it('should generate conservative timeframes', () => {
      // Create insights with critical priority
      const criticalInsights = [
        {
          id: '1',
          type: 'warning' as const,
          title: 'Critical Issue',
          description: 'Test',
          evidence: ['test'],
          confidence: 90,
          priority: 'critical' as const,
          category: 'risk' as const,
        }
      ];
      
      const timeframe = persona['estimateTimeframe'](criticalInsights);
      expect(timeframe).toContain('4-6 weeks'); // More conservative than default
    });
  });

  describe('trigger condition evaluation', () => {
    it('should correctly evaluate AI PR volume rising trigger', () => {
      const context = {
        ...mockContext,
        scores: { ...mockContext.scores, repoReadiness: 80 }
      };
      
      const result = persona['evaluateTriggerCondition']('ai_pr_volume_rising', context);
      expect(result).toBe(true);
    });

    it('should correctly evaluate team readiness triggers', () => {
      const context = {
        ...mockContext,
        scores: { ...mockContext.scores, teamReadiness: 50 }
      };
      
      const result = persona['evaluateTriggerCondition']('review_turnaround_decreasing', context);
      expect(result).toBe(true);
    });
  });
});
