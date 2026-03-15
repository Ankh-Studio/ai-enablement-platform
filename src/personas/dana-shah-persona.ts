/**
 * Dana Shah - Elder Overachiever (AI-Hesitant Senior Developer)
 *
 * Research-backed adversarial persona based on GitHub, DORA, and Stack Overflow studies.
 * Represents experienced developers who are cautious about AI accuracy and focused on
 * long-term system health over short-term speed gains.
 *
 * Runtime weights: trust_default=0.25, quality_sensitivity=0.95, reviewer_burden_sensitivity=0.90
 * Trigger: "AI PR volume ↑ + PR size ↑ + review turnaround ↑ = speed hiding debt"
 */

import type {
  PersonaContext,
  PersonaInsight,
  PersonaResponse,
} from '../types/persona';
import { BasePersona } from './base-persona';

// Dana Shah's research-backed profile
const DANA_SHAH_PROFILE = {
  // Core identity
  id: 'dana-shah',
  display_name: 'Dana Shah',
  role: 'Staff/Principal Engineer',
  experience_band: 18,
  diffusion_position: 'late-majority' as const,
  builder_mindset: 'accelerator' as const,
  trust_posture: 'low-verified' as const,

  // Psychological profile from research
  psychological_profile: {
    motivations: [
      'Stewardship of long-term system health',
      'Mastery and craftsmanship',
      'Team mentorship and knowledge transfer',
      'Architectural integrity',
    ],
    fears: [
      'Erosion of engineering judgment',
      'Hidden technical debt accumulation',
      'Loss of code ownership and accountability',
      'Junior developers shipping unexplainable code',
    ],
    biases: [
      'Loss aversion - quality loss feels worse than speed gain',
      'Status quo bias - prefers proven patterns',
      'Authority bias - trusts experienced human judgment over AI',
    ],
  },

  // Runtime weights (0-1 calibrated values)
  runtime_weights: {
    trust_default: 0.25,
    quality_sensitivity: 0.95,
    reviewer_burden_sensitivity: 0.9,
    novelty_bias: 0.1,
    coachability: 0.55,
    status_threat: 0.45,
    maintainability_weight: 0.98,
    security_weight: 0.92,
    mentorship_weight: 0.85,
  },

  // Evidence interpretation patterns
  insight_generation_logic: {
    trigger_conditions: [
      'ai_pr_volume_rising',
      'pr_size_increasing',
      'review_turnaround_decreasing',
      'post_merge_rework_increasing',
      'instability_rising',
      'junior_explanations_poor',
    ],
    perspective_shifters: [
      'small_ai_prs',
      'strong_author_checks',
      'stable_review_load',
      'better_build_health',
      'consistent_ownership',
    ],
    evidence_pattern:
      'overweights reviewer burden, maintainability, and incident risk; discounts self-reported speed',
    priority_order: [
      'maintainability',
      'reviewer_load',
      'security',
      'team_skill_development',
      'individual_speed',
    ],
  },

  // Human-centered design
  empathy_map: {
    thinks: "I don't care if it's fast if it leaves mush behind",
    feels:
      'protective, responsible, slightly cornered by hype, quietly curious',
    says: 'Show me defect escape, reviewer time, and whether someone besides the author can debug this at 2 a.m.',
    does: 'reviews AI-heavy diffs more aggressively, pilots in low-risk repos, mentors juniors by asking them to reason aloud',
    pains: [
      'giant PRs',
      'generic abstractions',
      'brittle tests',
      'mandatory-adoption rhetoric',
      'AI-generated confidence without AI-generated accountability',
    ],
    gains: [
      'more time for architecture and mentoring',
      'less toil',
      'faster safe refactors',
      'preserved craftsmanship',
    ],
  },

  // Communication and recommendation style
  communication_style: 'calm, clipped, specific, evidence-heavy',
  recommendation_style: 'guardrails-first, low-drama, evidence-heavy',
};

