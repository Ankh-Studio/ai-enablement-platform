/**
 * Research-Backed Persona Validation Scenarios
 *
 * Manual validation scenarios that demonstrate the adversarial review capabilities
 * of research-backed personas for organizational AI adoption conversations
 */

import { DanaShahPersona } from '../../src/personas/dana-shah-persona';
import type { PersonaContext } from '../../src/types/persona';

describe('Research-Backed Validation Scenarios', () => {
  describe('Scenario 1: High AI Adoption, Low Quality', () => {
    let persona: DanaShahPersona;
    let context: PersonaContext;

    beforeEach(() => {
      persona = new DanaShahPersona();

      // Scenario: Team using AI heavily but quality declining
      context = {
        repository: 'fast-growing-startup',
        assessmentResults: {
          techStack: {
            languages: ['TypeScript', 'Python'],
            frameworks: ['React', 'FastAPI'],
          },
          codebaseMetrics: { totalFiles: 500, totalLines: 50000 },
          securityFeatures: { authentication: true, encryption: false },
          collaborationMetrics: { contributors: 12, commits: 2000 },
          deploymentMetrics: { frequency: 'daily', successRate: 0.85 }, // Declining success rate
        },
        scores: {
          repoReadiness: 85, // High AI adoption
          teamReadiness: 45, // Team struggling with quality
          orgReadiness: 70,
          overallMaturity: 3, // Low maturity despite AI usage
        },
        recommendations: [
          {
            id: '1',
            title: 'Improve testing',
            description: 'Add more tests',
            priority: 'high',
            category: 'foundation',
          },
          {
            id: '2',
            title: 'Code review guidelines',
            description: 'Better review process',
            priority: 'critical',
            category: 'governance',
          },
        ],
        targetAudience: 'team',
      };
    });

    it('should identify speed hiding debt pattern', async () => {
      const insights = await persona.generateInsights(context);

      const criticalWarnings = insights.filter(
        (i) => i.type === 'warning' && i.priority === 'critical',
      );
      expect(criticalWarnings.length).toBeGreaterThan(0);

      const speedHidingDebt = criticalWarnings.find((i) =>
        i.title.includes('Speed Hiding Debt'),
      );
      expect(speedHidingDebt).toBeDefined();
      expect(speedHidingDebt?.description).toContain('hidden technical debt');
    });

    it('should prioritize quality over productivity metrics', async () => {
      const insights = await persona.generateInsights(context);
      const response = await persona.analyze(context);

      expect(response.summary).toContain('quality');
      expect(response.summary).toContain('maintainability');
      expect(response.timeframe).toContain('weeks'); // Conservative timeline
    });

    it('should recommend guardrails rather than expansion', async () => {
      const insights = await persona.generateInsights(context);

      const guardrailRecs = insights.filter(
        (i) =>
          i.type === 'recommendation' && i.description.includes('guardrails'),
      );

      expect(guardrailRecs.length).toBeGreaterThan(0);
    });
  });

  describe('Scenario 2: Mature Team, Naive AI Adoption', () => {
    let persona: DanaShahPersona;
    let context: PersonaContext;

    beforeEach(() => {
      persona = new DanaShahPersona();

      // Scenario: Experienced team adopting AI without proper governance
      context = {
        repository: 'enterprise-platform',
        assessmentResults: {
          techStack: {
            languages: ['Java', 'TypeScript'],
            frameworks: ['Spring Boot', 'Angular'],
          },
          codebaseMetrics: { totalFiles: 2000, totalLines: 200000 },
          securityFeatures: { authentication: true, encryption: true },
          collaborationMetrics: { contributors: 25, commits: 5000 },
          deploymentMetrics: { frequency: 'weekly', successRate: 0.98 },
        },
        scores: {
          repoReadiness: 65, // Moderate AI adoption
          teamReadiness: 85, // Strong team
          orgReadiness: 60, // Organization lagging
          overallMaturity: 7, // High maturity
        },
        recommendations: [
          {
            id: '1',
            title: 'AI governance',
            description: 'Create AI policies',
            priority: 'high',
            category: 'governance',
          },
        ],
        targetAudience: 'organization',
      };
    });

    it('should focus on governance and process', async () => {
      const insights = await persona.generateInsights(context);

      const processInsights = insights.filter(
        (i) => i.category === 'process' || i.category === 'cultural',
      );
      expect(processInsights.length).toBeGreaterThan(0);

      const response = await persona.analyze(context);
      expect(response.summary).toContain('standards');
    });

    it('should recommend measured approach despite team capability', async () => {
      const insights = await persona.generateInsights(context);

      // Dana Shah always generates insights - check that we get any insights for mature teams
      expect(insights.length).toBeGreaterThan(0);

      // For mature teams, Dana focuses on review process and sustainability
      const reviewInsights = insights.filter(
        (i) =>
          i.description.includes('review') || i.description.includes('process'),
      );
      expect(reviewInsights.length).toBeGreaterThan(0);
    });
  });

  describe('Scenario 3: "One Signal, Five Interpretations" Demo', () => {
    it('should demonstrate Dana Shah interpretation of ambiguous metrics', async () => {
      const persona = new DanaShahPersona();

      // Signal: "AI-assisted code share increased, cycle time dropped 12%, review time rose 18%, post-merge rework ticked up"
      const context: PersonaContext = {
        repository: 'ambiguous-case',
        assessmentResults: {
          techStack: { languages: ['JavaScript'], frameworks: ['React'] },
          codebaseMetrics: { totalFiles: 100, totalLines: 10000 },
          securityFeatures: { authentication: false, encryption: false },
          collaborationMetrics: { contributors: 8, commits: 800 },
          deploymentMetrics: { frequency: 'twice-weekly', successRate: 0.92 },
        },
        scores: {
          repoReadiness: 75, // AI adoption up
          teamReadiness: 55, // Review time up (team struggling)
          orgReadiness: 65,
          overallMaturity: 5, // Rework up (quality issues)
        },
        recommendations: [],
        targetAudience: 'team',
      };

      const response = await persona.analyze(context);

      // Dana Shah's interpretation: "Hidden debt and reviewer pain"
      expect(response.summary).toContain('burden');
      expect(response.summary).toContain('quality');

      const insights = await persona.generateInsights(context);
      const reviewerBurdenInsights = insights.filter(
        (i) =>
          i.description.includes('review') || i.description.includes('burden'),
      );

      expect(reviewerBurdenInsights.length).toBeGreaterThan(0);
    });
  });

  describe('Manual Validation Checklist', () => {
    it('should provide evidence for manual team review', async () => {
      const persona = new DanaShahPersona();
      const context = {
        repository: 'validation-test',
        assessmentResults: {
          techStack: { languages: ['TypeScript'], frameworks: ['React'] },
          codebaseMetrics: { totalFiles: 200, totalLines: 20000 },
          securityFeatures: { authentication: true, encryption: false },
          collaborationMetrics: { contributors: 6, commits: 600 },
          deploymentMetrics: { frequency: 'weekly', successRate: 0.9 },
        },
        scores: {
          repoReadiness: 70,
          teamReadiness: 60,
          orgReadiness: 65,
          overallMaturity: 5,
        },
        recommendations: [],
        targetAudience: 'team',
      };

      const response = await persona.analyze(context);

      // Manual validation checklist items
      const validationEvidence = {
        personaRecognizable: response.perspective.includes(
          "I don't care if it's fast",
        ),
        insightsEvidenceBased: response.insights.every(
          (i) => i.evidence.length > 0,
        ),
        confidenceAppropriate:
          response.confidence === 'medium' || response.confidence === 'high',
        recommendationsActionable: response.nextSteps.length > 0,
        timeframeRealistic:
          response.timeframe.includes('week') ||
          response.timeframe.includes('month'),
      };

      expect(validationEvidence.personaRecognizable).toBe(true);
      expect(validationEvidence.insightsEvidenceBased).toBe(true);
      expect(validationEvidence.confidenceAppropriate).toBe(true);
      expect(validationEvidence.recommendationsActionable).toBe(true);
      expect(validationEvidence.timeframeRealistic).toBe(true);
    });
  });
});
