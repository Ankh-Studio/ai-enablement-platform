/**
 * Multi-Perspective Analysis Engine
 *
 * Brings all 5 research-backed personas together for comprehensive adversarial analysis.
 * Generates "one signal, five interpretations" reports for organizational AI adoption conversations.
 */

import { BenOkaforPersona } from '../personas/ben-okafor-persona';
import { DanaShahPersona } from '../personas/dana-shah-persona';
import { LeoAlvarezPersona } from '../personas/leo-alvarez-persona';
import { PriyaNairPersona } from '../personas/priya-nair-persona';
import { TashaReedPersona } from '../personas/tasha-reed-persona';
import type { PersonaContext, PersonaInsight } from '../types/persona';

export interface MultiPerspectiveResult {
  repository: string;
  analysisContext: {
    repoReadiness: number;
    teamReadiness: number;
    orgReadiness: number;
    overallMaturity: number;
  };
  personaAnalyses: PersonaAnalysis[];
  comparativeInsights: ComparativeInsight[];
  consensusAreas: string[];
  conflictAreas: string[];
  recommendations: MultiPerspectiveRecommendation[];
}

export interface PersonaAnalysis {
  persona: string;
  perspective: string;
  confidence: string;
  timeframe: string;
  insights: PersonaInsight[];
  summary: string;
  nextSteps: string[];
}

export interface ComparativeInsight {
  topic: string;
  personas: {
    [personaName: string]: {
      position: string;
      priority: string;
      evidence: string[];
    };
  };
  consensus: 'strong' | 'moderate' | 'none' | 'conflict';
  explanation: string;
}

export interface MultiPerspectiveRecommendation {
  title: string;
  description: string;
  supportingPersonas: string[];
  opposingPersonas: string[];
  priority: 'high' | 'medium' | 'low';
  category: 'technical' | 'process' | 'strategy' | 'cultural';
  rationale: string;
}

export class MultiPerspectiveEngine {
  private personas: any[];

  constructor() {
    this.personas = [
      new DanaShahPersona(),
      new LeoAlvarezPersona(),
      new PriyaNairPersona(),
      new TashaReedPersona(),
      new BenOkaforPersona(),
    ];
  }

  async analyzeRepository(
    context: PersonaContext,
  ): Promise<MultiPerspectiveResult> {
    console.log('🔍 Starting Multi-Perspective Analysis...');

    // Get analysis from all personas
    const personaAnalyses: PersonaAnalysis[] = [];

    for (const persona of this.personas) {
      const insights = await persona.generateInsights(context);
      const response = await persona.analyze(context);

      personaAnalyses.push({
        persona: persona.config.name,
        perspective: persona.getPerspective(),
        confidence: response.confidence,
        timeframe: response.timeframe,
        insights,
        summary: response.summary,
        nextSteps: response.nextSteps,
      });
    }

    // Generate comparative insights
    const comparativeInsights =
      this.generateComparativeInsights(personaAnalyses);

    // Identify consensus and conflict areas
    const consensusAreas = this.identifyConsensusAreas(comparativeInsights);
    const conflictAreas = this.identifyConflictAreas(comparativeInsights);

    // Generate multi-perspective recommendations
    const recommendations = this.generateRecommendations(
      personaAnalyses,
      comparativeInsights,
    );

    return {
      repository: context.repository,
      analysisContext: {
        repoReadiness: context.scores.repoReadiness,
        teamReadiness: context.scores.teamReadiness,
        orgReadiness: context.scores.orgReadiness,
        overallMaturity: context.scores.overallMaturity,
      },
      personaAnalyses,
      comparativeInsights,
      consensusAreas,
      conflictAreas,
      recommendations,
    };
  }

  private generateComparativeInsights(
    analyses: PersonaAnalysis[],
  ): ComparativeInsight[] {
    const insights: ComparativeInsight[] = [];

    // Group insights by topic/theme
    const topicGroups = this.groupInsightsByTopic(analyses);

    for (const [topic, personaInsights] of topicGroups.entries()) {
      const personas: any = {};

      for (const analysis of analyses) {
        const relevantInsights = personaInsights.get(analysis.persona) || [];
        if (relevantInsights.length > 0) {
          personas[analysis.persona] = {
            position: relevantInsights[0].description.substring(0, 100),
            priority: relevantInsights[0].priority,
            evidence: relevantInsights[0].evidence,
          };
        }
      }

      // Determine consensus level
      const consensus = this.determineConsensusLevel(personas);
      const explanation = this.generateConsensusExplanation(
        personas,
        consensus,
      );

      insights.push({
        topic,
        personas,
        consensus,
        explanation,
      });
    }

    return insights;
  }

