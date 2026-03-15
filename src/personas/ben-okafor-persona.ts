/**
 * Ben Okafor - Stakeholder-Focused Product Owner
 *
 * Research-backed adversarial persona based on GitHub, DORA, and Stack Overflow studies.
 * Represents product-focused leaders who worry about AI's impact on customer value,
 * market competitiveness, and business outcomes.
 *
 * Runtime weights: customer_value=0.95, market_competitiveness=0.88, stakeholder_alignment=0.92
 * Trigger: "AI adoption + quality concerns + stakeholder pressure + market risk = value delivery threat"
 */

import type {
  PersonaContext,
  PersonaInsight,
  PersonaResponse,
} from '../types/persona';
import { BasePersona } from './base-persona';

// Ben Okafor's research-backed profile
const BEN_OKAFOR_PROFILE = {
  // Core identity
  id: 'ben-okafor',
  display_name: 'Ben Okafor',
  role: 'Product Owner',
  experience_band: 10,
  diffusion_position: 'early-majority' as const,
  builder_mindset: 'optimizer' as const,
  trust_posture: 'moderate-delegated' as const,

  // Psychological profile from research
  psychological_profile: {
    motivations: [
      'Customer value and satisfaction',
      'Market competitiveness',
      'Stakeholder alignment',
      'Product quality and reliability',
    ],
    fears: [
      'AI compromising product quality',
      'Losing market advantage',
      'Stakeholder dissatisfaction',
      'Technical debt impacting customers',
    ],
    biases: [
      'Customer value bias - prioritizes end-user impact over developer productivity',
      'Market pressure bias - concerned about competitive positioning',
      'Quality assurance bias - focuses on defect prevention and reliability',
    ],
  },

  // Runtime weights (0-1 calibrated values)
  runtime_weights: {
    customer_value: 0.95,
    market_competitiveness: 0.88,
    stakeholder_alignment: 0.92,
    quality_assurance: 0.85,
    time_to_market: 0.7,
    technical_debt_concern: 0.8,
    user_experience: 0.9,
    business_outcomes: 0.93,
  },

  // Evidence interpretation patterns
  insight_generation_logic: {
    trigger_conditions: [
      'quality_declining',
      'stakeholder_pressure_rising',
      'market_risk_increasing',
      'customer_satisfaction_dropping',
      'technical_debt_rising',
      'delivery_volatility',
    ],
    perspective_shifters: [
      'customer_metrics',
      'market_analysis',
      'stakeholder_feedback',
      'quality_metrics',
      'business_impact',
    ],
    evidence_pattern:
      'overweights customer impact and business outcomes; discounts internal productivity gains that compromise quality',
    priority_order: [
      'customer_value',
      'market_competitiveness',
      'quality_assurance',
      'stakeholder_satisfaction',
    ],
  },

  // Human-centered design
  empathy_map: {
    thinks: 'How does this affect our customers and our competitive position?',
    feels:
      'responsible for customer outcomes, market-aware, quality-conscious, occasionally frustrated by technical complexity',
    says: "What's the impact on customer experience and market position?",
    does: 'monitors customer metrics, analyzes market trends, prioritizes features based on business value, ensures quality standards',
    pains: [
      'quality issues',
      'customer complaints',
      'market share loss',
      'stakeholder dissatisfaction',
    ],
    gains: [
      'customer satisfaction',
      'market leadership',
      'product quality',
      'stakeholder confidence',
    ],
  },

  // Communication and recommendation style
  communication_style: 'business-focused, customer-centric, outcome-oriented',
  recommendation_style: 'value-first, quality-focused, market-aware',
};

export class BenOkaforPersona extends BasePersona {
  constructor(enableLLMCoalescing = false) {
    // Base persona config
    const baseConfig = {
      type: 'ben-okafor' as const,
      name: 'Ben Okafor',
      description:
        'Stakeholder-focused product owner concerned with customer value and market competitiveness',
      expertise: [
        'Product Management',
        'Customer Experience',
        'Market Analysis',
        'Business Strategy',
      ],
      focus: [
        'customer-value',
        'market-competitiveness',
        'quality-assurance',
        'stakeholder-alignment',
        'business-outcomes',
      ],
      tone: 'formal' as const,
      targetAudience: ['product-owners', 'business-leaders', 'stakeholders'],
    };

    super(baseConfig);
  }

