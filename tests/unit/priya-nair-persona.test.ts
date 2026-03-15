/**
 * Priya Nair Persona Tests
 *
 * Tests for the research-backed misguided power user persona
 */

import { PriyaNairPersona } from '../../src/personas/priya-nair-persona';
import type { PersonaContext } from '../../src/types/persona';

describe('PriyaNairPersona', () => {
  let persona: PriyaNairPersona;
  let mockContext: PersonaContext;

  beforeEach(() => {
    persona = new PriyaNairPersona();
    
    mockContext = {
      repository: 'automation-focused-repo',
      assessmentResults: {
        techStack: { languages: ['TypeScript', 'Python'], frameworks: ['React', 'FastAPI'] },
        codebaseMetrics: { totalFiles: 200, totalLines: 20000 },
        securityFeatures: { authentication: true, encryption: false },
        collaborationMetrics: { contributors: 8, commits: 800 },
        deploymentMetrics: { frequency: 'daily', successRate: 0.92 },
      },
      scores: {
        repoReadiness: 90, // Very high AI adoption
        teamReadiness: 45, // Some team struggles
        orgReadiness: 70,
        overallMaturity: 4, // Some quality issues
      },
      recommendations: [
        { id: '1', title: 'Test Rec', description: 'Test', priority: 'medium', category: 'foundation' }
      ],
      targetAudience: 'team',
    };
  });

  describe('generateInsights', () => {
    it('should generate AI optimization opportunity when acceptance high and PRs large', async () => {
      const insights = await persona.generateInsights(mockContext);
      
      const optimizationOpportunity = insights.find(
        insight => insight.title === 'AI Optimization Opportunity' && insight.type === 'analysis'
      );
      
      expect(optimizationOpportunity).toBeDefined();
      expect(optimizationOpportunity?.priority).toBe('high');
      expect(optimizationOpportunity?.confidence).toBeGreaterThan(85);
      expect(optimizationOpportunity?.description).toContain('dramatically increase output');
    });

    it('should focus on automation and productivity', async () => {
      const insights = await persona.generateInsights(mockContext);
      
      const automationInsight = insights.find(
        insight => insight.title === 'Workflow Automation Potential'
      );
      
      expect(automationInsight).toBeDefined();
      expect(automationInsight?.type).toBe('opportunity');
      expect(automationInsight?.description).toContain('automation');
    });

    it('should recommend advanced tooling when repo readiness is high', async () => {
      const insights = await persona.generateInsights(mockContext);
      
      const toolingInsight = insights.find(
        insight => insight.title === 'Advanced AI Tooling Strategy'
      );
      
      expect(toolingInsight).toBeDefined();
      expect(toolingInsight?.category).toBe('technical');
      expect(toolingInsight?.description).toContain('custom AI tooling');
    });

    it('should show calibration concerns when quality issues present', async () => {
      const insights = await persona.generateInsights(mockContext);
      
      const calibrationWarning = insights.find(
        insight => insight.title === 'Optimization Calibration Needed'
      );
      
      expect(calibrationWarning).toBeDefined();
      expect(calibrationWarning?.type).toBe('warning');
      expect(calibrationWarning?.description).toContain('calibrate');
    });

    it('should have high confidence due to trust and novelty bias', async () => {
      const insights = await persona.generateInsights(mockContext);
      
      // Priya should have high confidence due to trust_default=0.82
      const avgConfidence = insights.reduce((sum, insight) => sum + insight.confidence, 0) / insights.length;
      expect(avgConfidence).toBeGreaterThan(80);
    });
  });

  describe('generatePrompt', () => {
    it('should generate prompt with Priya Nair perspective', () => {
      const prompt = persona.generatePrompt(mockContext);
      
      expect(prompt).toContain('Priya Nair');
      expect(prompt).toContain('If the model can do 80%, I should push it to 100%');
      expect(prompt).toContain('Automation opportunities');
      expect(prompt).toContain('productivity gains');
    });
  });

  describe('persona characteristics', () => {
    it('should have correct persona configuration', () => {
      expect(persona.type).toBe('priya-nair');
      expect(persona.config.name).toBe('Priya Nair');
      expect(persona.config.focus).toContain('automation');
      expect(persona.config.focus).toContain('productivity');
    });

    it('should generate aggressive timeframes', () => {
      // Create insights with automation opportunities
      const automationInsights = [
        {
          id: '1',
          type: 'opportunity' as const,
          title: 'Automation Opportunity',
          description: 'Test',
          evidence: ['test'],
          confidence: 90,
          priority: 'high' as const,
          category: 'technical' as const,
        },
        {
          id: '2',
          type: 'opportunity' as const,
          title: 'Another Automation',
          description: 'Test',
          evidence: ['test'],
          confidence: 90,
          priority: 'high' as const,
          category: 'technical' as const,
        },
        {
          id: '3',
          type: 'opportunity' as const,
          title: 'Third Automation',
          description: 'Test',
          evidence: ['test'],
          confidence: 90,
          priority: 'high' as const,
          category: 'technical' as const,
        }
      ];
      
      const timeframe = persona['estimateTimeframe'](automationInsights);
      expect(timeframe).toContain('1-2 weeks'); // Very aggressive timeline
    });
  });

  describe('trigger condition evaluation', () => {
    it('should correctly evaluate very high AI acceptance trigger', () => {
      const context = {
        ...mockContext,
        scores: { ...mockContext.scores, repoReadiness: 90 }
      };
      
      const result = persona['evaluateTriggerCondition']('very_high_ai_acceptance', context);
      expect(result).toBe(true);
    });

    it('should correctly evaluate large PRs trigger', () => {
      const context = {
        ...mockContext,
        scores: { ...mockContext.scores, overallMaturity: 4 }
      };
      
      const result = persona['evaluateTriggerCondition']('large_prs_increasing', context);
      expect(result).toBe(true);
    });
  });
});
