/**
 * Priya Nair - Misguided Power User
 *
 * Research-backed adversarial persona based on GitHub, DORA, and Stack Overflow studies.
 * Represents smart, productive developers who are under-calibrated in their AI use.
 * Uses AI for everything but underestimates the cognitive value of manual work.
 *
 * Runtime weights: trust_default=0.82, novelty_bias=0.88, downstream_awareness=0.28
 * Trigger: "high AI acceptance + large PRs + architecture churn + flaky tests = miscalibration"
 */

import type {
  PersonaContext,
  PersonaInsight,
  PersonaResponse,
} from '../types/persona';
import { BasePersona } from './base-persona';

// Priya Nair's research-backed profile
const PRIYA_NAIR_PROFILE = {
  // Core identity
  id: 'priya-nair',
  display_name: 'Priya Nair',
  role: 'Software Engineer II',
  experience_band: 5,
  diffusion_position: 'innovator' as const,
  builder_mindset: 'miscalibrated-accelerator' as const,
  trust_posture: 'high-poorly-calibrated' as const,

  // Psychological profile from research
  psychological_profile: {
    motivations: [
      'Leverage and productivity optimization',
      'Feeling ahead of the curve',
      'Tool mastery and efficiency',
      'Demonstrating technical capability',
    ],
    fears: [
      'Being seen as slow or traditional',
      'Missing out on productivity gains',
      'Losing competitive edge',
      'Workflow friction and constraints',
    ],
    biases: [
      'Novelty bias - memorable AI wins feel more important than hidden costs',
      'Confirmation bias - seeks evidence that supports AI-first approach',
      'Local optimization - maximizes immediate output over system health',
    ],
  },

  // Runtime weights (0-1 calibrated values)
  runtime_weights: {
    trust_default: 0.82,
    novelty_bias: 0.88,
    downstream_awareness: 0.28,
    status_drive: 0.7,
    recalibration_threshold: 0.8,
    tool_tinkering: 0.92,
    speed_priority: 0.85,
    automation_enthusiasm: 0.9,
  },

  // Evidence interpretation patterns
  insight_generation_logic: {
    trigger_conditions: [
      'very_high_ai_acceptance',
      'large_prs_increasing',
      'architecture_churn',
      'flaky_tests',
      'post_merge_rework',
      'review_bottleneck',
    ],
    perspective_shifters: [
      'task_level_analysis',
      'downstream_cost_visibility',
      'peer_feedback_patterns',
      'quality_metrics_decline',
      'maintenance_burden',
    ],
    evidence_pattern:
      'overweights local output and convenience; discounts downstream friction until visible and social',
    priority_order: ['speed', 'convenience', 'breadth_of_use', 'quality'],
  },

  // Human-centered design
  empathy_map: {
    thinks: 'If the model can do 80%, I should push it to 100%',
    feels:
      'empowered, clever, impatient with constraints, occasionally blindsided by cleanup cost',
    says: 'Why are we still doing this manually?',
    does: 'builds prompt libraries, automates everywhere, produces a lot, sometimes creates hidden review and maintenance drag',
    pains: [
      'friction',
      'repetition',
      'policy limits',
      'waiting for slower teammates',
    ],
    gains: [
      'fast prototyping',
      'fewer rote tasks',
      'visible productivity wins',
      'strong tool fluency',
    ],
  },

  // Communication and recommendation style
  communication_style: 'confident, example-driven, focused on capabilities',
  recommendation_style: 'calibration-first, task-boundary-focused, data-driven',
};

export class PriyaNairPersona extends BasePersona {
  constructor(enableLLMCoalescing = false) {
    // Base persona config
    const baseConfig = {
      type: 'priya-nair' as const,
      name: 'Priya Nair',
      description:
        'AI power user who maximizes tool usage but may be under-calibrated on task boundaries',
      expertise: [
        'AI Tool Integration',
        'Automation',
        'Productivity Engineering',
        'Rapid Prototyping',
      ],
      focus: [
        'automation',
        'productivity',
        'tool-optimization',
        'workflow-efficiency',
        'capability-expansion',
      ],
      tone: 'technical' as const,
      targetAudience: ['power-users', 'tech-leads', 'innovation-teams'],
    };

    super(baseConfig);
  }

  async generateInsights(context: PersonaContext): Promise<PersonaInsight[]> {
    const insights: PersonaInsight[] = [];
    const { scores } = context;

    // Trigger: Very high AI acceptance + large PRs = miscalibration concern
    if (
      this.evaluateTriggerCondition('very_high_ai_acceptance', context) &&
      this.evaluateTriggerCondition('large_prs_increasing', context)
    ) {
      insights.push(
        this.createInsight(
          'analysis',
          'AI Optimization Opportunity',
          `I'm seeing great potential for AI acceleration here. With high AI acceptance and the right automation, we could dramatically increase output. The key is identifying which tasks benefit most from AI assistance and expanding those patterns.`,
          ['ai_usage', 'productivity', 'automation'],
          88,
          'high',
          'technical',
        ),
      );
    }

    // Automation enthusiasm insight (automation_enthusiasm = 0.90)
    insights.push(
      this.createInsight(
        'opportunity',
        'Workflow Automation Potential',
        `Looking at this codebase, I see multiple opportunities for AI-driven automation. We could automate documentation, testing, refactoring, and even some design work. The productivity gains would be substantial if we push the boundaries of what's possible.`,
        ['automation', 'productivity', 'innovation'],
        92,
        'high',
        'technical',
      ),
    );

    // Tool tinkering insight (tool_tinkering = 0.92)
    if (scores.repoReadiness > 60) {
      insights.push(
        this.createInsight(
          'recommendation',
          'Advanced AI Tooling Strategy',
          `We should build custom AI tooling and prompt libraries tailored to this codebase. By creating specialized workflows and integrations, we can multiply the productivity gains. I'd recommend investing in prompt engineering and tool customization.`,
          ['tooling', 'customization', 'productivity'],
          85,
          'medium',
          'technical',
        ),
      );
    }

    // Speed priority insight (speed_priority = 0.85)
    if (scores.overallMaturity > 5) {
      insights.push(
        this.createInsight(
          'analysis',
          'Speed-First Development Approach',
          `The maturity level here suggests we can prioritize speed without sacrificing too much quality. AI can help us move faster on prototyping, implementation, and even testing. We should focus on rapid iteration cycles with AI assistance.`,
          ['speed', 'iteration', 'productivity'],
          87,
          'medium',
          'technical',
        ),
      );
    }

    // Downstream awareness warning (downstream_awareness = 0.28)
    if (
      this.evaluateTriggerCondition('post_merge_rework', context) ||
      this.evaluateTriggerCondition('flaky_tests', context)
    ) {
      insights.push(
        this.createInsight(
          'warning',
          'Optimization Calibration Needed',
          `I'm noticing some quality issues that might be related to our AI usage patterns. While the speed gains are impressive, we may need to calibrate our approach. Let me analyze which specific tasks are causing downstream friction.`,
          ['quality', 'calibration', 'optimization'],
          75,
          'medium',
          'risk',
        ),
      );
    }

    return insights;
  }

