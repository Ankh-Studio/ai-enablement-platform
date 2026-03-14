/**
 * ADR Generator
 *
 * Generates professional Architecture Decision Records for AI enablement
 * based on analysis results and evidence
 */

import { TechStackAnalysis } from "../analyzers/tech-stack-analyzer";
import { EvidenceData } from "../collectors/evidence-collector";
import { Recommendation } from "../core/assessment-engine";
import { CopilotFeatureAnalysis } from "../scanners/copilot-feature-scanner";
import { ReadinessScores } from "../scorers/readiness-scorer";

export interface ADRContext {
  scores: ReadinessScores;
  copilotFeatures: CopilotFeatureAnalysis;
  techStack: TechStackAnalysis;
  evidence: EvidenceData;
  recommendations: Recommendation[];
}

export class ADRGenerator {
  async generate(context: ADRContext): Promise<string> {
    const { scores, copilotFeatures, techStack, evidence, recommendations } =
      context;

    const timestamp = new Date().toISOString().split("T")[0];
    const adrNumber = this.generateADRNumber();

    const adr = `# ADR-${adrNumber}: AI Enablement Strategy

## Status
Accepted

## Context
This Architecture Decision Record outlines the strategic approach for AI enablement across the organization based on comprehensive repository analysis conducted on ${timestamp}.

### Current State Assessment

**Readiness Scores:**
- Repository Readiness: ${scores.repoReadiness}/100 (${this.getScoreDescription(scores.repoReadiness)})
- Team Readiness: ${scores.teamReadiness}/100 (${this.getScoreDescription(scores.teamReadiness)})
- Organization Readiness: ${scores.orgReadiness}/100 (${this.getScoreDescription(scores.orgReadiness)})
- Overall Maturity Level: ${scores.overallMaturity}/8 (${this.getMaturityDescription(scores.overallMaturity)})

**Technology Stack:**
- Primary Language: ${techStack.languages.primary}
- Frameworks: ${techStack.languages.frameworks.join(", ") || "None detected"}
- AI Dependencies: ${techStack.dependencies.aiRelated.length} found
- Package Manager: ${techStack.infrastructure.packageManager}

**AI Integration Status:**
- Copilot Instructions: ${copilotFeatures.githubFeatures.copilotInstructions.found ? "✅ Present" : "❌ Missing"}
- Code Ownership: ${copilotFeatures.githubFeatures.codeowners.found ? "✅ Defined" : "❌ Undefined"}
- PR Templates: ${copilotFeatures.githubFeatures.prTemplates.found ? "✅ Present" : "❌ Missing"}
- Issue Templates: ${copilotFeatures.githubFeatures.issueTemplates.found ? "✅ Present" : "❌ Missing"}

## Decision
We will implement a phased AI enablement strategy that prioritizes foundation improvements, security enhancements, and gradual AI tool adoption. This approach balances immediate value delivery with long-term sustainability.

### Strategic Approach

1. **Foundation First** (${scores.breakdown.foundation}/100)
   - Establish robust development practices
   - Implement comprehensive documentation
   - Standardize tooling and configuration

2. **Security by Design** (${scores.breakdown.security}/100)
   - Define code ownership and review processes
   - Implement security scanning and monitoring
   - Establish governance frameworks

3. **Workflow Optimization** (${scores.breakdown.workflow}/100)
   - Automate repetitive tasks
   - Enhance collaboration processes
   - Improve code review efficiency

4. **AI Integration** (${scores.breakdown.ai}/100)
   - Adopt AI coding assistants strategically
   - Implement AI-friendly development practices
   - Monitor AI tool effectiveness

5. **Governance Evolution** (${scores.breakdown.governance}/100)
   - Establish clear decision-making processes
   - Create feedback loops and improvement mechanisms
   - Align AI adoption with business objectives

## Rationale

### Why This Approach

**Evidence-Based Decision Making:**
- Current maturity level (${scores.overallMaturity}/8) indicates ${this.getMaturityDescription(scores.overallMaturity)} readiness
- Repository readiness score of ${scores.repoReadiness}/100 suggests ${this.getScoreDescription(scores.repoReadiness)} foundation
- Team readiness of ${scores.teamReadiness}/100 shows ${this.getScoreDescription(scores.teamReadiness)} preparation for change

**Risk Mitigation:**
${this.generateRiskRationale(scores, evidence)}

**Value Maximization:**
${this.generateValueRationale(techStack, copilotFeatures)}

### Alternative Approaches Considered

1. **Aggressive AI Adoption**
   - *Pros*: Faster AI benefits realization
   - *Cons*: Higher risk of disruption, potential resistance
   - *Rejected*: Current foundation (${scores.repoReadiness}/100) insufficient for aggressive approach

2. **Minimal AI Integration**
   - *Pros*: Lower risk, minimal disruption
   - *Cons*: Slower value realization, competitive disadvantage
   - *Rejected*: Team readiness (${scores.teamReadiness}/100) supports more comprehensive adoption

3. **External Consultant-Led Transformation**
   - *Pros*: Expert guidance, faster execution
   - *Cons*: Higher cost, reduced internal capability building
   - *Rejected*: Current team capabilities support internal-led approach

## Implementation Plan

### Phase 1: Foundation Strengthening (30 days)
${this.generatePhaseImplementation(recommendations.filter((r) => r.category === "foundation"))}

### Phase 2: Security & Governance (45 days)
${this.generatePhaseImplementation(recommendations.filter((r) => r.category === "security" || r.category === "governance"))}

### Phase 3: AI Tool Integration (60 days)
${this.generatePhaseImplementation(recommendations.filter((r) => r.category === "ai" || r.category === "workflow"))}

### Phase 4: Optimization & Scaling (90 days)
- Monitor AI tool effectiveness
- Refine processes based on feedback
- Scale successful practices across organization
- Establish continuous improvement cycles

## Success Metrics

### Technical Metrics
- Repository Readiness: Target ${Math.min(scores.repoReadiness + 20, 95)}/100
- Team Readiness: Target ${Math.min(scores.teamReadiness + 25, 95)}/100
- Organization Readiness: Target ${Math.min(scores.orgReadiness + 15, 95)}/100
- Overall Maturity: Target ${Math.min(scores.overallMaturity + 2, 8)}/8

### Process Metrics
- Code review time reduction: Target 30%
- Developer satisfaction: Target 4.5/5
- AI tool adoption rate: Target 80%
- Documentation coverage: Target 75%

### Business Metrics
- Development velocity: Target 25% improvement
- Code quality: Target 40% reduction in defects
- Onboarding time: Target 50% reduction
- Knowledge sharing: Target 60% improvement

## Monitoring & Review

### Key Performance Indicators
${this.generateKPIs(scores, techStack)}

### Review Cadence
- **Weekly**: Team readiness metrics and AI tool usage
- **Monthly**: Repository health and security posture
- **Quarterly**: Strategic alignment and business impact
- **Semi-annually**: Complete ADR review and strategy adjustment

### Success Triggers
- Repository readiness exceeds 80/100
- Team readiness exceeds 75/100
- AI tool adoption rate exceeds 70%
- Developer satisfaction exceeds 4.0/5

### Risk Indicators
- Repository readiness declines below 50/100
- Team readiness declines below 60/100
- AI tool resistance exceeds 30%
- Security incidents increase

## Consequences

### Positive Outcomes
- Improved development efficiency and quality
- Enhanced team collaboration and knowledge sharing
- Better alignment between technology and business objectives
- Increased competitive advantage through AI adoption

### Negative Consequences
- Initial learning curve and productivity dip
- Required investment in tools and training
- Potential resistance to change
- Ongoing maintenance and governance requirements

### Mitigation Strategies
${this.generateMitigationStrategies(recommendations)}

## References

### Analysis Data
- Repository Analysis: ${evidence.structure.fileCount} files analyzed
- Technology Stack: ${techStack.dependencies.total} dependencies identified
- Evidence Collection: ${evidence.metrics.linesOfCode} lines of code reviewed

### Best Practices
- [GitLab's AI Adoption Framework](https://docs.gitlab.com/ee/topics/ai/)
- [Microsoft's AI Development Guidelines](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/)
- [GitHub Copilot Best Practices](https://docs.github.com/en/copilot)

### Industry Standards
- [Software Engineering Institute - AI Readiness](https://www.sei.cmu.edu/)
- [IEEE AI Ethics Standards](https://standards.ieee.org/)
- [OWASP AI Security Guidelines](https://owasp.org/)

---

**Generated**: ${timestamp}  
**Analysis Version**: 1.0.0  
**Confidence Level**: ${scores.confidence}  
**Next Review**: ${this.calculateNextReviewDate()}

*This ADR was generated automatically based on repository analysis and should be reviewed by the technical leadership team before implementation.*`;

    return adr;
  }

