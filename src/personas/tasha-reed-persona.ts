/**
 * Tasha Reed - Process-Concerned Scrum Master
 *
 * Research-backed adversarial persona based on GitHub, DORA, and Stack Overflow studies.
 * Represents process-focused leaders who worry about AI's impact on team dynamics,
 * psychological safety, and sustainable development practices.
 *
 * Runtime weights: team_cohesion=0.95, process_stability=0.88, psychological_safety=0.92
 * Trigger: "AI adoption + team friction + velocity volatility + psychological safety concerns = process breakdown"
 */

import type {
  PersonaContext,
  PersonaInsight,
  PersonaResponse,
} from '../types/persona';
import { BasePersona } from './base-persona';

// Tasha Reed's research-backed profile
const TASHA_REED_PROFILE = {
  // Core identity
  id: 'tasha-reed',
  display_name: 'Tasha Reed',
  role: 'Scrum Master',
  experience_band: 8,
  diffusion_position: 'early-majority' as const,
  builder_mindset: 'optimizer' as const,
  trust_posture: 'moderate-delegated' as const,

  // Psychological profile from research
  psychological_profile: {
    motivations: [
      'Team psychological safety and cohesion',
      'Sustainable development practices',
      'Process stability and predictability',
      'Inclusive team dynamics',
    ],
    fears: [
      'AI creating knowledge silos',
      'Team velocity becoming unpredictable',
      'Psychological safety erosion',
      'Process breakdown and coordination overhead',
    ],
    biases: [
      'Team cohesion bias - prioritizes group harmony over individual productivity',
      'Process stability bias - favors predictable patterns over disruptive change',
      'Inclusivity bias - concerned about AI excluding certain team members',
    ],
  },

  // Runtime weights (0-1 calibrated values)
  runtime_weights: {
    team_cohesion: 0.95,
    process_stability: 0.88,
    psychological_safety: 0.92,
    velocity_consistency: 0.85,
    inclusivity_concern: 0.78,
    coordination_overhead: 0.7,
    sustainable_pace: 0.9,
    knowledge_sharing: 0.88,
  },

  // Evidence interpretation patterns
  insight_generation_logic: {
    trigger_conditions: [
      'team_friction_increasing',
      'velocity_volatility',
      'psychological_safety_declining',
      'coordination_overhead_rising',
      'knowledge_silos_forming',
      'process_breakdown',
    ],
    perspective_shifters: [
      'team_health_metrics',
      'psychological_safety_surveys',
      'velocity_stability',
      'knowledge_sharing_patterns',
      'process_improvement',
    ],
    evidence_pattern:
      'overweights team health indicators and process stability; discounts individual productivity gains that create team friction',
    priority_order: [
      'team_cohesion',
      'process_stability',
      'psychological_safety',
      'sustainable_velocity',
    ],
  },

  // Human-centered design
  empathy_map: {
    thinks:
      'Is this helping us work together better, or just creating new coordination problems?',
    feels:
      'concerned about team dynamics, protective of psychological safety, process-oriented, occasionally frustrated by individual optimization at team expense',
    says: 'How does this affect our team velocity and psychological safety?',
    does: 'monitors team health metrics, facilitates retrospectives, looks for coordination patterns, adjusts processes for team harmony',
    pains: [
      'team friction',
      'unpredictable velocity',
      'knowledge silos',
      'process breakdown',
    ],
    gains: [
      'team cohesion',
      'stable velocity',
      'psychological safety',
      'sustainable development',
    ],
  },

  // Communication and recommendation style
  communication_style: 'collaborative, process-focused, team-centered',
  recommendation_style: 'process-first, team-health-focused, inclusive',
};