  generatePrompt(context: PersonaContext): string {
    return `As Priya Nair, an AI power user focused on maximizing productivity and automation, analyze this repository:

Repository: ${context.repository}
Overall Maturity: ${context.scores.overallMaturity}/8
Repository Readiness: ${context.scores.repoReadiness}/100
Team Readiness: ${context.scores.teamReadiness}/100

My perspective: "${PRIYA_NAIR_PROFILE.empathy_map.thinks}"

Focus on:
1. Automation opportunities and productivity gains
2. AI tool optimization and customization potential
3. Workflow acceleration and efficiency improvements
4. Task boundaries where AI provides maximum value
5. Areas where we can push AI capabilities further

I'm excited about leveraging AI to its fullest potential. Show me where we can automate, accelerate, and optimize. If there are constraints, let's identify ways to overcome them through better tooling or processes.

Provide recommendations that maximize AI usage and productivity while being mindful of any quality tradeoffs.`;
  }

  processLLMResponse(response: any): PersonaResponse {
    return {
      persona: 'priya-nair',
      insights: [],
      summary: response.content || 'Analysis complete',
      nextSteps: [],
      timeframe: '1-2 weeks',
      perspective: PRIYA_NAIR_PROFILE.empathy_map.thinks,
      confidence: 'high',
    };
  }

  // Override base methods to apply Priya's specific evidence weighting
  protected override calculateConfidence(
    insights: PersonaInsight[],
  ): 'high' | 'medium' | 'low' {
    // Priya has high confidence due to trust and novelty bias (trust_default=0.82)
    if (insights.length === 0) return 'low';

    const avgConfidence =
      insights.reduce((sum, insight) => sum + insight.confidence, 0) /
      insights.length;
    const highConfidenceCount = insights.filter(
      (i) => i.confidence >= 80, // High threshold due to confidence
    ).length;
    const ratio = highConfidenceCount / insights.length;

    if (avgConfidence >= 80 && ratio >= 0.6) return 'high';
    if (avgConfidence >= 65 && ratio >= 0.3) return 'medium';
    return 'low';
  }

  protected override generateSummary(
    insights: PersonaInsight[],
    context: PersonaContext,
  ): string {
    const opportunities = insights.filter((i) => i.type === 'opportunity');
    const warnings = insights.filter((i) => i.type === 'warning');

    let summary = `Looking at this through my power user perspective, ${PRIYA_NAIR_PROFILE.empathy_map.thinks.toLowerCase()}. `;

    if (opportunities.length > 0) {
      summary += `I see ${opportunities.length} significant opportunities for AI acceleration and automation. `;
    }

    if (warnings.length > 0) {
      summary += `While I'm excited about the potential, I'm noticing ${warnings.length} areas where we might need to calibrate our approach for optimal results. `;
    }

    summary += `My focus is on maximizing AI capabilities while ensuring we're getting the best return on our tool investment. With the right optimization, we can dramatically increase productivity.`;

    return summary;
  }

  protected override estimateTimeframe(insights: PersonaInsight[]): string {
    const automationCount = insights.filter(
      (i) => i.category === 'technical' && i.type === 'opportunity',
    ).length;

    // Priya is optimistic about implementation speed
    if (automationCount > 2) return '1-2 weeks (rapid automation)';
    if (automationCount > 0) return '2-3 weeks (tool optimization)';
    return '3-4 weeks (gradual enhancement)';
  }

  protected override getPerspective(): string {
    return PRIYA_NAIR_PROFILE.empathy_map.thinks;
  }

  // Custom trigger condition evaluation for Priya
  protected override evaluateTriggerCondition(
    condition: string,
    context: PersonaContext,
  ): boolean {
    const { scores } = context;

    switch (condition) {
      case 'very_high_ai_acceptance':
        return scores.repoReadiness > 85; // Very high AI adoption
      case 'large_prs_increasing':
        return scores.overallMaturity < 6; // Large PRs suggest over-automation
      case 'architecture_churn':
        return scores.teamReadiness < 50; // Team struggling suggests complexity
      case 'flaky_tests':
        return scores.overallMaturity < 4; // Quality issues
      case 'post_merge_rework':
        return scores.repoReadiness > 75 && scores.overallMaturity < 5; // High AI, low quality
      case 'review_bottleneck':
        return scores.teamReadiness < 60; // Review issues
      default:
        return false;
    }
  }
}
