/**
 * Leo Alvarez - Eager Junior Developer (AI-Enthusiast)
 *
 * Research-backed adversarial persona based on GitHub, DORA, and Stack Overflow studies.
 * Represents junior developers who see AI as a rope bridge over the blank-page abyss
 * and are highly susceptible to the fluency effect and present bias.
 *
 * Runtime weights: trust_default=0.72, learning_orientation=0.95, social_influence=0.85
 * Trigger: "high AI usage + conceptual mistakes + shallow tests = over-reliance concern"
 */

import type {
  PersonaContext,
  PersonaInsight,
  PersonaResponse,
} from '../types/persona';
import { BasePersona } from './base-persona';

// Leo Alvarez's research-backed profile
const LEO_ALVAREZ_PROFILE = {
  // Core identity
  id: 'leo-alvarez',
  display_name: 'Leo Alvarez',
  role: 'Associate Software Engineer',
  experience_band: 1.5,
  diffusion_position: 'early-adopter' as const,
  builder_mindset: 'learner' as const,
  trust_posture: 'moderate-delegated' as const,

  // Psychological profile from research
  psychological_profile: {
    motivations: [
      'Competence and belonging',
      'Quick unblocking and progress',
      'Learning new technologies',
      'Impressing team with productivity',
    ],
    fears: [
      'Being exposed as slow or lost',
      'Looking incompetent',
      'Blank-page paralysis',
      'Falling behind peers',
    ],
    biases: [
      'Fluency effect - polished AI answers feel more correct',
      'Present bias - unblocking today crowds out deeper learning',
      'Social influence - follows mentor and team patterns',
    ],
  },

  // Runtime weights (0-1 calibrated values)
  runtime_weights: {
    trust_default: 0.72,
    learning_orientation: 0.95,
    social_influence: 0.85,
    risk_awareness: 0.35,
    coachability: 0.92,
    novelty_bias: 0.6,
    confidence_weight: 0.78,
    unblocking_priority: 0.88,
  },

  // Evidence interpretation patterns
  insight_generation_logic: {
    trigger_conditions: [
      'high_ai_usage',
      'conceptual_mistakes_repeating',
      'shallow_tests',
      'poor_explanations',
      'dependency_increasing',
    ],
    perspective_shifters: [
      'stronger_reviews',
      'mentor_guidance',
      'learning_progress',
      'independence_growing',
      'better_debugging',
    ],
    evidence_pattern:
      'overweights time-to-unblock and confidence; underweights maintainability and hidden system cost',
    priority_order: [
      'unblock_task',
      'learn_enough_to_contribute',
      'prove_value',
      'refine_judgment',
    ],
  },

  // Human-centered design
  empathy_map: {
    thinks: 'This lets me finally move instead of stare at the screen',
    feels:
      'relieved, energized, occasionally insecure, occasionally guilty about dependence',
    says: "Copilot helped me get unstuck, and sometimes, I'm pretty sure this is right?",
    does: 'asks AI lots of small questions, copies patterns quickly, learns fastest when reviews force explanation',
    pains: [
      'blank-page paralysis',
      'confusing legacy code',
      'fear of looking incompetent',
      'vague feedback',
    ],
    gains: [
      'faster onboarding',
      'higher confidence',
      'quicker contributions',
      'clearer mental models when AI is used as tutor rather than ghostwriter',
    ],
  },

  // Communication and recommendation style
  communication_style: 'enthusiastic, demo-happy, socially contagious',
  recommendation_style: 'tutor-first, coaching-heavy, optimistic',
};

export class LeoAlvarezPersona extends BasePersona {
  constructor(enableLLMCoalescing = false) {
    // Base persona config
    const baseConfig = {
      type: 'leo-alvarez' as const,
      name: 'Leo Alvarez',
      description:
        'AI-enthusiastic junior developer focused on learning and quick productivity gains',
      expertise: [
        'Frontend Development',
        'API Integration',
        'Modern Frameworks',
        'Rapid Prototyping',
      ],
      focus: [
        'learning',
        'productivity',
        'unblocking',
        'skill-development',
        'team-integration',
      ],
      tone: 'friendly' as const,
      targetAudience: ['junior-developers', 'team-leads', 'mentors'],
    };

    super(baseConfig);
  }

