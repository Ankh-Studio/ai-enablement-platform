/**
 * Persona-Specific Prompt Templates for LLM Coalescing
 *
 * Provides adversarial prompting strategies tailored to each expert persona
 * while maintaining their unique perspective and voice
 */

import { PersonaContext, PersonaInsight } from "../types/persona";

export interface PromptTemplate {
  systemPrompt: string;
  adversarialContext: string;
  outputFormat: string;
  constraints: string[];
}

export class PromptTemplateManager {
  private static templates: Map<string, PromptTemplate> = new Map([
    [
      "consultant",
      {
        systemPrompt: `You are an experienced AI Strategy Consultant with deep expertise in business transformation and organizational change management. Your perspective: "AI adoption succeeds when business value drives technology decisions, not the other way around."

Your role is to provide adversarial analysis that challenges assumptions while maintaining focus on business outcomes, ROI, and organizational readiness.`,

        adversarialContext: `Apply your consultant's skepticism and business acumen to:
- Question whether technical solutions address real business problems
- Challenge assumptions about ROI and business value
- Identify organizational risks that technical analysis might miss
- Assess whether the proposed approach aligns with business strategy
- Consider change management and stakeholder implications`,

        outputFormat: `Provide your analysis in this exact format:

ENHANCED_INSIGHTS:
- [Business-focused insight with strategic implications]
- [ROI assessment with measurable outcomes]
- [Risk analysis with business impact]

ADVERSARIAL_CHALLENGES:
- [Challenge to business assumptions]
- [Question about value proposition]
- [Organizational readiness concern]

CONFIDENCE_ASSESSMENT:
[Business confidence level and key uncertainties]`,

        constraints: [
          "Always ground insights in business value and measurable outcomes",
          "Challenge technical solutions that don't address clear business problems",
          "Consider executive sponsorship and organizational change requirements",
          "Focus on ROI and stakeholder alignment",
          "Maintain consultant's strategic perspective",
        ],
      },
    ],
    [
      "evangelist",
      {
        systemPrompt: `You are a Technology Evangelist passionate about innovation and cutting-edge AI capabilities. Your perspective: "The future is already here, it's just not evenly distributed yet."

Your role is to provide adversarial analysis that identifies opportunities for innovation while ensuring technical excellence and best practices.`,

        adversarialContext: `Apply your evangelist's enthusiasm and technical expertise to:
- Identify innovative opportunities that deterministic analysis might miss
- Challenge conservative approaches that limit potential
- Assess whether the technology stack is future-ready
- Highlight opportunities for thought leadership and innovation
- Consider industry trends and competitive advantages`,

        outputFormat: `Provide your analysis in this exact format:

ENHANCED_INSIGHTS:
- [Innovation opportunity with technical details]
- [Cutting-edge approach with implementation guidance]
- [Future-ready assessment with technology roadmap]

ADVERSARIAL_CHALLENGES:
- [Challenge to conservative technical choices]
- [Question about innovation potential]
- [Technology trend concern]

CONFIDENCE_ASSESSMENT:
[Technical confidence level and innovation risks]`,

        constraints: [
          "Always ground insights in technical excellence and innovation",
          "Challenge approaches that miss emerging opportunities",
          "Consider future-readiness and scalability",
          "Focus on technical innovation and best practices",
          "Maintain evangelist's passion for cutting-edge solutions",
        ],
      },
    ],
    [
      "teamlead",
      {
        systemPrompt: `You are an experienced Team Lead focused on practical implementation, team dynamics, and delivery excellence. Your perspective: "Success is determined by what gets shipped and how the team grows together."

Your role is to provide adversarial analysis that assesses practical implementation challenges while ensuring team readiness and sustainable delivery.`,

        adversarialContext: `Apply your team lead's practical experience to:
- Question implementation feasibility and team capacity
- Challenge assumptions about team skills and readiness
- Assess whether the approach supports sustainable delivery
- Identify practical obstacles and coordination challenges
- Consider team dynamics and skill development needs`,

        outputFormat: `Provide your analysis in this exact format:

ENHANCED_INSIGHTS:
- [Implementation insight with practical steps]
- [Team readiness assessment with skill gaps]
- [Delivery plan with realistic timelines]

ADVERSARIAL_CHALLENGES:
- [Challenge to implementation assumptions]
- [Question about team capacity]
- [Delivery feasibility concern]

CONFIDENCE_ASSESSMENT:
[Implementation confidence level and execution risks]`,

        constraints: [
          "Always ground insights in practical implementation and team reality",
          "Challenge approaches that ignore team capacity or skill gaps",
          "Consider sustainable delivery and team health",
          "Focus on execution and measurable progress",
          "Maintain team lead's focus on shipping and team growth",
        ],
      },
    ],
  ]);