export class DanaShahPersona extends BasePersona {
  constructor(enableLLMCoalescing = false) {
    // Base persona config
    const baseConfig = {
      type: 'dana-shah' as const,
      name: 'Dana Shah',
      description:
        'AI-hesitant senior developer focused on long-term system health and craftsmanship',
      expertise: [
        'System Architecture',
        'Code Review',
        'Technical Leadership',
        'Mentorship',
        'Quality Assurance',
      ],
      focus: [
        'maintainability',
        'code-quality',
        'review-process',
        'team-development',
        'long-term-architecture',
      ],
      tone: 'formal' as const,
      targetAudience: ['senior-developers', 'tech-leads', 'architects'],
    };

    super(baseConfig);
  }

  async generateInsights(context: PersonaContext): Promise<PersonaInsight[]> {
    const insights: PersonaInsight[] = [];
    const { scores } = context;

    // Trigger: AI PR volume rising + review burden increasing
    if (
      this.evaluateTriggerCondition('ai_pr_volume_rising', context) &&
      this.evaluateTriggerCondition('review_turnaround_decreasing', context)
    ) {
      insights.push(
        this.createInsight(
          'warning',
          'Speed Hiding Debt',
          `I'm concerned about the pattern I'm seeing: AI-assisted PR volume is rising while review turnaround is decreasing. This typically indicates that we're accumulating hidden technical debt. The speed gains are illusory if we can't maintain quality standards.`,
          ['ai_pr_volume', 'review_turnaround', 'code_quality'],
          92,
          'critical',
          'risk',
        ),
      );
    }

    // Trigger: PR size increasing + instability rising
    if (
      this.evaluateTriggerCondition('pr_size_increasing', context) &&
      this.evaluateTriggerCondition('instability_rising', context)
    ) {
      insights.push(
        this.createInsight(
          'analysis',
          'Architecture Drift Risk',
          `Large AI-assisted PRs combined with rising instability suggests we're losing architectural coherence. When AI generates complex changes without deep contextual understanding, we create systems no one truly owns. This violates my core responsibility for long-term maintainability.`,
          ['pr_size', 'instability', 'architecture'],
          88,
          'high',
          'technical',
        ),
      );
    }

    // Quality sensitivity insight (high quality_sensitivity = 0.95)
    if (scores.repoReadiness < 60) {
      insights.push(
        this.createInsight(
          'recommendation',
          'Quality-First AI Adoption',
          `Before expanding AI usage, we need to strengthen our quality foundations. I recommend focusing AI on scaffolding, documentation, and bounded refactors where the risk is low. Core architecture and security-critical code should remain human-first.`,
          ['quality', 'risk-assessment', 'adoption-strategy'],
          85,
          'high',
          'process',
        ),
      );
    }

    // Reviewer burden sensitivity (reviewer_burden_sensitivity = 0.90)
    insights.push(
      this.createInsight(
        'analysis',
        'Review Process Sustainability',
        `The current AI adoption pattern is creating reviewer fatigue. When AI generates code that requires extensive verification, we're not gaining efficiency - we're shifting the burden downstream. We need smaller, more focused AI contributions that authors can fully explain.`,
        ['review_burden', 'process-efficiency', 'team-sustainability'],
        87,
        'medium',
        'process',
      ),
    );

    // Mentorship concern (mentorship_weight = 0.85)
    if (scores.teamReadiness < 70) {
      insights.push(
        this.createInsight(
          'recommendation',
          'Junior Developer Guardrails',
          `I'm concerned about junior developers using AI without developing fundamental understanding. We need explicit guardrails: 'attempt first, ask AI second, explain final code.' Pair AI assistance with mandatory design explanations and code ownership.`,
          ['team_development', 'skill-building', 'knowledge-transfer'],
          90,
          'high',
          'cultural',
        ),
      );
    }

    return insights;
  }

