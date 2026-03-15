/**
 * Tasha Reed Persona Tests
 *
 * Tests for the research-backed process-concerned scrum master persona
 */

import { TashaReedPersona } from '../../src/personas/tasha-reed-persona';
import type { PersonaContext } from '../../src/types/persona';

describe('TashaReedPersona', () => {
  let persona: TashaReedPersona;
  let mockContext: PersonaContext;

  beforeEach(() => {
    persona = new TashaReedPersona();
    
    mockContext = {
      repository: 'team-focused-repo',
      assessmentResults: {
        techStack: { languages: ['TypeScript', 'Python'], frameworks: ['React', 'FastAPI'] },
        codebaseMetrics: { totalFiles: 150, totalLines: 15000 },
        securityFeatures: { authentication: true, encryption: false },
        collaborationMetrics: { contributors: 6, commits: 600 },
        deploymentMetrics: { frequency: 'weekly', successRate: 0.88 },
      },
      scores: {
        repoReadiness: 65, // Moderate AI adoption
        teamReadiness: 45, // Team struggling
        orgReadiness: 55,
        overallMaturity: 4, // Process issues
      },
      recommendations: [
        { id: '1', title: 'Test Rec', description: 'Test', priority: 'medium', category: 'foundation' }
      ],
      targetAudience: 'team',
    };
  });

  describe('generateInsights', () => {
    it('should generate process breakdown warning when team friction and velocity volatility', async () => {
      const insights = await persona.generateInsights(mockContext);
      
      const processWarning = insights.find(
        insight => insight.title === 'Team Process Breakdown Risk' && insight.type === 'warning'
      );
      
      expect(processWarning).toBeDefined();
      expect(processWarning?.priority).toBe('high');
      expect(processWarning?.confidence).toBeGreaterThan(80);
      expect(processWarning?.description).toContain('team dynamics');
    });

    it('should focus on psychological safety when team readiness low', async () => {
      const insights = await persona.generateInsights(mockContext);
      
      const safetyInsight = insights.find(
        insight => insight.title === 'Psychological Safety Assessment'
      );
      
      expect(safetyInsight).toBeDefined();
      expect(safetyInsight?.type).toBe('analysis');
      expect(safetyInsight?.description).toContain('psychological safety');
    });

    it('should recommend sustainable AI integration process', async () => {
      const insights = await persona.generateInsights(mockContext);
      
      const processRec = insights.find(
        insight => insight.title === 'Sustainable AI Integration Process'
      );
      
      expect(processRec).toBeDefined();
      expect(processRec?.type).toBe('recommendation');
      expect(processRec?.category).toBe('strategy');
    });

    it('should warn about knowledge silos when org readiness low', async () => {
      const insights = await persona.generateInsights(mockContext);
      
      const siloWarning = insights.find(
        insight => insight.title === 'Knowledge Silo Risk'
      );
      
      expect(siloWarning).toBeDefined();
      expect(siloWarning?.type).toBe('warning');
      expect(siloWarning?.description).toContain('knowledge silos');
    });

    it('should see opportunity for enhanced team collaboration', async () => {
      const insights = await persona.generateInsights(mockContext);
      
      const collabOpportunity = insights.find(
        insight => insight.title === 'Enhanced Team Collaboration'
      );
      
      expect(collabOpportunity).toBeDefined();
      expect(collabOpportunity?.type).toBe('opportunity');
      expect(collabOpportunity?.description).toContain('team collaboration');
    });
  });

  describe('generatePrompt', () => {
    it('should generate prompt with Tasha Reed perspective', () => {
      const prompt = persona.generatePrompt(mockContext);
      
      expect(prompt).toContain('Tasha Reed');
      expect(prompt).toContain('Is this helping us work together better, or just creating new coordination problems?');
      expect(prompt).toContain('team dynamics');
      expect(prompt).toContain('psychological safety');
    });
  });

  describe('persona characteristics', () => {
    it('should have correct persona configuration', () => {
      expect(persona.type).toBe('tasha-reed');
      expect(persona.config.name).toBe('Tasha Reed');
      expect(persona.config.focus).toContain('team-dynamics');
      expect(persona.config.focus).toContain('process-stability');
    });

    it('should generate sustainable timeframes', () => {
      // Create insights with process focus
      const processInsights = [
        {
          id: '1',
          type: 'recommendation' as const,
          title: 'Process Recommendation',
          description: 'Test',
          evidence: ['test'],
          confidence: 80,
          priority: 'medium' as const,
          category: 'strategy' as const,
        },
        {
          id: '2',
          type: 'recommendation' as const,
          title: 'Another Process',
          description: 'Test',
          evidence: ['test'],
          confidence: 80,
          priority: 'medium' as const,
          category: 'cultural' as const,
        },
        {
          id: '3',
          type: 'recommendation' as const,
          title: 'Third Process',
          description: 'Test',
          evidence: ['test'],
          confidence: 80,
          priority: 'medium' as const,
          category: 'strategy' as const,
        }
      ];
      
      const timeframe = persona['estimateTimeframe'](processInsights);
      expect(timeframe).toContain('3-4 weeks'); // Sustainable timeframe
    });
  });

  describe('trigger condition evaluation', () => {
    it('should correctly evaluate team friction trigger', () => {
      const context = {
        ...mockContext,
        scores: { ...mockContext.scores, teamReadiness: 45 }
      };
      
      const result = persona['evaluateTriggerCondition']('team_friction_increasing', context);
      expect(result).toBe(true);
    });

    it('should correctly evaluate velocity volatility trigger', () => {
      const context = {
        ...mockContext,
        scores: { ...mockContext.scores, overallMaturity: 4 }
      };
      
      const result = persona['evaluateTriggerCondition']('velocity_volatility', context);
      expect(result).toBe(true);
    });
  });
});