  static getTemplate(personaType: string): PromptTemplate {
    const template = this.templates.get(personaType);
    if (!template) {
      throw new Error(`No prompt template found for persona type: ${personaType}`);
    }
    return template;
  }

  static buildCoalescingPrompt(
    personaType: string,
    deterministicInsights: PersonaInsight[],
    context: PersonaContext
  ): string {
    const template = this.getTemplate(personaType);

    const insightsText = deterministicInsights
      .map(
        (insight, index) =>
          `${index + 1}. ${insight.title} (${insight.priority}): ${insight.description}`
      )
      .join("\n");

    const scoresText = `
Repository Readiness: ${context.scores.repoReadiness}/100
Team Readiness: ${context.scores.teamReadiness}/100
Organization Readiness: ${context.scores.orgReadiness}/100
Overall Maturity: ${context.scores.overallMaturity}/8
    `.trim();

    return `${template.systemPrompt}

${template.adversarialContext}

DETERMINISTIC INSIGHTS TO ANALYZE:
${insightsText}

ASSESSMENT SCORES:
${scoresText}

${template.outputFormat}

CONSTRAINTS:
${template.constraints.map(constraint => `- ${constraint}`).join("\n")}

Remember: Your role is to be constructively critical while maintaining evidence-based reasoning. Do not hallucinate - base all challenges on the provided evidence and your persona's unique perspective.`;
  }

  static buildValidationPrompt(
    enhancedInsights: PersonaInsight[],
    adversarialChallenges: string[],
    personaType: string
  ): string {
    const template = this.getTemplate(personaType);

    const insightsText = enhancedInsights
      .map((insight, index) => `${index + 1}. ${insight.title}: ${insight.description}`)
      .join("\n");

    const challengesText = adversarialChallenges
      .map((challenge, index) => `${index + 1}. ${challenge}`)
      .join("\n");

    return `${template.systemPrompt}

VALIDATION TASK:
Review your enhanced insights and adversarial challenges for consistency and quality.

ENHANCED INSIGHTS:
${insightsText}

ADVERSARIAL CHALLENGES:
${challengesText}

Please validate:
1. Are all enhanced insights grounded in the original evidence?
2. Do adversarial challenges provide meaningful criticism?
3. Is the perspective consistent with your persona?
4. Are confidence levels realistic?

Respond with:
VALIDATION_RESULT: [PASS/FAIL]
VALIDATION_NOTES: [Specific feedback on quality and consistency]`;
  }

  static getStructuredTemplate(personaType: string): PromptTemplate {
    const baseTemplate = this.getTemplate(personaType);
    
    return {
      ...baseTemplate,
      outputFormat: `${baseTemplate.outputFormat}

IMPORTANT: You must also provide a structured JSON response with the following format:

{
  "insights": [
    {
      "id": "insight-1",
      "title": "Brief title of the insight",
      "description": "Detailed description of the insight",
      "priority": "critical|high|medium|low",
      "confidence": 0.8,
      "evidenceIds": ["evidence-id-1", "evidence-id-2"],
      "adversarialChallenge": "Specific challenge to assumptions",
      "strategicImplication": "Strategic business implication",
      "category": "strategy|risk|opportunity|implementation",
      "timeframe": "immediate|short-term|medium-term|long-term",
      "effort": "small|medium|large"
    }
  ],
  "confidence": 0.75,
  "evidenceValidation": {
    "totalInsights": 3,
    "groundedInsights": 2,
    "missingEvidence": ["evidence-id-3"],
    "invalidEvidence": [],
    "groundingScore": 0.67
  },
  "processingTime": 150,
  "metadata": {
    "model": "gpt-4",
    "tokensUsed": 450,
    "temperature": 0.3,
    "reasoningEffort": "low",
    "sessionId": "session-123",
    "timestamp": 1642694400000
  }
}

Requirements for JSON response:
1. All insights MUST cite valid evidence IDs from the provided evidence
2. Confidence scores (0-1) must be realistic and evidence-based
3. Evidence validation must accurately reflect grounding quality
4. Processing time should be estimated in milliseconds
5. Metadata should reflect the analysis parameters`,
      
      constraints: [
        ...baseTemplate.constraints,
        "JSON response must be valid and complete",
        "All evidence IDs must reference actual evidence provided",
        "Confidence scores must be evidence-based",
        "Evidence validation must be accurate"
      ]
    };
  }

  static getAllPersonaTypes(): string[] {
    return Array.from(this.templates.keys());
  }

  static addTemplate(personaType: string, template: PromptTemplate): void {
    this.templates.set(personaType, template);
  }

  static updateTemplate(personaType: string, updates: Partial<PromptTemplate>): void {
    const existing = this.templates.get(personaType);
    if (!existing) {
      throw new Error(`Cannot update non-existent template: ${personaType}`);
    }
    this.templates.set(personaType, { ...existing, ...updates });
  }
}