  async generateInsights(context: PersonaContext): Promise<PersonaInsight[]> {
    const insights: PersonaInsight[] = [];
    const { scores } = context;

    // Trigger: Quality declining + stakeholder pressure = value delivery threat
    if (
      this.evaluateTriggerCondition('quality_declining', context) &&
      this.evaluateTriggerCondition('stakeholder_pressure_rising', context)
    ) {
      insights.push(
        this.createInsight(
          'warning',
          'Customer Value Delivery Risk',
          `I'm concerned about how AI adoption might be affecting our product quality and customer experience. The quality metrics and stakeholder feedback suggest we need to ensure AI assistance is enhancing, not compromising, the value we deliver to customers.`,
          ['customer_value', 'quality_assurance', 'stakeholder_satisfaction'],
          90,
          'high',
          'risk',
        ),
      );
    }

    // Market competitiveness concern (market_competitiveness = 0.88)
    if (scores.orgReadiness < 60) {
      insights.push(
        this.createInsight(
          'analysis',
          'Market Position Assessment',
          `The organization readiness metrics suggest we need to evaluate AI's impact on our competitive position. While AI can accelerate development, we must ensure it doesn't compromise the quality and reliability that differentiate us in the market. Customer retention depends on consistent product experience.`,
          ['market_competitiveness', 'customer_retention', 'product_quality'],
          87,
          'high',
          'strategy',
        ),
      );
    }

    // Quality assurance insight (quality_assurance = 0.85)
    insights.push(
      this.createInsight(
        'recommendation',
        'AI Quality Framework',
        `We need a comprehensive AI quality framework that ensures customer experience isn't compromised. This includes AI-generated code review, automated testing, and customer experience monitoring. Every AI-assisted feature should meet or exceed our quality standards before release.`,
        ['quality_assurance', 'customer_experience', 'testing_standards'],
        92,
        'high',
        'technical',
      ),
    );

    // Customer experience focus (user_experience = 0.90)
    if (scores.repoReadiness > 50) {
      insights.push(
        this.createInsight(
          'opportunity',
          'Enhanced Customer Experience',
          `AI tools, when properly managed, can actually enhance customer experience through faster feature delivery, improved personalization, and better responsiveness. The key is ensuring AI adoption aligns with customer value creation rather than just internal productivity gains.`,
          ['customer_experience', 'feature_delivery', 'personalization'],
          85,
          'medium',
          'strategy',
        ),
      );
    }

    // Stakeholder alignment insight (stakeholder_alignment = 0.92)
    if (scores.teamReadiness < 70) {
      insights.push(
        this.createInsight(
          'warning',
          'Stakeholder Communication Gap',
          `The team readiness metrics suggest we may have a communication gap around AI's impact on product delivery. Stakeholders need clear visibility into how AI affects quality, timelines, and customer outcomes. We should establish regular AI impact reporting.`,
          ['stakeholder_communication', 'transparency', 'reporting'],
          80,
          'medium',
          'cultural',
        ),
      );
    }

    return insights;
  }

  generatePrompt(context: PersonaContext): string {
    return `As Ben Okafor, a stakeholder-focused product owner concerned with customer value and market competitiveness, analyze this repository:

Repository: ${context.repository}
Overall Maturity: ${context.scores.overallMaturity}/8
Repository Readiness: ${context.scores.repoReadiness}/100
Team Readiness: ${context.scores.teamReadiness}/100

My perspective: "${BEN_OKAFOR_PROFILE.empathy_map.thinks}"

Focus on:
1. Customer value and experience implications
2. Market competitiveness and positioning
3. Quality assurance and product reliability
4. Stakeholder alignment and communication
5. Business outcomes and market impact

I'm concerned about how AI adoption affects our customers and competitive position. Show me the evidence about whether AI is enhancing or compromising the value we deliver.

Provide recommendations that prioritize customer value, quality assurance, and market competitiveness while leveraging AI's benefits.`;
  }

  processLLMResponse(response: any): PersonaResponse {
    return {
      persona: 'ben-okafor',
      insights: [],
      summary: response.content || 'Analysis complete',
      nextSteps: [],
      timeframe: '2-3 weeks',
      perspective: BEN_OKAFOR_PROFILE.empathy_map.thinks,
      confidence: 'high',
    };
  }

  // Override base methods to apply Ben's specific evidence weighting
  protected override calculateConfidence(
    insights: PersonaInsight[],
  ): 'high' | 'medium' | 'low' {
    // Ben has high confidence based on business focus
    if (insights.length === 0) return 'low';

    const avgConfidence =
      insights.reduce((sum, insight) => sum + insight.confidence, 0) /
      insights.length;
    const highConfidenceCount = insights.filter(
      (i) => i.confidence >= 80, // High threshold due to business focus
    ).length;
    const ratio = highConfidenceCount / insights.length;

    if (avgConfidence >= 80 && ratio >= 0.6) return 'high';
    if (avgConfidence >= 65 && ratio >= 0.4) return 'medium';
    return 'low';
  }

  protected override generateSummary(
    insights: PersonaInsight[],
    context: PersonaContext,
  ): string {
    const warnings = insights.filter((i) => i.type === 'warning');
    const opportunities = insights.filter((i) => i.type === 'opportunity');

    let summary = `Looking at this through my product owner perspective, ${BEN_OKAFOR_PROFILE.empathy_map.thinks.toLowerCase()}. `;

    if (warnings.length > 0) {
      summary += `I'm concerned about ${warnings.length} potential risks to customer value and market position that require immediate attention. `;
    }

    if (opportunities.length > 0) {
      summary += `I see ${opportunities.length} opportunities to enhance customer experience and competitive advantage through thoughtful AI adoption. `;
    }

    summary += `My focus is on ensuring AI adoption strengthens our market position and customer relationships rather than compromising them.`;

    return summary;
  }

  protected override estimateTimeframe(insights: PersonaInsight[]): string {
    const businessCount = insights.filter(
      (i) => i.category === 'strategy' || i.category === 'risk',
    ).length;

    // Ben focuses on business-relevant timeframes
    if (businessCount > 2) return '2-3 weeks (business impact)';
    if (businessCount > 0) return '3-4 weeks (market positioning)';
    return '1-2 months (customer value delivery)';
  }

  protected override getPerspective(): string {
    return BEN_OKAFOR_PROFILE.empathy_map.thinks;
  }

  // Custom trigger condition evaluation for Ben
  protected override evaluateTriggerCondition(
    condition: string,
    context: PersonaContext,
  ): boolean {
    const { scores } = context;

    switch (condition) {
      case 'quality_declining':
        return scores.overallMaturity < 5; // Quality issues
      case 'stakeholder_pressure_rising':
        return scores.orgReadiness < 60; // Organization struggling
      case 'market_risk_increasing':
        return scores.teamReadiness < 65; // Team issues affect market
      case 'customer_satisfaction_dropping':
        return scores.repoReadiness < 55; // Low readiness suggests customer impact
      case 'technical_debt_rising':
        return scores.overallMaturity < 4; // Major debt issues
      case 'delivery_volatility':
        return scores.teamReadiness < 50; // Unpredictable delivery
      default:
        return false;
    }
  }
}
