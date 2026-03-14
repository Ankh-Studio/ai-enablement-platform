/**
 * Readiness Scorer
 * 
 * Calculates deterministic readiness scores for repository, team, and organization
 * based on collected evidence and analysis data
 */

import { TechStackAnalysis } from '../analyzers/tech-stack-analyzer';
import { EvidenceData } from '../collectors/evidence-collector';
import { CopilotFeatureAnalysis } from '../scanners/copilot-feature-scanner';

export interface ReadinessScores {
  repoReadiness: number;
  teamReadiness: number;
  orgReadiness: number;
  overallMaturity: number;
  confidence: 'high' | 'medium' | 'low';
  breakdown: {
    foundation: number;
    security: number;
    workflow: number;
    ai: number;
    governance: number;
  };
}

export interface ScoringContext {
  copilotFeatures: CopilotFeatureAnalysis;
  techStack: TechStackAnalysis;
  evidence: EvidenceData;
}

export class ReadinessScorer {
  async calculate(context: ScoringContext): Promise<ReadinessScores> {
    const { copilotFeatures, techStack, evidence } = context;
    
    // Calculate component scores
    const foundation = this.calculateFoundationScore(evidence, techStack);
    const security = this.calculateSecurityScore(copilotFeatures, evidence);
    const workflow = this.calculateWorkflowScore(copilotFeatures, evidence);
    const ai = this.calculateAIScore(copilotFeatures, techStack);
    const governance = this.calculateGovernanceScore(evidence, copilotFeatures);
    
    // Calculate overall readiness scores
    const repoReadiness = this.calculateRepoReadiness(foundation, security, workflow, ai, governance);
    const teamReadiness = this.calculateTeamReadiness(workflow, ai, governance);
    const orgReadiness = this.calculateOrgReadiness(governance, security);
    
    // Calculate overall maturity (1-8 scale)
    const overallMaturity = this.calculateOverallMaturity(repoReadiness, teamReadiness, orgReadiness);
    
    // Determine confidence level
    const confidence = this.calculateConfidence(evidence);
    
    return {
      repoReadiness,
      teamReadiness,
      orgReadiness,
      overallMaturity,
      confidence,
      breakdown: {
        foundation,
        security,
        workflow,
        ai,
        governance
      }
    };
  }

  private calculateFoundationScore(evidence: EvidenceData, techStack: TechStackAnalysis): number {
    let score = 0;
    const maxScore = 100;
    
    // Basic documentation (20 points)
    if (evidence.structure.hasReadme) score += 10;
    if (evidence.structure.hasLicense) score += 5;
    if (evidence.structure.hasContributing) score += 5;
    
    // Configuration files (25 points)
    if (evidence.configuration.hasGitignore) score += 5;
    if (evidence.configuration.hasEditorconfig) score += 5;
    if (evidence.configuration.hasPrettier) score += 5;
    if (evidence.configuration.hasEslint) score += 5;
    if (evidence.configuration.hasTypeScript) score += 5;
    
    // Development setup (25 points)
    if (evidence.configuration.hasTests) score += 10;
    if (evidence.configuration.hasCi) score += 10;
    if (techStack.infrastructure.packageManager !== 'unknown') score += 5;
    
    // Code quality (30 points)
    if (techStack.aiReadiness.modernFramework) score += 10;
    if (techStack.aiReadiness.typescriptUsage) score += 10;
    if (evidence.patterns.codeComplexity !== 'high') score += 10;
    
    return Math.min(score, maxScore);
  }

  private calculateSecurityScore(copilotFeatures: CopilotFeatureAnalysis, evidence: EvidenceData): number {
    let score = 0;
    const maxScore = 100;
    
    // Code ownership (30 points)
    if (copilotFeatures.githubFeatures.codeowners.found) {
      const coverage = copilotFeatures.githubFeatures.codeowners.coverage;
      if (coverage === 'comprehensive') score += 30;
      else if (coverage === 'partial') score += 20;
      else if (coverage === 'minimal') score += 10;
    }
    
    // Branch protection (25 points) - would need git API
    if (copilotFeatures.githubFeatures.codeowners.found) score += 15; // Proxy for security awareness
    if (evidence.configuration.hasCi) score += 10;
    
    // Dependency security (25 points)
    if (evidence.metrics.dependencyHealth === 'excellent') score += 25;
    else if (evidence.metrics.dependencyHealth === 'good') score += 20;
    else if (evidence.metrics.dependencyHealth === 'fair') score += 10;
    
    // Security patterns (20 points)
    if (evidence.structure.hasLicense) score += 10;
    if (evidence.configuration.hasEslint) score += 10;
    
    return Math.min(score, maxScore);
  }

  private calculateWorkflowScore(copilotFeatures: CopilotFeatureAnalysis, evidence: EvidenceData): number {
    let score = 0;
    const maxScore = 100;
    
    // Templates and automation (30 points)
    if (copilotFeatures.githubFeatures.prTemplates.found) score += 15;
    if (copilotFeatures.githubFeatures.issueTemplates.found) score += 15;
    
    // CI/CD setup (25 points)
    if (evidence.configuration.hasCi) score += 25;
    
    // Testing infrastructure (25 points)
    if (evidence.configuration.hasTests) score += 15;
    if (evidence.configuration.hasTests) score += 10; // Use evidence instead of techStack
    
    // Documentation and collaboration (20 points)
    if (evidence.structure.hasContributing) score += 10;
    if (evidence.patterns.documentationCoverage > 20) score += 10;
    
    return Math.min(score, maxScore);
  }