  generatePrompt(context: PersonaContext): string {
    return `As Dana Shah, an 18-year Staff Engineer who is cautious about AI adoption, analyze this repository:

Repository: ${context.repository}
Overall Maturity: ${context.scores.overallMaturity}/8
Repository Readiness: ${context.scores.repoReadiness}/100
Team Readiness: ${context.scores.teamReadiness}/100

My perspective: "${DANA_SHAH_PROFILE.empathy_map.thinks}"

Focus on:
1. Long-term maintainability and architectural integrity
2. Review process sustainability and reviewer burden
3. Quality risks and hidden technical debt
4. Junior developer skill development and mentorship
5. Security and system ownership concerns

I'm particularly concerned about patterns where AI speed gains come at the expense of code quality, reviewability, or team understanding. Show me the evidence about whether this code will be maintainable in 2 years and whether someone other than the author can debug it at 2am.

Provide specific, evidence-based recommendations that prioritize system health over perceived productivity gains.`;
  }

  processLLMResponse(response: any): PersonaResponse {
    return {
      persona: 'dana-shah',
      insights: [],
      summary: response.content || 'Analysis complete',
      nextSteps: [],
      timeframe: '3-6 months',
      perspective: DANA_SHAH_PROFILE.empathy_map.thinks,
      confidence: 'high',
    };
  }

  // Override base methods to apply Dana's specific evidence weighting
  protected override calculateConfidence(
    insights: PersonaInsight[],
  ): 'high' | 'medium' | 'low' {
    // Dana has higher confidence thresholds due to low trust (0.25)
    if (insights.length === 0) return 'low';

    const avgConfidence =
      insights.reduce((sum, insight) => sum + insight.confidence, 0) /
      insights.length;
    const highConfidenceCount = insights.filter(
      (i) => i.confidence >= 85, // Higher threshold than default
    ).length;
    const ratio = highConfidenceCount / insights.length;

    if (avgConfidence >= 85 && ratio >= 0.8) return 'high';
    if (avgConfidence >= 70 && ratio >= 0.5) return 'medium';
    return 'low';
  }

  protected override generateSummary(
    insights: PersonaInsight[],
    context: PersonaContext,
  ): string {
    const criticalRisks = insights.filter(
      (i) => i.priority === 'critical' && i.type === 'warning',
    );
    const qualityConcerns = insights.filter(
      (i) => i.category === 'technical' || i.category === 'risk',
    );

    let summary = `Looking at this through my 18 years of engineering experience, ${DANA_SHAH_PROFILE.empathy_map.thinks.toLowerCase()}. `;

    if (criticalRisks.length > 0) {
      summary += `I'm deeply concerned about ${criticalRisks.length} critical risks that threaten our long-term system health. `;
    }

    if (qualityConcerns.length > 0) {
      summary += `I see ${qualityConcerns.length} quality and architectural concerns that need immediate attention before we expand AI adoption. `;
    }

    summary += `My focus is on maintainability, reviewer burden, and ensuring we're not sacrificing craftsmanship for perceived speed. We need evidence that AI assistance is improving, not eroding, our engineering standards.`;

    return summary;
  }

  protected override estimateTimeframe(insights: PersonaInsight[]): string {
    const criticalCount = insights.filter(
      (i) => i.priority === 'critical',
    ).length;
    const highCount = insights.filter((i) => i.priority === 'high').length;

    // Dana is more conservative about timelines
    if (criticalCount > 0) return '4-6 weeks (critical quality issues first)';
    if (highCount > 2) return '8-12 weeks (systematic approach needed)';
    if (highCount > 0) return '6-8 weeks';
    return '3-4 months (gradual, measured adoption)';
  }

  protected override getPerspective(): string {
    return DANA_SHAH_PROFILE.empathy_map.thinks;
  }

  // Custom trigger condition evaluation for Dana
  protected override evaluateTriggerCondition(
    condition: string,
    context: PersonaContext,
  ): boolean {
    const { scores } = context;

    switch (condition) {
      case 'ai_pr_volume_rising':
        return scores.repoReadiness > 70; // High AI adoption detected
      case 'pr_size_increasing':
        return scores.overallMaturity < 6; // Lower maturity suggests potential issues
      case 'review_turnaround_decreasing':
        return scores.teamReadiness < 70; // Team readiness issues
      case 'post_merge_rework_increasing':
        return scores.repoReadiness < 60; // Quality issues
      case 'instability_rising':
        return scores.overallMaturity < 5;
      case 'junior_explanations_poor':
        return scores.teamReadiness < 70;
      default:
        return false;
    }
  }
}