  private groupInsightsByTopic(
    analyses: PersonaAnalysis[],
  ): Map<string, Map<string, PersonaInsight[]>> {
    const topicGroups = new Map<string, Map<string, PersonaInsight[]>>();

    // Common themes to look for
    const themes = [
      'AI Adoption Speed',
      'Code Quality',
      'Team Collaboration',
      'Customer Impact',
      'Process Stability',
      'Learning & Development',
      'Automation',
      'Risk Management',
    ];

    themes.forEach((theme) => {
      const personaInsights = new Map<string, PersonaInsight[]>();

      analyses.forEach((analysis) => {
        const relevantInsights = analysis.insights.filter((insight) =>
          this.isInsightRelevantToTheme(insight, theme),
        );

        if (relevantInsights.length > 0) {
          personaInsights.set(analysis.persona, relevantInsights);
        }
      });

      if (personaInsights.size > 1) {
        // Only include themes with multiple perspectives
        topicGroups.set(theme, personaInsights);
      }
    });

    return topicGroups;
  }

  private isInsightRelevantToTheme(
    insight: PersonaInsight,
    theme: string,
  ): boolean {
    const themeKeywords: { [key: string]: string[] } = {
      'AI Adoption Speed': [
        'speed',
        'fast',
        'quick',
        'acceleration',
        'productivity',
      ],
      'Code Quality': [
        'quality',
        'maintainability',
        'technical debt',
        'standards',
      ],
      'Team Collaboration': [
        'team',
        'collaboration',
        'coordination',
        'communication',
      ],
      'Customer Impact': ['customer', 'user', 'experience', 'market'],
      'Process Stability': ['process', 'workflow', 'stability', 'predictable'],
      'Learning & Development': [
        'learning',
        'skill',
        'development',
        'training',
      ],
      Automation: ['automation', 'tooling', 'efficiency', 'manual'],
      'Risk Management': ['risk', 'safety', 'security', 'concern'],
    };

    const keywords = themeKeywords[theme] || [];
    const text = (insight.title + ' ' + insight.description).toLowerCase();

    return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
  }

  private determineConsensusLevel(personas: { [key: string]: any }):
    | 'strong'
    | 'moderate'
    | 'none'
    | 'conflict' {
    const positions = Object.values(personas).map((p) => p.position);

    if (positions.length === 0) return 'none';

    // Check for strong consensus (all similar)
    const firstPosition = positions[0];
    const similarPositions = positions.filter((p) =>
      p.toLowerCase().includes(firstPosition.toLowerCase().substring(0, 20)),
    );

    if (similarPositions.length === positions.length) {
      return 'strong';
    }

    // Check for moderate consensus (majority similar)
    if (similarPositions.length >= Math.ceil(positions.length * 0.6)) {
      return 'moderate';
    }

    // Check for conflict (opposing positions)
    const opposingPositions = positions.filter(
      (p) =>
        !p.toLowerCase().includes(firstPosition.toLowerCase().substring(0, 20)),
    );

    if (opposingPositions.length >= Math.ceil(positions.length * 0.4)) {
      return 'conflict';
    }

    return 'none';
  }

  private generateConsensusExplanation(
    personas: { [key: string]: any },
    consensus: string,
  ): string {
    const personaNames = Object.keys(personas);

    switch (consensus) {
      case 'strong':
        return `All ${personaNames.length} personas agree on this approach.`;
      case 'moderate':
        return `${Math.ceil(personaNames.length * 0.6)}+ personas show alignment with some variations.`;
      case 'conflict':
        return `Significant disagreement between personas requires resolution.`;
      case 'none':
        return `Diverse perspectives with no clear consensus pattern.`;
      default:
        return 'Mixed perspectives on this topic.';
    }
  }

  private identifyConsensusAreas(insights: ComparativeInsight[]): string[] {
    return insights
      .filter((insight) => insight.consensus === 'strong')
      .map((insight) => insight.topic);
  }

  private identifyConflictAreas(insights: ComparativeInsight[]): string[] {
    return insights
      .filter((insight) => insight.consensus === 'conflict')
      .map((insight) => insight.topic);
  }

  private generateRecommendations(
    analyses: PersonaAnalysis[],
    comparativeInsights: ComparativeInsight[],
  ): MultiPerspectiveRecommendation[] {
    const recommendations: MultiPerspectiveRecommendation[] = [];

    // Find high-priority insights that have broad support
    const priorityInsights = analyses.flatMap((analysis) =>
      analysis.insights.filter((insight) => insight.priority === 'high'),
    );

    // Group similar recommendations
    const recommendationGroups =
      this.groupSimilarRecommendations(priorityInsights);

    for (const [title, insights] of recommendationGroups.entries()) {
      const supportingPersonas = insights
        .map((i) => this.findPersonaForInsight(analyses, i))
        .filter(Boolean);
      const opposingPersonas = this.findOpposingPersonas(analyses, insights[0]);

      recommendations.push({
        title,
        description: insights[0].description,
        supportingPersonas: supportingPersonas.filter(Boolean) as string[],
        opposingPersonas,
        priority: 'high',
        category: insights[0].category as any,
        rationale: `Supported by ${supportingPersonas.length}/5 personas with strong evidence alignment.`,
      });
    }

    return recommendations;
  }

