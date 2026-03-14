/**
 * Core Assessment Engine - Spec-Driven AI Development
 *
 * This is the main orchestrator that combines:
 * 1. Repository scanning (existing)
 * 2. Tech stack analysis (existing)
 * 3. AI readiness scoring (new)
 * 4. Evidence-based recommendations (new)
 * 5. ADR generation (existing)
 */

import { TechStackAnalyzer } from "../analyzers/tech-stack-analyzer";
import { EvidenceCollector } from "../collectors/evidence-collector";
import { ADRGenerator } from "../generators/adr-generator";
import {
  CopilotFeatureAnalysis,
  CopilotFeatureScanner,
} from "../scanners/copilot-feature-scanner";
import { ReadinessScorer } from "../scorers/readiness-scorer";

export interface AssessmentConfig {
  repoPath: string;
  githubUrl?: string;
  outputPath?: string;
  includeRecommendations?: boolean;
  generateADR?: boolean;
  outputFormat?: "json" | "adr" | "markdown";
}

export interface AssessmentResult {
  metadata: {
    timestamp: string;
    repository: string;
    version: string;
    duration: number;
  };
  analysis: {
    copilotFeatures: CopilotFeatureAnalysis;
    techStack: any;
    evidence: any;
  };
  scores: {
    repoReadiness: number;
    teamReadiness: number;
    orgReadiness: number;
    overallMaturity: number;
    confidence: 'high' | 'medium' | 'low';
  };
  recommendations: Recommendation[];
  adr?: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: "foundation" | "security" | "workflow" | "ai" | "governance";
  effort: "small" | "medium" | "large";
  timeframe: string;
  dependencies: string[];
  evidence: string[];
}

export class AssessmentEngine {
  private scanner: CopilotFeatureScanner;
  private techAnalyzer: TechStackAnalyzer;
  private scorer: ReadinessScorer;
  private adrGenerator: ADRGenerator;
  private evidenceCollector: EvidenceCollector;
  private config: AssessmentConfig;

  constructor(config: AssessmentConfig) {
    this.config = {
      includeRecommendations: true,
      generateADR: true,
      outputFormat: "json",
      ...config,
    };

    this.scanner = new CopilotFeatureScanner();
    this.techAnalyzer = new TechStackAnalyzer();
    this.scorer = new ReadinessScorer();
    this.adrGenerator = new ADRGenerator();
    this.evidenceCollector = new EvidenceCollector();
  }

  async execute(): Promise<AssessmentResult> {
    const startTime = Date.now();
    console.log("🚀 Starting AI Enablement Assessment...");

    try {
      // Phase 1: Data Collection (parallel for performance)
      const [copilotFeatures, techStack, evidence] = await Promise.all([
        this.scanner.scan(this.config.repoPath),
        this.techAnalyzer.analyze(this.config.repoPath),
        this.evidenceCollector.collect(this.config.repoPath),
      ]);

      console.log("📊 Analysis complete, calculating scores...");

      // Phase 2: Deterministic Scoring
      const scores = await this.scorer.calculate({
        copilotFeatures,
        techStack,
        evidence,
      });

      console.log("🎯 Scoring complete, generating recommendations...");

      // Phase 3: Evidence-Based Recommendations
      const recommendations = this.config.includeRecommendations
        ? await this.generateRecommendations(scores, copilotFeatures, evidence)
        : [];

      // Phase 4: ADR Generation (if requested)
      let adr: string | undefined;
      if (this.config.generateADR) {
        console.log("📝 Generating ADR...");
        adr = await this.adrGenerator.generate({
          scores,
          copilotFeatures,
          techStack,
          evidence,
          recommendations,
        });
      }

      const duration = Date.now() - startTime;
      const result: AssessmentResult = {
        metadata: {
          timestamp: new Date().toISOString(),
          repository: this.config.repoPath,
          version: '1.0.0',
          duration
        },
        analysis: {
          copilotFeatures,
          techStack,
          evidence
        },
        scores,
        recommendations
      };
      
      if (adr) {
        result.adr = adr;
      }

      console.log(`✅ Assessment complete in ${duration}ms!`);
      return result;
    } catch (error) {
      console.error("❌ Assessment failed:", error);
      throw error;
    }
  }

