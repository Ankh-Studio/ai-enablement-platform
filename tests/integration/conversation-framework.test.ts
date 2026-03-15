/**
 * Conversation Framework Integration Tests
 *
 * Tests the structured discussion framework tools
 */

import { ConversationFramework } from '../../src/core/conversation-framework';
import { MultiPerspectiveEngine } from '../../src/core/multi-perspective-engine';
import type { PersonaContext } from '../../src/types/persona';

describe('ConversationFramework', () => {
  let framework: ConversationFramework;
  let engine: MultiPerspectiveEngine;
  let context: PersonaContext;
  let multiPerspectiveResult: any;

  beforeEach(async () => {
    framework = new ConversationFramework();
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

    multiPerspectiveResult = await engine.analyzeRepository(context);
  });

  describe('generateConversationPrompts', () => {
    it('should generate prompts for all conflict areas', async () => {
      const prompts = framework.generateConversationPrompts(multiPerspectiveResult);
      
      expect(prompts.length).toBeGreaterThan(0);
      
      // Should have conflict resolution prompts for each conflict area
      const conflictPrompts = prompts.filter(p => p.type === 'conflict-resolution');
      expect(conflictPrompts.length).toBe(multiPerspectiveResult.conflictAreas.length);
    });

    it('should generate consensus building prompts when consensus areas exist', async () => {
      const prompts = framework.generateConversationPrompts(multiPerspectiveResult);
      
      const consensusPrompts = prompts.filter(p => p.type === 'consensus-building');
      
      if (multiPerspectiveResult.consensusAreas.length > 0) {
        expect(consensusPrompts.length).toBeGreaterThan(0);
      }
    });

    it('should always generate decision making and risk assessment prompts', async () => {
      const prompts = framework.generateConversationPrompts(multiPerspectiveResult);
      
      const decisionPrompts = prompts.filter(p => p.type === 'decision-making');
      const riskPrompts = prompts.filter(p => p.type === 'risk-assessment');
      
      expect(decisionPrompts.length).toBe(1);
      expect(riskPrompts.length).toBe(1);
    });

    it('should generate properly structured prompts', async () => {
      const prompts = framework.generateConversationPrompts(multiPerspectiveResult);
      
      prompts.forEach(prompt => {
        expect(prompt.id).toBeDefined();
        expect(prompt.title).toBeDefined();
        expect(prompt.description).toBeDefined();
        expect(['conflict-resolution', 'consensus-building', 'decision-making', 'risk-assessment']).toContain(prompt.type);
        expect(prompt.participants).toBeDefined();
        expect(prompt.questions).toBeDefined();
        expect(prompt.duration).toBeDefined();
        expect(prompt.objectives).toBeDefined();
        
        // Check questions structure
        prompt.questions.forEach(question => {
          expect(question.id).toBeDefined();
          expect(question.text).toBeDefined();
          expect(['open-ended', 'ranking', 'trade-off', 'evidence-based']).toContain(question.type);
          expect(question.participants).toBeDefined();
          expect(question.context).toBeDefined();
          expect(question.followUp).toBeDefined();
        });
      });
    });
  });

  describe('generateConversationAgenda', () => {
    it('should generate complete conversation agenda', async () => {
      const agenda = framework.generateConversationAgenda(multiPerspectiveResult);
      
      expect(agenda.title).toBeDefined();
      expect(agenda.totalDuration).toBeDefined();
      expect(agenda.sections).toBeDefined();
      expect(agenda.materials).toBeDefined();
      expect(agenda.preparation).toBeDefined();
    });

    it('should include all necessary agenda sections', async () => {
      const agenda = framework.generateConversationAgenda(multiPerspectiveResult);
      
      const sectionTypes = agenda.sections.map(s => s.type);
      
      expect(sectionTypes).toContain('introduction');
      expect(sectionTypes).toContain('perspective-sharing');
      expect(sectionTypes).toContain('analysis');
      expect(sectionTypes).toContain('decision');
      
      // Should include conflict resolution if conflicts exist
      if (multiPerspectiveResult.conflictAreas.length > 0) {
        expect(sectionTypes).toContain('discussion');
      }
    });

    it('should provide appropriate duration for each section', async () => {
      const agenda = framework.generateConversationAgenda(multiPerspectiveResult);
      
      agenda.sections.forEach(section => {
        expect(section.duration).toMatch(/^\d+.*min$/);
        expect(parseInt(section.duration)).toBeGreaterThan(0);
      });
    });

    it('should include facilitator and participant notes', async () => {
      const agenda = framework.generateConversationAgenda(multiPerspectiveResult);
      
      agenda.sections.forEach(section => {
        expect(section.facilitatorNotes).toBeDefined();
        expect(section.participantNotes).toBeDefined();
        expect(Array.isArray(section.facilitatorNotes)).toBe(true);
        expect(typeof section.participantNotes).toBe('object');
      });
    });
  });

  describe('generateConflictResolutionStrategies', () => {
    it('should generate strategies for all conflict areas', async () => {
      const strategies = framework.generateConflictResolutionStrategies(multiPerspectiveResult);
      
      expect(strategies.length).toBe(multiPerspectiveResult.conflictAreas.length);
      
      strategies.forEach((strategy, index) => {
        expect(strategy.conflict).toBe(multiPerspectiveResult.conflictAreas[index]);
        expect(strategy.personas).toBeDefined();
        expect(['compromise', 'data-driven', 'stakeholder-prioritization', 'phased-implementation']).toContain(strategy.resolutionApproach);
        expect(strategy.steps).toBeDefined();
        expect(strategy.expectedOutcome).toBeDefined();
        expect(strategy.successMetrics).toBeDefined();
      });
    });

    it('should provide appropriate resolution approaches for different conflict types', async () => {
      const strategies = framework.generateConflictResolutionStrategies(multiPerspectiveResult);
      
      strategies.forEach(strategy => {
        // Quality and Customer conflicts should use stakeholder-prioritization
        if (strategy.conflict.includes('Quality') || strategy.conflict.includes('Customer')) {
          expect(strategy.resolutionApproach).toBe('stakeholder-prioritization');
        }
        
        // Speed and Automation conflicts should use phased-implementation
        if (strategy.conflict.includes('Speed') || strategy.conflict.includes('Automation')) {
          expect(strategy.resolutionApproach).toBe('phased-implementation');
        }
        
        // Process and Team conflicts should use compromise
        if (strategy.conflict.includes('Process') || strategy.conflict.includes('Team')) {
          expect(strategy.resolutionApproach).toBe('compromise');
        }
      });
    });

    it('should include actionable steps and success metrics', async () => {
      const strategies = framework.generateConflictResolutionStrategies(multiPerspectiveResult);
      
      strategies.forEach(strategy => {
        expect(strategy.steps.length).toBeGreaterThan(0);
        expect(strategy.successMetrics.length).toBeGreaterThan(0);
        expect(strategy.expectedOutcome).toBeDefined();
        
        // Steps should be actionable
        strategy.steps.forEach(step => {
          expect(step.length).toBeGreaterThan(10); // Reasonable length
        });
        
        // Success metrics should be measurable
        strategy.successMetrics.forEach(metric => {
          expect(metric.length).toBeGreaterThan(5);
        });
      });
    });
  });

  describe('integration with multi-perspective engine', () => {
    it('should use all persona analyses in conversation planning', async () => {
      const agenda = framework.generateConversationAgenda(multiPerspectiveResult);
      const prompts = framework.generateConversationPrompts(multiPerspectiveResult);
      
      // All personas should be included in overall conversation planning
      const allPersonas = multiPerspectiveResult.personaAnalyses.map(p => p.persona);
      
      // Decision making and risk assessment prompts should include all personas
      const decisionPrompt = prompts.find(p => p.type === 'decision-making');
      const riskPrompt = prompts.find(p => p.type === 'risk-assessment');
      
      expect(decisionPrompt?.participants).toEqual(allPersonas);
      expect(riskPrompt?.participants).toEqual(allPersonas);
      
      // Participant notes should include all personas
      agenda.sections.forEach(section => {
        allPersonas.forEach(persona => {
          expect(section.participantNotes[persona]).toBeDefined();
          expect(Array.isArray(section.participantNotes[persona])).toBe(true);
        });
      });
    });

    it('should address all identified conflict areas', async () => {
      const prompts = framework.generateConversationPrompts(multiPerspectiveResult);
      const strategies = framework.generateConflictResolutionStrategies(multiPerspectiveResult);
      
      multiPerspectiveResult.conflictAreas.forEach(conflict => {
        // Should have conversation prompt for each conflict
        const conflictPrompt = prompts.find(p => 
          p.type === 'conflict-resolution' && p.title.includes(conflict)
        );
        expect(conflictPrompt).toBeDefined();
        
        // Should have resolution strategy for each conflict
        const conflictStrategy = strategies.find(s => s.conflict === conflict);
        expect(conflictStrategy).toBeDefined();
      });
    });
  });
});
