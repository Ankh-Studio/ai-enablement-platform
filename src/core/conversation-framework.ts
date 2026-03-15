/**
 * Conversation Framework Tools
 *
 * Provides structured discussion frameworks for organizational AI adoption conversations.
 * Helps facilitate difficult conversations using multi-perspective analysis insights.
 */

import type {
  ComparativeInsight,
  MultiPerspectiveResult,
  PersonaAnalysis,
} from './multi-perspective-engine';

export interface ConversationPrompt {
  id: string;
  title: string;
  description: string;
  type:
    | 'conflict-resolution'
    | 'consensus-building'
    | 'decision-making'
    | 'risk-assessment';
  participants: string[];
  questions: ConversationQuestion[];
  duration: string;
  objectives: string[];
}

export interface ConversationQuestion {
  id: string;
  text: string;
  type: 'open-ended' | 'ranking' | 'trade-off' | 'evidence-based';
  participants: string[];
  context: string;
  followUp: string[];
}

export interface ConversationAgenda {
  title: string;
  totalDuration: string;
  sections: ConversationSection[];
  materials: string[];
  preparation: string[];
}

export interface ConversationSection {
  title: string;
  duration: string;
  type:
    | 'introduction'
    | 'perspective-sharing'
    | 'analysis'
    | 'discussion'
    | 'decision'
    | 'action-planning';
  content: string;
  facilitatorNotes: string[];
  participantNotes: { [persona: string]: string[] };
}

export interface ConflictResolutionStrategy {
  conflict: string;
  personas: string[];
  resolutionApproach:
    | 'compromise'
    | 'data-driven'
    | 'stakeholder-prioritization'
    | 'phased-implementation';
  steps: string[];
  expectedOutcome: string;
  successMetrics: string[];
}

export class ConversationFramework {
  /**
   * Generate structured conversation prompts based on multi-perspective analysis
   */
  generateConversationPrompts(
    result: MultiPerspectiveResult,
  ): ConversationPrompt[] {
    const prompts: ConversationPrompt[] = [];

    // Conflict resolution prompts for identified conflicts
    result.conflictAreas.forEach((conflict) => {
      const conflictInsights = result.comparativeInsights.filter(
        (i) => i.topic === conflict,
      );

      if (conflictInsights.length > 0) {
        const insight = conflictInsights[0]; // Safe because we checked length > 0
        prompts.push(
          this.createConflictResolutionPrompt(conflict, insight, result),
        );
      }
    });

    // Consensus building prompts
    if (result.consensusAreas.length > 0) {
      prompts.push(this.createConsensusBuildingPrompt(result));
    }

    // Decision making prompt
    prompts.push(this.createDecisionMakingPrompt(result));

    // Risk assessment prompt
    prompts.push(this.createRiskAssessmentPrompt(result));

    return prompts;
  }

  /**
   * Generate complete conversation agenda
   */
  generateConversationAgenda(
    result: MultiPerspectiveResult,
  ): ConversationAgenda {
    const sections: ConversationSection[] = [];

    // Introduction
    sections.push({
      title: 'Welcome & Context Setting',
      duration: '15 min',
      type: 'introduction',
      content: `Review AI Enablement Platform analysis results for ${result.repository}. Establish conversation goals and ground rules.`,
      facilitatorNotes: [
        'Set psychological safety for open discussion',
        'Emphasize that all perspectives are valid',
        'Review analysis summary and key findings',
      ],
      participantNotes: this.generateParticipantIntroductions(
        result.personaAnalyses,
      ),
    });

    // Perspective sharing
    sections.push({
      title: 'Perspective Sharing',
      duration: '30 min',
      type: 'perspective-sharing',
      content:
        'Each stakeholder shares their perspective, concerns, and priorities based on the analysis.',
      facilitatorNotes: [
        'Give each persona 5-6 minutes to share',
        'Focus on "why" behind their position',
        'Encourage specific examples from analysis',
      ],
      participantNotes: this.generatePerspectiveSharingNotes(
        result.personaAnalyses,
      ),
    });

    // Comparative analysis
    sections.push({
      title: 'Comparative Analysis Discussion',
      duration: '25 min',
      type: 'analysis',
      content:
        'Review areas of agreement and disagreement. Identify root causes of conflicts.',
      facilitatorNotes: [
        'Focus on understanding, not convincing',
        'Use evidence from analysis to support discussion',
        'Identify shared values despite different approaches',
      ],
      participantNotes: this.generateAnalysisNotes(result),
    });

    // Conflict resolution
    if (result.conflictAreas.length > 0) {
      sections.push({
        title: 'Conflict Resolution Workshop',
        duration: '35 min',
        type: 'discussion',
        content: `Address ${result.conflictAreas.length} key conflict areas through structured problem-solving.`,
        facilitatorNotes: [
          'Tackle conflicts one at a time',
          'Use data and evidence to resolve disagreements',
          'Look for win-win solutions',
        ],
        participantNotes: this.generateConflictResolutionNotes(result),
      });
    }

    // Decision making
    sections.push({
      title: 'Decision Making & Action Planning',
      duration: '25 min',
      type: 'decision',
      content: 'Make decisions on AI adoption approach and create action plan.',
      facilitatorNotes: [
        'Ensure all voices are heard in decisions',
        'Document decisions and rationale',
        'Assign clear action items with owners',
      ],
      participantNotes: this.generateDecisionMakingNotes(result),
    });

    return {
      title: `AI Adoption Strategy Discussion - ${result.repository}`,
      totalDuration: '2 hours 10 min',
      sections,
      materials: [
        'Multi-perspective analysis report',
        'Persona perspective summaries',
        'Conflict area worksheets',
        'Decision framework template',
        'Action planning template',
      ],
      preparation: [
        'Review multi-perspective analysis report',
        'Prepare perspective summary (2-3 key points)',
        'Identify must-have vs nice-to-have outcomes',
        'Think about potential compromises',
      ],
    };
  }