  private async generateRecommendations(
    scores: AssessmentResult["scores"],
    features: CopilotFeatureAnalysis,
    evidence: any,
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Foundation recommendations
    if (scores.repoReadiness < 70) {
      recommendations.push({
        id: "found-001",
        title: "Improve Repository Structure",
        description:
          "Standardize repository structure and add essential configuration files",
        priority: "high",
        category: "foundation",
        effort: "medium",
        timeframe: "30 days",
        dependencies: [],
        evidence: this.extractEvidence(evidence, ["structure", "config"]),
      });
    }

    // Security recommendations
    if (!features.githubFeatures.codeowners.found) {
      recommendations.push({
        id: "sec-001",
        title: "Add CODEOWNERS File",
        description:
          "Define code ownership for better security and review processes",
        priority: "high",
        category: "security",
        effort: "small",
        timeframe: "7 days",
        dependencies: [],
        evidence: this.extractEvidence(evidence, ["codeowners"]),
      });
    }

    // AI/Workflow recommendations
    if (!features.githubFeatures.copilotInstructions.found) {
      recommendations.push({
        id: "ai-001",
        title: "Add Copilot Instructions",
        description:
          "Create Copilot instructions to guide AI assistance in your repository",
        priority: "medium",
        category: "ai",
        effort: "small",
        timeframe: "14 days",
        dependencies: ["found-001"],
        evidence: this.extractEvidence(evidence, ["copilot", "instructions"]),
      });
    }

    // Governance recommendations
    if (scores.orgReadiness < 60) {
      recommendations.push({
        id: "gov-001",
        title: "Establish Governance Processes",
        description:
          "Implement clear processes for code review, testing, and deployment",
        priority: "medium",
        category: "governance",
        effort: "large",
        timeframe: "60 days",
        dependencies: ["found-001", "sec-001"],
        evidence: this.extractEvidence(evidence, ["governance", "process"]),
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private extractEvidence(evidence: any, categories: string[]): string[] {
    // Extract relevant evidence based on categories
    const evidenceItems: string[] = [];

    for (const category of categories) {
      if (evidence[category]) {
        evidenceItems.push(...Object.keys(evidence[category]));
      }
    }

    return evidenceItems;
  }

  async saveResults(result: AssessmentResult): Promise<void> {
    if (!this.config.outputPath) return;

    const fs = await import("fs/promises");
    const path = await import("path");

    const outputFile = path.join(
      this.config.outputPath,
      `ai-enablement-assessment-${Date.now()}.${this.config.outputFormat}`,
    );

    let content: string;
    switch (this.config.outputFormat) {
      case "json":
        content = JSON.stringify(result, null, 2);
        break;
      case "adr":
        content = result.adr || "No ADR generated";
        break;
      case "markdown":
        content = this.generateMarkdownReport(result);
        break;
      default:
        content = JSON.stringify(result, null, 2);
    }

    await fs.writeFile(outputFile, content, "utf-8");
    console.log(`📄 Results saved to: ${outputFile}`);
  }

  private generateMarkdownReport(result: AssessmentResult): string {
    return `# AI Enablement Assessment Report

## Overview
- **Repository**: ${result.metadata.repository}
- **Assessed**: ${result.metadata.timestamp}
- **Duration**: ${result.metadata.duration}ms

## Readiness Scores

| Category | Score | Status |
|----------|-------|--------|
| Repository Readiness | ${result.scores.repoReadiness}/100 | ${this.getScoreStatus(result.scores.repoReadiness)} |
| Team Readiness | ${result.scores.teamReadiness}/100 | ${this.getScoreStatus(result.scores.teamReadiness)} |
| Organization Readiness | ${result.scores.orgReadiness}/100 | ${this.getScoreStatus(result.scores.orgReadiness)} |
| Overall Maturity | ${result.scores.overallMaturity}/8 | ${this.getMaturityStatus(result.scores.overallMaturity)} |

## Recommendations

${result.recommendations
  .map(
    (rec) => `
### ${rec.title} (${rec.priority})
**Category**: ${rec.category} | **Effort**: ${rec.effort} | **Timeframe**: ${rec.timeframe}

${rec.description}

**Dependencies**: ${rec.dependencies.length > 0 ? rec.dependencies.join(", ") : "None"}
`,
  )
  .join("\n")}

${result.adr ? `\n## Architecture Decision Record\n\n${result.adr}` : ""}
`;
  }

  private getScoreStatus(score: number): string {
    if (score >= 80) return "✅ Excellent";
    if (score >= 60) return "⚠️ Good";
    if (score >= 40) return "🔶 Fair";
    return "❌ Poor";
  }

  private getMaturityStatus(level: number): string {
    if (level >= 6) return "✅ Advanced";
    if (level >= 4) return "⚠️ Developing";
    if (level >= 2) return "🔶 Basic";
    return "❌ Initial";
  }
}