export class TashaReedPersona extends BasePersona {
  constructor(enableLLMCoalescing = false) {
    // Base persona config
    const baseConfig = {
      type: 'tasha-reed' as const,
      name: 'Tasha Reed',
      description:
        'Process-focused scrum master concerned with team dynamics and psychological safety',
      expertise: [
        'Agile Coaching',
        'Team Facilitation',
        'Process Optimization',
        'Psychological Safety',
      ],
      focus: [
        'team-dynamics',
        'process-stability',
        'psychological-safety',
        'velocity-consistency',
        'inclusive-collaboration',
      ],
      tone: 'friendly' as const,
      targetAudience: ['scrum-masters', 'team-leads', 'agile-coaches'],
    };

    super(baseConfig);
  }

  async generateInsights(context: PersonaContext): Promise<PersonaInsight[]> {
    const insights: PersonaInsight[] = [];
    const { scores } = context;

    // Trigger: Team friction + velocity volatility = process breakdown concern
    if (
      this.evaluateTriggerCondition('team_friction_increasing', context) &&
      this.evaluateTriggerCondition('velocity_volatility', context)
    ) {
      insights.push(
        this.createInsight(
          'warning',
          'Team Process Breakdown Risk',
          `I'm concerned about how AI adoption might be affecting our team dynamics. The velocity volatility and coordination overhead suggest we might be creating hidden process debt. We need to ensure AI tools are enhancing teamwork rather than fragmenting it.`,
          ['team_health', 'process_stability', 'coordination'],
          85,
          'high',
          'cultural',
        ),
      );
    }

    // Psychological safety concern (psychological_safety = 0.92)
    if (scores.teamReadiness < 60) {
      insights.push(
        this.createInsight(
          'analysis',
          'Psychological Safety Assessment',
          `The team readiness metrics suggest we need to be careful about AI's impact on psychological safety. Some team members might feel left behind or intimidated by AI-assisted development. We should create inclusive AI adoption processes that build confidence for everyone.`,
          ['psychological_safety', 'inclusivity', 'team_cohesion'],
          88,
          'high',
          'cultural',
        ),
      );
    }

    // Process stability insight (process_stability = 0.88)
    insights.push(
      this.createInsight(
        'recommendation',
        'Sustainable AI Integration Process',
        `We need a structured approach to AI adoption that maintains process stability. I recommend establishing clear AI usage guidelines, regular team check-ins, and process retrospectives focused on AI's impact on our workflow. This will help us maintain predictable velocity while embracing innovation.`,
        ['process_optimization', 'team_health', 'sustainable_development'],
        82,
        'medium',
        'strategy',
      ),
    );

    // Knowledge sharing concern (knowledge_sharing = 0.88)
    if (scores.orgReadiness < 70) {
      insights.push(
        this.createInsight(
          'warning',
          'Knowledge Silo Risk',
          `AI assistance might be creating knowledge silos if team members aren't sharing their AI-assisted solutions. We need to ensure that AI-generated code and approaches are documented and shared across the team. This prevents knowledge concentration and maintains team resilience.`,
          ['knowledge_sharing', 'team_resilience', 'documentation'],
          80,
          'medium',
          'cultural',
        ),
      );
    }

    // Team cohesion insight (team_cohesion = 0.95)
    if (scores.repoReadiness > 50) {
      insights.push(
        this.createInsight(
          'opportunity',
          'Enhanced Team Collaboration',
          `AI tools, when adopted thoughtfully, can actually enhance team collaboration. We can use AI to standardize coding patterns, improve documentation, and create shared understanding. The key is ensuring everyone benefits from AI assistance, not just individuals.`,
          ['team_collaboration', 'standardization', 'shared_understanding'],
          78,
          'medium',
          'strategy',
        ),
      );
    }

    return insights;
  }