  /**
   * Generate conflict resolution strategies
   */
  generateConflictResolutionStrategies(
    result: MultiPerspectiveResult,
  ): ConflictResolutionStrategy[] {
    const strategies: ConflictResolutionStrategy[] = [];

    result.conflictAreas.forEach((conflict) => {
      const conflictInsight = result.comparativeInsights.find(
        (i) => i.topic === conflict,
      );
      if (conflictInsight) {
        strategies.push(
          this.createConflictResolutionStrategy(
            conflict,
            conflictInsight,
            result,
          ),
        );
      }
    });

    return strategies;
  }

  private createConflictResolutionPrompt(
    conflict: string,
    insight: ComparativeInsight,
    result: MultiPerspectiveResult,
  ): ConversationPrompt {
    const personas = Object.keys(insight.personas);

    return {
      id: `conflict-${conflict.toLowerCase().replace(/\s+/g, '-')}`,
      title: `Resolving ${conflict} Differences`,
      description: `Structured discussion to find common ground on ${conflict} approaches`,
      type: 'conflict-resolution',
      participants: personas,
      questions: [
        {
          id: 'understanding',
          text: `What is your primary concern about ${conflict.toLowerCase()} in our AI adoption approach?`,
          type: 'open-ended',
          participants: personas,
          context: 'Focus on understanding underlying fears and motivations',
          followUp: [
            'What evidence supports your concern?',
            'What would make you feel more comfortable?',
          ],
        },
        {
          id: 'shared-values',
          text: 'Despite our different approaches, what values do we all share regarding AI adoption?',
          type: 'open-ended',
          participants: personas,
          context: 'Look for common ground',
          followUp: [
            'How can we honor these shared values?',
            'What principles should guide our decisions?',
          ],
        },
        {
          id: 'trade-offs',
          text: `What trade-offs are you willing to make on ${conflict.toLowerCase()} to address others' concerns?`,
          type: 'trade-off',
          participants: personas,
          context: 'Explore compromise opportunities',
          followUp: [
            'What is non-negotiable for you?',
            'What creative solutions might satisfy everyone?',
          ],
        },
        {
          id: 'evidence-based',
          text: 'What specific evidence from the analysis supports your position?',
          type: 'evidence-based',
          participants: personas,
          context: 'Use data to inform discussion',
          followUp: [
            'What additional evidence would be helpful?',
            'How can we measure success?',
          ],
        },
      ],
      duration: '45 min',
      objectives: [
        `Understand different perspectives on ${conflict}`,
        'Identify shared values and concerns',
        'Find compromise solutions',
        'Create action plan for implementation',
      ],
    };
  }

  private createConsensusBuildingPrompt(
    result: MultiPerspectiveResult,
  ): ConversationPrompt {
    return {
      id: 'consensus-building',
      title: 'Building on Agreement Areas',
      description: 'Strengthen consensus areas and expand agreement',
      type: 'consensus-building',
      participants: result.personaAnalyses.map((p) => p.persona),
      questions: [
        {
          id: 'success-factors',
          text: 'What makes our consensus areas work well?',
          type: 'open-ended',
          participants: result.personaAnalyses.map((p) => p.persona),
          context: 'Identify success factors to replicate',
          followUp: [
            'How can we apply these to conflict areas?',
            'What conditions enable agreement?',
          ],
        },
        {
          id: 'expansion-opportunities',
          text: 'How can we expand consensus to other areas?',
          type: 'open-ended',
          participants: result.personaAnalyses.map((p) => p.persona),
          context: 'Look for opportunities to broaden agreement',
          followUp: [
            'What small wins could build momentum?',
            'What information would help build consensus?',
          ],
        },
      ],
      duration: '30 min',
      objectives: [
        'Reinforce successful collaboration patterns',
        'Identify opportunities to expand agreement',
        'Create momentum for addressing conflicts',
      ],
    };
  }