  private generateADRNumber(): string {
    // Simple sequential numbering - in production this would track existing ADRs
    return "001";
  }

  private getScoreDescription(score: number): string {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  }

  private getMaturityDescription(level: number): string {
    if (level >= 6) return "Advanced";
    if (level >= 4) return "Developing";
    if (level >= 2) return "Basic";
    return "Initial";
  }

  private generateRiskRationale(
    scores: ReadinessScores,
    evidence: EvidenceData,
  ): string {
    const risks: string[] = [];

    if (scores.repoReadiness < 60) {
      risks.push(
        "- Repository foundation requires strengthening before AI adoption",
      );
    }

    if (scores.breakdown.security < 70) {
      risks.push(
        "- Security posture needs enhancement to support AI tools safely",
      );
    }

    if (evidence.patterns.codeComplexity === "high") {
      risks.push(
        "- High code complexity may slow AI tool adoption and effectiveness",
      );
    }

    if (!evidence.configuration.hasTests) {
      risks.push(
        "- Lack of testing infrastructure increases risk of AI-generated code issues",
      );
    }

    return risks.length > 0
      ? risks.join("\n")
      : "- Current risk profile supports measured AI adoption";
  }

  private generateValueRationale(
    techStack: TechStackAnalysis,
    copilotFeatures: CopilotFeatureAnalysis,
  ): string {
    const values: string[] = [];

    if (techStack.aiReadiness.typescriptUsage) {
      values.push(
        "- TypeScript usage enhances AI code understanding and generation",
      );
    }

    if (techStack.aiReadiness.modernFramework) {
      values.push(
        "- Modern framework adoption aligns well with AI coding assistants",
      );
    }

    if (techStack.dependencies.aiRelated.length > 0) {
      values.push(
        `- Existing AI dependencies (${techStack.dependencies.aiRelated.length}) demonstrate team openness to AI tools`,
      );
    }

    if (copilotFeatures.githubFeatures.copilotInstructions.found) {
      values.push(
        "- Existing Copilot instructions show team experience with AI assistance",
      );
    }

    return values.length > 0
      ? values.join("\n")
      : "- Technology stack provides good foundation for AI enablement";
  }