  private groupSimilarRecommendations(
    insights: PersonaInsight[],
  ): Map<string, PersonaInsight[]> {
    const groups = new Map<string, PersonaInsight[]>();

    insights.forEach((insight) => {
      const key = this.generateRecommendationKey(insight);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(insight);
    });

    return groups;
  }

  private generateRecommendationKey(insight: PersonaInsight): string {
    // Simple grouping by type and category
    return `${insight.type}-${insight.category}`;
  }

  private findPersonaForInsight(
    analyses: PersonaAnalysis[],
    insight: PersonaInsight,
  ): string | null {
    for (const analysis of analyses) {
      if (analysis.insights.some((i) => i.title === insight.title)) {
        return analysis.persona;
      }
    }
    return null;
  }

  private findOpposingPersonas(
    analyses: PersonaAnalysis[],
    insight: PersonaInsight,
  ): string[] {
    // Find personas who have insights with opposite priorities
    return analyses
      .filter((analysis) =>
        analysis.insights.some(
          (i) => i.category === insight.category && i.priority === 'low',
        ),
      )
      .map((analysis) => analysis.persona);
  }

  generateReport(result: MultiPerspectiveResult): string {
    let report = '';

    report += '# Multi-Perspective AI Adoption Analysis\n\n';
    report += `Repository: ${result.repository}\n`;
    report += `Analysis Date: ${new Date().toISOString().split('T')[0]}\n\n`;

    report += '## 📊 Repository Context\n';
    report += `- AI Adoption: ${result.analysisContext.repoReadiness}/100\n`;
    report += `- Team Readiness: ${result.analysisContext.teamReadiness}/100\n`;
    report += `- Org Readiness: ${result.analysisContext.orgReadiness}/100\n`;
    report += `- Overall Maturity: ${result.analysisContext.overallMaturity}/8\n\n`;

    report += '## 👥 Persona Perspectives\n\n';

    result.personaAnalyses.forEach((analysis) => {
      report += `### ${analysis.persona}\n`;
      report += `**Perspective:** "${analysis.perspective}"\n`;
      report += `**Confidence:** ${analysis.confidence} | **Timeframe:** ${analysis.timeframe}\n`;
      report += `**Key Insights:**\n`;

      analysis.insights.slice(0, 2).forEach((insight, i) => {
        report += `${i + 1}. **[${insight.type.toUpperCase()}]** ${insight.title}\n`;
        report += `   - Priority: ${insight.priority} | Confidence: ${insight.confidence}%\n`;
        report += `   - ${insight.description}\n`;
      });

      report += `**Summary:** ${analysis.summary}\n\n`;
    });

    report += '## 🔄 Comparative Analysis\n\n';

    result.comparativeInsights.forEach((insight) => {
      report += `### ${insight.topic}\n`;
      report += `**Consensus Level:** ${insight.consensus.toUpperCase()}\n`;
      report += `**Explanation:** ${insight.explanation}\n\n`;
    });

    report += '## ✅ Consensus Areas\n';
    if (result.consensusAreas.length > 0) {
      result.consensusAreas.forEach((area) => {
        report += `- ${area}\n`;
      });
    } else {
      report += 'No strong consensus areas identified.\n';
    }
    report += '\n';

    report += '## ⚠️ Conflict Areas\n';
    if (result.conflictAreas.length > 0) {
      result.conflictAreas.forEach((area) => {
        report += `- ${area}\n`;
      });
    } else {
      report += 'No significant conflicts identified.\n';
    }
    report += '\n';

    report += '## 🎯 Recommendations\n\n';

    result.recommendations.forEach((rec, i) => {
      report += `${i + 1}. **${rec.title}** (${rec.priority} priority)\n`;
      report += `   **Category:** ${rec.category}\n`;
      report += `   **Supporting:** ${rec.supportingPersonas.join(', ')}\n`;
      if (rec.opposingPersonas.length > 0) {
        report += `   **Opposing:** ${rec.opposingPersonas.join(', ')}\n`;
      }
      report += `   **Rationale:** ${rec.rationale}\n`;
      report += `   ${rec.description}\n\n`;
    });

    report += '---\n';
    report +=
      '*Generated by AI Enablement Platform Multi-Perspective Engine*\n';

    return report;
  }
}