  private createDecisionMakingPrompt(
    result: MultiPerspectiveResult,
  ): ConversationPrompt {
    return {
      id: 'decision-making',
      title: 'AI Adoption Strategy Decisions',
      description:
        'Make key decisions about AI adoption approach and priorities',
      type: 'decision-making',
      participants: result.personaAnalyses.map((p) => p.persona),
      questions: [
        {
          id: 'priorities',
          text: 'Based on the analysis, what should be our top 3 priorities for AI adoption?',
          type: 'ranking',
          participants: result.personaAnalyses.map((p) => p.persona),
          context: 'Prioritize recommendations from analysis',
          followUp: [
            'Why these priorities?',
            'What resources do they require?',
          ],
        },
        {
          id: 'timeline',
          text: 'What timeline makes sense for implementing these priorities?',
          type: 'open-ended',
          participants: result.personaAnalyses.map((p) => p.persona),
          context: 'Consider different persona timeframes',
          followUp: [
            'What are the risks of this timeline?',
            'What milestones should we track?',
          ],
        },
        {
          id: 'governance',
          text: 'How should we govern AI adoption going forward?',
          type: 'open-ended',
          participants: result.personaAnalyses.map((p) => p.persona),
          context: 'Create ongoing decision-making framework',
          followUp: ['Who should be involved?', 'How will we measure success?'],
        },
      ],
      duration: '40 min',
      objectives: [
        'Establish clear AI adoption priorities',
        'Create realistic implementation timeline',
        'Design governance framework',
        'Assign ownership and accountability',
      ],
    };
  }

  private createRiskAssessmentPrompt(
    result: MultiPerspectiveResult,
  ): ConversationPrompt {
    return {
      id: 'risk-assessment',
      title: 'AI Adoption Risk Assessment',
      description:
        'Identify and mitigate risks associated with AI adoption strategy',
      type: 'risk-assessment',
      participants: result.personaAnalyses.map((p) => p.persona),
      questions: [
        {
          id: 'risks',
          text: 'What are the biggest risks in our current AI adoption approach?',
          type: 'open-ended',
          participants: result.personaAnalyses.map((p) => p.persona),
          context: 'Consider technical, process, and cultural risks',
          followUp: [
            'How likely are these risks?',
            'What would be the impact?',
          ],
        },
        {
          id: 'mitigation',
          text: 'How can we mitigate these risks while maintaining our priorities?',
          type: 'open-ended',
          participants: result.personaAnalyses.map((p) => p.persona),
          context: 'Balance risk mitigation with progress',
          followUp: [
            'What early warning signs should we watch for?',
            'How will we monitor risks?',
          ],
        },
      ],
      duration: '35 min',
      objectives: [
        'Identify key AI adoption risks',
        'Develop mitigation strategies',
        'Create monitoring and response plan',
      ],
    };
  }

  private createConflictResolutionStrategy(
    conflict: string,
    insight: ComparativeInsight,
    result: MultiPerspectiveResult,
  ): ConflictResolutionStrategy {
    const personas = Object.keys(insight.personas);

    // Determine resolution approach based on conflict type
    let resolutionApproach: ConflictResolutionStrategy['resolutionApproach'];

    if (conflict.includes('Quality') || conflict.includes('Customer')) {
      resolutionApproach = 'stakeholder-prioritization';
    } else if (conflict.includes('Speed') || conflict.includes('Automation')) {
      resolutionApproach = 'phased-implementation';
    } else if (conflict.includes('Process') || conflict.includes('Team')) {
      resolutionApproach = 'compromise';
    } else {
      resolutionApproach = 'data-driven';
    }

    return {
      conflict,
      personas,
      resolutionApproach,
      steps: this.generateResolutionSteps(conflict, resolutionApproach),
      expectedOutcome: this.generateExpectedOutcome(
        conflict,
        resolutionApproach,
      ),
      successMetrics: this.generateSuccessMetrics(conflict, resolutionApproach),
    };
  }

