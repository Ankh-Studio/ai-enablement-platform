/**
 * Ben Okafor Persona Tests
 *
 * Tests for the research-backed stakeholder-focused product owner persona
 */

import { BenOkaforPersona } from '../../src/personas/ben-okafor-persona';
import type { PersonaContext } from '../../src/types/persona';

describe('BenOkaforPersona', () => {
  let persona: BenOkaforPersona;
  let mockContext: PersonaContext;

  beforeEach(() => {
    persona = new BenOkaforPersona();
    
    mockContext = {
      repository: 'customer-focused-repo',
      assessmentResults: {
        techStack: { languages: ['TypeScript', 'Python'], frameworks: ['React', 'FastAPI'] },
        codebaseMetrics: { totalFiles: 180, totalLines: 18000 },
        securityFeatures: { authentication: true, encryption: false },
        collaborationMetrics: { contributors: 7, commits: 700 },
        deploymentMetrics: { frequency: 'weekly', successRate: 0.85 },
      },
      scores: {
        repoReadiness: 55, // Moderate AI adoption with quality concerns
        teamReadiness: 45, // Team struggling
        orgReadiness: 50, // Organization struggling
        overallMaturity: 4, // Quality issues
      },
      recommendations: [
        { id: '1', title: 'Test Rec', description: 'Test', priority: 'medium', category: 'foundation' }
      ],
      targetAudience: 'organization',
    };
  });

  describe('generateInsights', () => {
    it('should generate customer value risk warning when quality declining and stakeholder pressure', async () => {
      const insights = await persona.generateInsights(mockContext);
      
      const valueRiskWarning = insights.find(
        insight => insight.title === 'Customer Value Delivery Risk' && insight.type === 'warning'
      );
      
      expect(valueRiskWarning).toBeDefined();
      expect(valueRiskWarning?.priority).toBe('high');
      expect(valueRiskWarning?.confidence).toBeGreaterThan(85);
      expect(valueRiskWarning?.description).toContain('value we deliver');
    });

    it('should focus on market position when org readiness low', async () => {
      const insights = await persona.generateInsights(mockContext);
      
      const marketAssessment = insights.find(
        insight => insight.title === 'Market Position Assessment'
      );
      
      expect(marketAssessment).toBeDefined();
      expect(marketAssessment?.type).toBe('analysis');
      expect(marketAssessment?.description).toContain('competitive position');
    });

    it('should recommend AI quality framework', async () => {
      const insights = await persona.generateInsights(mockContext);
      
      const qualityFramework = insights.find(
        insight => insight.title === 'AI Quality Framework'
      );
      
      expect(qualityFramework).toBeDefined();
      expect(qualityFramework?.type).toBe('recommendation');
      expect(qualityFramework?.category).toBe('technical');
      expect(qualityFramework?.description).toContain('quality framework');
    });

    it('should see opportunity for enhanced customer experience', async () => {
      const insights = await persona.generateInsights(mockContext);
      
      const customerOpportunity = insights.find(
        insight => insight.title === 'Enhanced Customer Experience'
      );
      
      expect(customerOpportunity).toBeDefined();
      expect(customerOpportunity?.type).toBe('opportunity');
      expect(customerOpportunity?.description).toContain('customer experience');
    });

    it('should warn about stakeholder communication gap when team readiness low', async () => {
      const insights = await persona.generateInsights(mockContext);
      
      const communicationWarning = insights.find(
        insight => insight.title === 'Stakeholder Communication Gap'
      );
      
      expect(communicationWarning).toBeDefined();
      expect(communicationWarning?.type).toBe('warning');
      expect(communicationWarning?.description).toContain('Stakeholders need');
    });
  });

  describe('generatePrompt', () => {
    it('should generate prompt with Ben Okafor perspective', () => {
      const prompt = persona.generatePrompt(mockContext);
      
      expect(prompt).toContain('Ben Okafor');
      expect(prompt).toContain('How does this affect our customers and our competitive position?');
      expect(prompt).toContain('customer value');
      expect(prompt).toContain('market competitiveness');
    });
  });

  describe('persona characteristics', () => {
    it('should have correct persona configuration', () => {
      expect(persona.type).toBe('ben-okafor');
      expect(persona.config.name).toBe('Ben Okafor');
      expect(persona.config.focus).toContain('customer-value');
      expect(persona.config.focus).toContain('market-competitiveness');
    });

    it('should generate business-focused timeframes', () => {
      // Create insights with business focus
      const businessInsights = [
        {
          id: '1',
          type: 'recommendation' as const,
          title: 'Business Recommendation',
          description: 'Test',
          evidence: ['test'],
          confidence: 85,
          priority: 'high' as const,
          category: 'strategy' as const,
        },
        {
          id: '2',
          type: 'recommendation' as const,
          title: 'Another Business',
          description: 'Test',
          evidence: ['test'],
          confidence: 85,
          priority: 'high' as const,
          category: 'risk' as const,
        },
        {
          id: '3',
          type: 'recommendation' as const,
          title: 'Third Business',
          description: 'Test',
          evidence: ['test'],
          confidence: 85,
          priority: 'high' as const,
          category: 'strategy' as const,
        }
      ];
      
      const timeframe = persona['estimateTimeframe'](businessInsights);
      expect(timeframe).toContain('2-3 weeks'); // Business-focused timeframe
    });
  });

  describe('trigger condition evaluation', () => {
    it('should correctly evaluate quality declining trigger', () => {
      const context = {
        ...mockContext,
        scores: { ...mockContext.scores, overallMaturity: 4 }
      };
      
      const result = persona['evaluateTriggerCondition']('quality_declining', context);
      expect(result).toBe(true);
    });

    it('should correctly evaluate stakeholder pressure trigger', () => {
      const context = {
        ...mockContext,
        scores: { ...mockContext.scores, orgReadiness: 50 }
      };
      
      const result = persona['evaluateTriggerCondition']('stakeholder_pressure_rising', context);
      expect(result).toBe(true);
    });
  });
});