  private calculateAIScore(copilotFeatures: CopilotFeatureAnalysis, techStack: TechStackAnalysis): number {
    let score = 0;
    const maxScore = 100;
    
    // Copilot integration (35 points)
    if (copilotFeatures.githubFeatures.copilotInstructions.found) {
      const quality = copilotFeatures.githubFeatures.copilotInstructions.quality;
      if (quality === 'excellent') score += 35;
      else if (quality === 'good') score += 25;
      else if (quality === 'basic') score += 15;
    }
    
    // AI-friendly tech stack (30 points)
    if (techStack.aiReadiness.typescriptUsage) score += 15;
    if (techStack.aiReadiness.modernFramework) score += 10;
    if (techStack.aiReadiness.testCoverage) score += 5;
    
    // AI dependencies (20 points)
    const aiDeps = techStack.dependencies.aiRelated.length;
    if (aiDeps > 0) score += Math.min(aiDeps * 10, 20);
    
    // Code patterns (15 points)
    if (copilotFeatures.codePatterns.aiFriendlyComments > 5) score += 10;
    if (copilotFeatures.codePatterns.documentationCoverage > 50) score += 5;
    
    return Math.min(score, maxScore);
  }

  private calculateGovernanceScore(evidence: EvidenceData, copilotFeatures: CopilotFeatureAnalysis): number {
    let score = 0;
    const maxScore = 100;
    
    // Project governance (30 points)
    if (evidence.structure.hasContributing) score += 15;
    if (evidence.structure.hasChangelog) score += 10;
    if (evidence.structure.hasLicense) score += 5;
    
    // Code review processes (25 points)
    if (copilotFeatures.githubFeatures.codeowners.found) score += 15;
    if (copilotFeatures.githubFeatures.prTemplates.found) score += 10;
    
    // Issue tracking (25 points)
    if (copilotFeatures.githubFeatures.issueTemplates.found) score += 15;
    if (copilotFeatures.githubFeatures.issueTemplates.aiFriendly) score += 10;
    
    // Documentation standards (20 points)
    if (evidence.structure.hasDocs) score += 10;
    if (evidence.patterns.documentationCoverage > 30) score += 10;
    
    return Math.min(score, maxScore);
  }

  private calculateRepoReadiness(
    foundation: number,
    security: number,
    workflow: number,
    ai: number,
    governance: number
  ): number {
    // Weighted average: Foundation (30%), Security (25%), Workflow (20%), AI (15%), Governance (10%)
    const weights = {
      foundation: 0.30,
      security: 0.25,
      workflow: 0.20,
      ai: 0.15,
      governance: 0.10
    };
    
    const weightedScore = 
      foundation * weights.foundation +
      security * weights.security +
      workflow * weights.workflow +
      ai * weights.ai +
      governance * weights.governance;
    
    return Math.round(weightedScore);
  }

  private calculateTeamReadiness(workflow: number, ai: number, governance: number): number {
    // Team readiness focuses on workflow, AI adoption, and governance
    // Weighted average: Workflow (40%), AI (35%), Governance (25%)
    const weights = {
      workflow: 0.40,
      ai: 0.35,
      governance: 0.25
    };
    
    const weightedScore = 
      workflow * weights.workflow +
      ai * weights.ai +
      governance * weights.governance;
    
    return Math.round(weightedScore);
  }

  private calculateOrgReadiness(governance: number, security: number): number {
    // Organization readiness focuses on governance and security
    // Weighted average: Governance (60%), Security (40%)
    const weights = {
      governance: 0.60,
      security: 0.40
    };
    
    const weightedScore = 
      governance * weights.governance +
      security * weights.security;
    
    return Math.round(weightedScore);
  }

  private calculateOverallMaturity(repoReadiness: number, teamReadiness: number, orgReadiness: number): number {
    // Convert 0-100 scores to 1-8 maturity scale
    const averageReadiness = (repoReadiness + teamReadiness + orgReadiness) / 3;
    
    if (averageReadiness >= 90) return 8; // Advanced
    if (averageReadiness >= 80) return 7; // Advanced
    if (averageReadiness >= 70) return 6; // Developing
    if (averageReadiness >= 60) return 5; // Developing
    if (averageReadiness >= 50) return 4; // Basic
    if (averageReadiness >= 40) return 3; // Basic
    if (averageReadiness >= 25) return 2; // Initial
    return 1; // Initial
  }

  private calculateConfidence(evidence: EvidenceData): 'high' | 'medium' | 'low' {
    let confidenceFactors = 0;
    const totalFactors = 8;
    
    // Check if we have sufficient data for confident scoring
    if (evidence.structure.fileCount > 0) confidenceFactors++;
    if (evidence.structure.hasReadme) confidenceFactors++;
    if (evidence.configuration.hasGitignore) confidenceFactors++;
    if (evidence.configuration.hasTypeScript || evidence.configuration.hasTests) confidenceFactors++;
    if (evidence.patterns.documentationCoverage > 0) confidenceFactors++;
    if (evidence.metrics.linesOfCode > 0) confidenceFactors++;
    if (evidence.metrics.dependencyHealth !== 'fair') confidenceFactors++;
    if (evidence.structure.directoryDepth > 0) confidenceFactors++;
    
    const confidenceRatio = confidenceFactors / totalFactors;
    
    if (confidenceRatio >= 0.8) return 'high';
    if (confidenceRatio >= 0.5) return 'medium';
    return 'low';
  }
}