  private generatePhaseImplementation(
    recommendations: Recommendation[],
  ): string {
    if (recommendations.length === 0) {
      return "- No specific actions identified for this phase\n- Focus on monitoring and optimization";
    }

    return recommendations
      .map(
        (rec) =>
          `- **${rec.title}** (${rec.effort} effort, ${rec.timeframe || "TBD"})\n  - ${rec.description}`,
      )
      .join("\n");
  }

  private generateKPIs(
    scores: ReadinessScores,
    techStack: TechStackAnalysis,
  ): string {
    const kpis: string[] = [];

    if (scores.repoReadiness < 80) {
      kpis.push(
        `- Repository readiness improvement: Current ${scores.repoReadiness}/100 → Target 80/100`,
      );
    }

    if (scores.teamReadiness < 75) {
      kpis.push(
        `- Team readiness enhancement: Current ${scores.teamReadiness}/100 → Target 75/100`,
      );
    }

    if (techStack.aiReadiness.score < 70) {
      kpis.push(
        `- AI readiness score improvement: Current ${Math.round(techStack.aiReadiness.score)}/100 → Target 70/100`,
      );
    }

    kpis.push("- AI tool adoption and satisfaction metrics");
    kpis.push("- Code quality and development velocity measurements");

    return kpis.join("\n");
  }

  private generateMitigationStrategies(
    recommendations: Recommendation[],
  ): string {
    const strategies: string[] = [];

    const highPriorityRecs = recommendations.filter(
      (r) => r.priority === "high",
    );
    if (highPriorityRecs.length > 0) {
      strategies.push(
        `- Address ${highPriorityRecs.length} high-priority foundation issues first`,
      );
    }

    strategies.push(
      "- Provide comprehensive training and support for AI tools",
    );
    strategies.push("- Implement gradual rollout with feedback collection");
    strategies.push("- Establish clear success metrics and monitoring");
    strategies.push("- Create channels for team feedback and concerns");

    return strategies.join("\n");
  }

  private calculateNextReviewDate(): string {
    const nextReview = new Date();
    nextReview.setMonth(nextReview.getMonth() + 3); // 3 months from now
    return nextReview.toISOString().split("T")[0] || "";
  }
}