  private generateResolutionSteps(
    conflict: string,
    approach: string,
  ): string[] {
    const baseSteps = [
      'Acknowledge and validate all perspectives',
      'Identify shared values and goals',
      'Gather additional evidence if needed',
    ];

    switch (approach) {
      case 'compromise':
        return [
          ...baseSteps,
          'Identify middle-ground solutions',
          'Create phased implementation plan',
          'Establish review checkpoints',
        ];
      case 'data-driven':
        return [
          ...baseSteps,
          'Define measurable success criteria',
          'Run small-scale experiments',
          'Use results to inform final decision',
        ];
      case 'stakeholder-prioritization':
        return [
          ...baseSteps,
          'Clarify stakeholder priorities',
          'Weight decisions by impact',
          'Create stakeholder communication plan',
        ];
      case 'phased-implementation':
        return [
          ...baseSteps,
          'Start with pilot program',
          'Gather feedback and adjust',
          'Scale successful approaches',
        ];
      default:
        return baseSteps;
    }
  }

  private generateExpectedOutcome(conflict: string, approach: string): string {
    switch (approach) {
      case 'compromise':
        return `Balanced solution that addresses key concerns of all stakeholders while maintaining progress on ${conflict.toLowerCase()}`;
      case 'data-driven':
        return `Evidence-based decision on ${conflict.toLowerCase()} approach supported by measurable outcomes`;
      case 'stakeholder-prioritization':
        return `${conflict} approach aligned with highest-priority stakeholder needs and organizational goals`;
      case 'phased-implementation':
        return `Gradual implementation of ${conflict.toLowerCase()} approach with continuous learning and adjustment`;
      default:
        return `Resolved approach to ${conflict.toLowerCase()} with stakeholder buy-in`;
    }
  }

  private generateSuccessMetrics(conflict: string, approach: string): string[] {
    const baseMetrics = [
      'Stakeholder satisfaction with resolution',
      'Implementation progress on timeline',
    ];

    switch (approach) {
      case 'compromise':
        return [
          ...baseMetrics,
          'Balance of competing priorities achieved',
          'Ongoing collaboration effectiveness',
        ];
      case 'data-driven':
        return [
          ...baseMetrics,
          'Measurable improvement in target metrics',
          'Quality of decision-making data',
        ];
      case 'stakeholder-prioritization':
        return [
          ...baseMetrics,
          'Key stakeholder needs met',
          'Organizational alignment achieved',
        ];
      case 'phased-implementation':
        return [
          ...baseMetrics,
          'Pilot program success metrics',
          'Scalability of solution',
        ];
      default:
        return baseMetrics;
    }
  }

  private generateParticipantIntroductions(analyses: PersonaAnalysis[]): {
    [persona: string]: string[];
  } {
    const notes: { [persona: string]: string[] } = {};

    analyses.forEach((analysis) => {
      notes[analysis.persona] = [
        `Share your perspective: "${analysis.perspective}"`,
        'Highlight 2-3 key insights from analysis',
        'Identify your top priority and concern',
        'Mention your preferred timeframe',
      ];
    });

    return notes;
  }

  private generatePerspectiveSharingNotes(analyses: PersonaAnalysis[]): {
    [persona: string]: string[];
  } {
    const notes: { [persona: string]: string[] } = {};

    analyses.forEach((analysis) => {
      notes[analysis.persona] = [
        'Focus on "why" behind your position',
        'Use specific evidence from analysis',
        'Explain your priority ordering',
        'Share your fears and hopes',
      ];
    });

    return notes;
  }

  private generateAnalysisNotes(result: MultiPerspectiveResult): {
    [persona: string]: string[];
  } {
    const notes: { [persona: string]: string[] } = {};

    result.personaAnalyses.forEach((analysis) => {
      notes[analysis.persona] = [
        'Listen for understanding, not rebuttal',
        'Ask clarifying questions',
        'Look for shared values in different positions',
        'Identify areas where you might shift your position',
      ];
    });

    return notes;
  }

  private generateConflictResolutionNotes(result: MultiPerspectiveResult): {
    [persona: string]: string[];
  } {
    const notes: { [persona: string]: string[] } = {};

    result.personaAnalyses.forEach((analysis) => {
      notes[analysis.persona] = [
        'Be open to compromise solutions',
        'Focus on interests, not positions',
        'Suggest creative solutions',
        "Consider what you're willing to trade",
      ];
    });

    return notes;
  }

  private generateDecisionMakingNotes(result: MultiPerspectiveResult): {
    [persona: string]: string[];
  } {
    const notes: { [persona: string]: string[] } = {};

    result.personaAnalyses.forEach((analysis) => {
      notes[analysis.persona] = [
        'Ensure your key concerns are addressed',
        'Commit to implementation decisions',
        'Identify your action items',
        'Agree on success metrics',
      ];
    });

    return notes;
  }
}