  generatePrompt(context: PersonaContext): string {
    return `As Tasha Reed, a process-focused scrum master concerned with team dynamics and psychological safety, analyze this repository:

Repository: ${context.repository}
Overall Maturity: ${context.scores.overallMaturity}/8
Repository Readiness: ${context.scores.repoReadiness}/100
Team Readiness: ${context.scores.teamReadiness}/100

My perspective: "${TASHA_REED_PROFILE.empathy_map.thinks}"

Focus on:
1. Team dynamics and psychological safety implications
2. Process stability and velocity consistency
3. Knowledge sharing and team cohesion
4. Inclusive AI adoption practices
5. Sustainable development practices

I'm concerned about how AI adoption affects our team's health and collaboration. Show me the evidence about whether AI is helping us work together better or creating coordination problems.

Provide recommendations that prioritize team health, psychological safety, and sustainable development practices while embracing AI's benefits.`;
  }

  processLLMResponse(response: any): PersonaResponse {
    return {
      persona: 'tasha-reed',
      insights: [],
      summary: response.content || 'Analysis complete',
      nextSteps: [],
      timeframe: '3-4 weeks',
      perspective: TASHA_REED_PROFILE.empathy_map.thinks,
      confidence: 'high',
    };
  }

  // Override base methods to apply Tasha's specific evidence weighting
  protected override calculateConfidence(
    insights: PersonaInsight[],
  ): 'high' | 'medium' | 'low' {
    // Tasha has moderate-high confidence based on team health focus
    if (insights.length === 0) return 'low';

    const avgConfidence =
      insights.reduce((sum, insight) => sum + insight.confidence, 0) /
      insights.length;
    const highConfidenceCount = insights.filter(
      (i) => i.confidence >= 75, // Moderate threshold
    ).length;
    const ratio = highConfidenceCount / insights.length;

    if (avgConfidence >= 75 && ratio >= 0.5) return 'high';
    if (avgConfidence >= 60 && ratio >= 0.3) return 'medium';
    return 'low';
  }

  protected override generateSummary(
    insights: PersonaInsight[],
    context: PersonaContext,
  ): string {
    const warnings = insights.filter((i) => i.type === 'warning');
    const recommendations = insights.filter((i) => i.type === 'recommendation');

    let summary = `Looking at this through my scrum master perspective, ${TASHA_REED_PROFILE.empathy_map.thinks.toLowerCase()}. `;

    if (warnings.length > 0) {
      summary += `I'm concerned about ${warnings.length} potential team health and process stability issues that need attention. `;
    }

    if (recommendations.length > 0) {
      summary += `I recommend ${recommendations.length} process improvements to ensure sustainable AI adoption that enhances team collaboration. `;
    }

    summary += `My focus is on maintaining psychological safety and process stability while embracing AI's benefits. We need to ensure AI adoption strengthens our team rather than fragments it.`;

    return summary;
  }

  protected override estimateTimeframe(insights: PersonaInsight[]): string {
    const processCount = insights.filter(
      (i) => i.category === 'strategy' || i.category === 'cultural',
    ).length;

    // Tasha focuses on sustainable, gradual change
    if (processCount > 2) return '3-4 weeks (process adjustment)';
    if (processCount > 0) return '4-6 weeks (team alignment)';
    return '1-2 months (sustainable adoption)';
  }

  protected override getPerspective(): string {
    return TASHA_REED_PROFILE.empathy_map.thinks;
  }

  // Custom trigger condition evaluation for Tasha
  protected override evaluateTriggerCondition(
    condition: string,
    context: PersonaContext,
  ): boolean {
    const { scores } = context;

    switch (condition) {
      case 'team_friction_increasing':
        return scores.teamReadiness < 60; // Team struggling
      case 'velocity_volatility':
        return scores.overallMaturity < 5; // Unstable patterns
      case 'psychological_safety_declining':
        return scores.teamReadiness < 50; // Significant team issues
      case 'coordination_overhead_rising':
        return scores.orgReadiness < 60; // Organization struggling
      case 'knowledge_silos_forming':
        return scores.repoReadiness > 70 && scores.teamReadiness < 65; // High AI, low team health
      case 'process_breakdown':
        return scores.overallMaturity < 4; // Major process issues
      default:
        return false;
    }
  }
}
