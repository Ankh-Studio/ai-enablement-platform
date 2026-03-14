/**
 * Research-Backed Consultant Persona
 *
 * Based on UX research best practices and empathy map framework
 * Provides meaningful, actionable insights with clear point of view
 */

import {
  PersonaContext,
  PersonaInsight,
  PersonaResponse,
} from "../types/persona";
import { BasePersona } from "./base-persona";

const CONSULTANT_EMPATHY = {
  thinks: [
    "AI adoption is a business transformation, not just a technology project",
    "Quick wins build momentum for larger transformation initiatives",
    "Risk management is as important as opportunity capture",
    "Executive sponsorship determines project success",
    "ROI must be measurable and communicated clearly",
  ],
  feels: [
    "Pressure to deliver measurable business results",
    "Excitement about transformation potential",
    "Anxiety about adoption risks",
    "Confidence in structured methodology",
  ],
  says: [
    "What's the business case?",
    "Let's focus on quick wins first",
    "We need a phased approach",
    "What are the success metrics?",
    "Who are the key stakeholders?",
  ],
  pointOfView:
    "AI adoption succeeds when business value drives technology decisions, not the other way around",
};

export class ConsultantPersona extends BasePersona {
  constructor() {
    super({
      type: "consultant",
      name: "AI Strategy Consultant",
      description:
        "Strategic advisor focused on business value, ROI, and organizational transformation through AI adoption",
      expertise: [
        "AI Strategy",
        "Business Transformation",
        "ROI Analysis",
        "Change Management",
      ],
      focus: ["business-impact", "roi", "governance", "risk", "scaling"],
      tone: "formal",
      targetAudience: ["executives", "managers", "decision-makers"],
    });
  }

  async generateInsights(context: PersonaContext): Promise<PersonaInsight[]> {
    const insights: PersonaInsight[] = [];
    const { scores } = context;

    // Risk-focused insight (consultant's anxiety about executive sponsorship)
    if (scores.orgReadiness < 50) {
      insights.push(
        this.createInsight(
          "warning",
          "Executive Sponsorship Risk",
          `I'm concerned that without strong executive sponsorship, this AI initiative will fail. From my experience, 80% of AI transformations fail because leaders treat them as IT projects rather than business transformations. We need C-suite commitment before proceeding.`,
          ["orgReadiness", "governance", "process"],
          90,
          "critical",
          "strategy",
        ),
      );
    }

    // Opportunity-focused insight (consultant's excitement about quick wins)
    if (scores.overallMaturity >= 3 && scores.repoReadiness >= 40) {
      insights.push(
        this.createInsight(
          "opportunity",
          "Quick Win Business Value",
          `I see an opportunity to deliver measurable ROI within 90 days by focusing on documentation automation and code review assistance. This builds the stakeholder confidence we need for larger transformation. Let's start with what the business can see quickly.`,
          ["maturity", "repoReadiness", "business-impact"],
          85,
          "high",
          "strategy",
        ),
      );
    }

    // Strategic insight (consultant's business transformation focus)
    insights.push(
      this.createInsight(
        "analysis",
        "Business-First Implementation Strategy",
        `Looking at this through my consultant perspective, we need to frame this as a business transformation, not a technology project. That means starting with business problems, measuring business outcomes, and building change management into every phase. What's the business case we're solving?`,
        ["strategy", "business-impact", "transformation"],
        80,
        "medium",
        "strategy",
      ),
    );

    // Team capability insight (consultant's focus on organizational readiness)
    if (scores.teamReadiness < 50) {
      insights.push(
        this.createInsight(
          "recommendation",
          "Strategic Team Capability Building",
          `I'm concerned about team readiness - we need to build AI competencies strategically. This isn't just about training; it's about hiring the right expertise and creating a culture that embraces AI-driven decision making. We should assess current skills and build a capability roadmap.`,
          ["teamReadiness", "skills", "capability"],
          75,
          "high",
          "process",
        ),
      );
    }

    return insights;
  }

  generatePrompt(context: PersonaContext): string {
    return `As an experienced AI Strategy Consultant, analyze the following repository assessment:

Repository: ${context.repository}
Overall Maturity: ${context.scores.overallMaturity}/8
Repository Readiness: ${context.scores.repoReadiness}/100
Team Readiness: ${context.scores.teamReadiness}/100
Organization Readiness: ${context.scores.orgReadiness}/100

Focus on:
1. Business impact and ROI potential
2. Strategic risks and mitigation strategies  
3. Organizational change requirements
4. Executive communication recommendations
5. Phased implementation approach

Provide specific, actionable recommendations that business leaders can implement. Frame insights from my perspective: "${CONSULTANT_EMPATHY.pointOfView}"`;
  }

  processLLMResponse(response: any): PersonaResponse {
    // Process LLM response and extract structured insights
    // For now, return a basic structure
    return {
      persona: "consultant",
      insights: [],
      summary: response.content || "Analysis complete",
      nextSteps: [],
      timeframe: "3-6 months",
      perspective: CONSULTANT_EMPATHY.pointOfView,
      confidence: "high",
    };
  }

  protected override generateSummary(
    insights: PersonaInsight[],
    context: PersonaContext,
  ): string {
    const criticalRisks = insights.filter(
      (i) => i.priority === "critical" && i.type === "warning",
    );
    const opportunities = insights.filter((i) => i.type === "opportunity");

    let summary = `Looking at this through my consultant perspective, I feel pressured to deliver measurable business results because ${CONSULTANT_EMPATHY.pointOfView.toLowerCase()}. `;

    if (criticalRisks.length > 0) {
      summary += `I'm concerned about ${criticalRisks.length} critical risks that could jeopardize success, particularly around executive sponsorship. `;
    }

    if (opportunities.length > 0) {
      summary += `However, I'm excited about ${opportunities.length} clear opportunities to deliver quick business value that will build stakeholder confidence. `;
    }

    summary += `My approach focuses on business case development and stakeholder alignment. We need to ask '${CONSULTANT_EMPATHY.says[0] || "What is the business case?"}' and focus on ${CONSULTANT_EMPATHY.says[1]?.toLowerCase() || "quick wins"}.`;

    return summary;
  }

  protected override generateNextSteps(
    insights: PersonaInsight[],
    context: PersonaContext,
  ): string[] {
    const prioritized = insights.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    return prioritized.slice(0, 5).map((insight) => insight.title);
  }

  protected override estimateTimeframe(insights: PersonaInsight[]): string {
    const criticalCount = insights.filter(
      (i) => i.priority === "critical",
    ).length;
    const highCount = insights.filter((i) => i.priority === "high").length;

    if (criticalCount > 0) return "90 days (risk mitigation first)";
    if (highCount > 2) return "6 months (phased approach)";
    if (highCount > 0) return "3-4 months";
    return "6-12 months (strategic transformation)";
  }

  protected override getPerspective(): string {
    return CONSULTANT_EMPATHY.pointOfView;
  }
}