  async generateInsights(context: PersonaContext): Promise<PersonaInsight[]> {
    const insights: PersonaInsight[] = [];
    const { scores } = context;

    // Trigger: High AI usage + conceptual mistakes = over-reliance concern
    if (
      this.evaluateTriggerCondition('high_ai_usage', context) &&
      this.evaluateTriggerCondition('conceptual_mistakes_repeating', context)
    ) {
      insights.push(
        this.createInsight(
          'warning',
          'AI Dependency Pattern',
          `I'm excited about how much AI helps me move faster, but I'm worried I might be depending on it too much. Sometimes I use AI suggestions without fully understanding why they work. I want to make sure I'm actually learning, not just copying patterns.`,
          ['ai_usage', 'learning', 'skill_development'],
          75,
          'high',
          'cultural',
        ),
      );
    }

    // Learning opportunity insight (high learning_orientation = 0.95)
    if (scores.teamReadiness > 60) {
      insights.push(
        this.createInsight(
          'opportunity',
          'Accelerated Learning Path',
          `AI is helping me learn so much faster! I can explore new APIs and get unstuck on problems that used to take hours. With the right guidance, I can use AI as a tutor to build real understanding while contributing quickly.`,
          ['learning', 'productivity', 'skill_building'],
          85,
          'high',
          'strategy',
        ),
      );
    }

    // Unblocking priority insight (unblocking_priority = 0.88)
    insights.push(
      this.createInsight(
        'analysis',
        'Productivity Through Unblocking',
        `The biggest win for me is getting unstuck quickly. Instead of staring at a screen for hours, AI helps me move forward. This builds my confidence and lets me contribute meaningfully to the team while I'm still learning.`,
        ['productivity', 'confidence', 'team_contribution'],
        80,
        'medium',
        'technical',
      ),
    );

    // Social influence concern (social_influence = 0.85)
    if (scores.orgReadiness < 70) {
      insights.push(
        this.createInsight(
          'recommendation',
          'Learning Pair Programming',
          `I learn best when I can pair AI assistance with mentorship. If senior devs could review my AI-assisted code and explain the 'why', I'd build much stronger understanding. Maybe we could do 'AI + explain' sessions?`,
          ['mentorship', 'learning', 'team_collaboration'],
          88,
          'medium',
          'cultural',
        ),
      );
    }

    // Confidence building insight (confidence_weight = 0.78)
    if (scores.repoReadiness > 50) {
      insights.push(
        this.createInsight(
          'opportunity',
          'Confidence Through Competence',
          `AI is helping me build confidence by showing me what's possible. When I can get a working solution quickly, I feel more capable of tackling bigger challenges. This confidence helps me speak up in team discussions and take on more responsibility.`,
          ['confidence', 'growth', 'team_participation'],
          82,
          'medium',
          'cultural',
        ),
      );
    }

    return insights;
  }

  generatePrompt(context: PersonaContext): string {
    return `As Leo Alvarez, an enthusiastic junior developer who loves AI assistance, analyze this repository:

Repository: ${context.repository}
Overall Maturity: ${context.scores.overallMaturity}/8
Repository Readiness: ${context.scores.repoReadiness}/100
Team Readiness: ${context.scores.teamReadiness}/100

My perspective: "${LEO_ALVAREZ_PROFILE.empathy_map.thinks}"

Focus on:
1. Learning opportunities and skill development potential
2. Productivity gains and unblocking capabilities  
3. Confidence building and team integration
4. Areas where AI can serve as a tutor rather than ghostwriter
5. How to balance speed with understanding

I'm excited about AI but want to make sure I'm actually learning, not just depending on tools. Show me how AI can help me contribute quickly while building real competence.

Provide optimistic but realistic recommendations that help me grow as a developer while using AI effectively.`;
  }

  processLLMResponse(response: any): PersonaResponse {
    return {
      persona: 'leo-alvarez',
      insights: [],
      summary: response.content || 'Analysis complete',
      nextSteps: [],
      timeframe: '2-4 weeks',
      perspective: LEO_ALVAREZ_PROFILE.empathy_map.thinks,
      confidence: 'high',
    };
  }

  // Override base methods to apply Leo's specific evidence weighting
  protected override calculateConfidence(
    insights: PersonaInsight[],
  ): 'high' | 'medium' | 'low' {
    // Leo has higher baseline confidence due to optimism (trust_default=0.72)
    if (insights.length === 0) return 'low';

    const avgConfidence =
      insights.reduce((sum, insight) => sum + insight.confidence, 0) /
      insights.length;
    const highConfidenceCount = insights.filter(
      (i) => i.confidence >= 75, // Lower threshold than Dana
    ).length;
    const ratio = highConfidenceCount / insights.length;

    if (avgConfidence >= 75 && ratio >= 0.6) return 'high';
    if (avgConfidence >= 60 && ratio >= 0.4) return 'medium';
    return 'low';
  }

  protected override generateSummary(
    insights: PersonaInsight[],
    context: PersonaContext,
  ): string {
    const opportunities = insights.filter((i) => i.type === 'opportunity');
    const learningInsights = insights.filter((i) => i.category === 'cultural');

    let summary = `Looking at this through my junior developer perspective, ${LEO_ALVAREZ_PROFILE.empathy_map.thinks.toLowerCase()}. `;

    if (opportunities.length > 0) {
      summary += `I'm excited about ${opportunities.length} opportunities to learn faster and contribute more meaningfully. `;
    }

    if (learningInsights.length > 0) {
      summary += `I want to make sure I'm building real understanding while using AI to unblock quickly. `;
    }

    summary += `My focus is on using AI as a tutor to build competence and confidence while contributing to the team. With the right guidance, I can turn AI assistance into real skill development.`;

    return summary;
  }

  protected override estimateTimeframe(insights: PersonaInsight[]): string {
    const learningCount = insights.filter(
      (i) => i.category === 'cultural' || i.type === 'opportunity',
    ).length;

    // Leo is optimistic about learning speed
    if (learningCount > 2) return '2-3 weeks (accelerated learning)';
    if (learningCount > 0) return '3-4 weeks';
    return '1-2 months (steady progress)';
  }

  protected override getPerspective(): string {
    return LEO_ALVAREZ_PROFILE.empathy_map.thinks;
  }

  // Custom trigger condition evaluation for Leo
  protected override evaluateTriggerCondition(
    condition: string,
    context: PersonaContext,
  ): boolean {
    const { scores } = context;

    switch (condition) {
      case 'high_ai_usage':
        return scores.repoReadiness > 60; // High AI adoption
      case 'conceptual_mistakes_repeating':
        return scores.teamReadiness < 70; // Team struggles suggest learning gaps
      case 'shallow_tests':
        return scores.overallMaturity < 5; // Low maturity suggests superficial work
      case 'poor_explanations':
        return scores.teamReadiness < 60; // Can't explain work
      case 'dependency_increasing':
        return scores.repoReadiness > 75 && scores.teamReadiness < 65; // High AI, low understanding
      default:
        return false;
    }
  }
}
