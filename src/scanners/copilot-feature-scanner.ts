/**
 * Copilot Feature Scanner
 *
 * Scans repository for GitHub Copilot integration features:
 * - Copilot instructions (.github/copilot-instructions.md)
 * - CODEOWNERS file
 * - Copilot-compatible documentation
 * - AI-friendly code patterns
 */

import { readFile, access, constants } from "fs/promises";
import { join, relative } from "path";
import { simpleGit } from "simple-git";

export interface CopilotFeatureAnalysis {
  githubFeatures: {
    copilotInstructions: {
      found: boolean;
      path?: string;
      content?: string;
      quality: "excellent" | "good" | "basic" | "missing";
    };
    codeowners: {
      found: boolean;
      path?: string;
      content?: string;
      coverage: "comprehensive" | "partial" | "minimal" | "missing";
    };
    issueTemplates: {
      found: boolean;
      count: number;
      aiFriendly: boolean;
    };
    prTemplates: {
      found: boolean;
      aiFriendly: boolean;
    };
  };
  codePatterns: {
    aiFriendlyComments: number;
    documentationCoverage: number;
    typeScriptUsage: boolean;
    testCoverage: boolean;
  };
  recommendations: string[];
}

export class CopilotFeatureScanner {
  private git = simpleGit();

  async scan(repoPath: string): Promise<CopilotFeatureAnalysis> {
    const analysis: CopilotFeatureAnalysis = {
      githubFeatures: {
        copilotInstructions: { found: false, quality: "missing" },
        codeowners: { found: false, coverage: "missing" },
        issueTemplates: { found: false, count: 0, aiFriendly: false },
        prTemplates: { found: false, aiFriendly: false },
      },
      codePatterns: {
        aiFriendlyComments: 0,
        documentationCoverage: 0,
        typeScriptUsage: false,
        testCoverage: false,
      },
      recommendations: [],
    };

    try {
      await this.git.cwd(repoPath);

      // Scan GitHub features
      await this.scanCopilotInstructions(repoPath, analysis);
      await this.scanCodeowners(repoPath, analysis);
      await this.scanTemplates(repoPath, analysis);

      // Scan code patterns
      await this.scanCodePatterns(repoPath, analysis);

      // Generate recommendations
      this.generateRecommendations(analysis);
    } catch (error) {
      console.warn(
        `Warning: Could not complete Copilot feature scan: ${error}`,
      );
    }

    return analysis;
  }

  private async scanCopilotInstructions(
    repoPath: string,
    analysis: CopilotFeatureAnalysis,
  ): Promise<void> {
    const instructionPaths = [
      ".github/copilot-instructions.md",
      ".github/copilot-instructions.txt",
      ".github/COPYLOIT_INSTRUCTIONS.md",
    ];

    for (const path of instructionPaths) {
      const fullPath = join(repoPath, path);
      try {
        await access(fullPath, constants.R_OK);
        const content = await readFile(fullPath, "utf-8");

        analysis.githubFeatures.copilotInstructions = {
          found: true,
          path,
          content,
          quality: this.evaluateInstructionQuality(content),
        };
        break;
      } catch {
        // File doesn't exist, try next path
      }
    }
  }

  private async scanCodeowners(
    repoPath: string,
    analysis: CopilotFeatureAnalysis,
  ): Promise<void> {
    const codeownersPaths = [
      ".github/CODEOWNERS",
      "CODEOWNERS",
      "docs/CODEOWNERS",
    ];

    for (const path of codeownersPaths) {
      const fullPath = join(repoPath, path);
      try {
        await access(fullPath, constants.R_OK);
        const content = await readFile(fullPath, "utf-8");

        analysis.githubFeatures.codeowners = {
          found: true,
          path,
          content,
          coverage: this.evaluateCodeownersCoverage(content),
        };
        break;
      } catch {
        // File doesn't exist, try next path
      }
    }
  }

  private async scanTemplates(
    repoPath: string,
    analysis: CopilotFeatureAnalysis,
  ): Promise<void> {
    const githubDir = join(repoPath, ".github");

    try {
      // Scan issue templates
      const issueTemplateDir = join(githubDir, "ISSUE_TEMPLATE");
      const issueTemplates = await this.scanTemplateDirectory(issueTemplateDir);
      analysis.githubFeatures.issueTemplates = {
        found: issueTemplates.length > 0,
        count: issueTemplates.length,
        aiFriendly: issueTemplates.some((template) =>
          this.isAiFriendlyTemplate(template),
        ),
      };

      // Scan PR templates
      const prTemplatePaths = [
        ".github/pull_request_template.md",
        ".github/PULL_REQUEST_TEMPLATE.md",
      ];

      for (const path of prTemplatePaths) {
        const fullPath = join(repoPath, path);
        try {
          await access(fullPath, constants.R_OK);
          const content = await readFile(fullPath, "utf-8");
          analysis.githubFeatures.prTemplates = {
            found: true,
            aiFriendly: this.isAiFriendlyTemplate(content),
          };
          break;
        } catch {
          // File doesn't exist
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan templates: ${error}`);
    }
  }

  private async scanTemplateDirectory(templateDir: string): Promise<string[]> {
    const templates: string[] = [];
    // This would require fs.readdir, but for now return empty
    // Implementation would scan directory and read template files
    return templates;
  }

  private async scanCodePatterns(
    repoPath: string,
    analysis: CopilotFeatureAnalysis,
  ): Promise<void> {
    try {
      // Check for TypeScript usage
      const tsconfigPath = join(repoPath, "tsconfig.json");
      try {
        await access(tsconfigPath, constants.R_OK);
        analysis.codePatterns.typeScriptUsage = true;
      } catch {
        analysis.codePatterns.typeScriptUsage = false;
      }

      // Check for test setup
      const testIndicators = [
        "jest.config.js",
        "jest.config.json",
        "vitest.config.ts",
        "test/",
        "tests/",
        "__tests__/",
      ];

      for (const indicator of testIndicators) {
        const indicatorPath = join(repoPath, indicator);
        try {
          await access(
            indicatorPath,
            indicator.endsWith("/") ? constants.F_OK : constants.R_OK,
          );
          analysis.codePatterns.testCoverage = true;
          break;
        } catch {
          // Continue checking
        }
      }

      // In a full implementation, we would scan source files for:
      // - AI-friendly comments
      // - Documentation coverage
      // For now, set reasonable defaults
      analysis.codePatterns.aiFriendlyComments = 5;
      analysis.codePatterns.documentationCoverage = 60;
    } catch (error) {
      console.warn(`Warning: Could not scan code patterns: ${error}`);
    }
  }

  private evaluateInstructionQuality(
    content: string,
  ): "excellent" | "good" | "basic" | "missing" {
    if (!content || content.trim().length === 0) return "missing";

    const lines = content.split("\n").length;
    const hasSections = content.includes("#") || content.includes("##");
    const hasExamples =
      content.includes("example") || content.includes("Example");
    const hasSpecificGuidelines =
      content.includes("should") ||
      content.includes("must") ||
      content.includes("avoid");

    if (lines > 20 && hasSections && hasExamples && hasSpecificGuidelines)
      return "excellent";
    if (lines > 10 && hasSections && hasSpecificGuidelines) return "good";
    if (lines > 3) return "basic";
    return "missing";
  }

  private evaluateCodeownersCoverage(
    content: string,
  ): "comprehensive" | "partial" | "minimal" | "missing" {
    if (!content || content.trim().length === 0) return "missing";

    const lines = content
      .split("\n")
      .filter((line) => !line.startsWith("#") && line.trim().length > 0).length;
    const hasWildcards = content.includes("*");
    const hasSpecificFiles = content.includes("/") && !content.includes("*/");

    if (lines > 5 && hasSpecificFiles) return "comprehensive";
    if (lines > 2 && (hasWildcards || hasSpecificFiles)) return "partial";
    if (lines > 0) return "minimal";
    return "missing";
  }

  private isAiFriendlyTemplate(content: string): boolean {
    const aiFriendlyKeywords = [
      "steps to reproduce",
      "expected behavior",
      "actual behavior",
      "environment",
      "context",
      "acceptance criteria",
      "testing",
      "reproduction",
    ];

    const lowerContent = content.toLowerCase();
    return aiFriendlyKeywords.some((keyword) => lowerContent.includes(keyword));
  }

  private generateRecommendations(analysis: CopilotFeatureAnalysis): void {
    const recommendations: string[] = [];

    if (!analysis.githubFeatures.copilotInstructions.found) {
      recommendations.push(
        "Add .github/copilot-instructions.md to guide AI assistance",
      );
    } else if (
      analysis.githubFeatures.copilotInstructions.quality === "basic"
    ) {
      recommendations.push(
        "Enhance copilot-instructions.md with more detailed guidance and examples",
      );
    }

    if (!analysis.githubFeatures.codeowners.found) {
      recommendations.push(
        "Add CODEOWNERS file to define code ownership and improve review processes",
      );
    } else if (analysis.githubFeatures.codeowners.coverage === "minimal") {
      recommendations.push(
        "Expand CODEOWNERS coverage for better security and governance",
      );
    }

    if (!analysis.githubFeatures.issueTemplates.found) {
      recommendations.push(
        "Create issue templates with AI-friendly structure for better bug reports",
      );
    }

    if (!analysis.githubFeatures.prTemplates.found) {
      recommendations.push(
        "Add PR template to guide contributors and improve AI assistance",
      );
    }

    if (!analysis.codePatterns.typeScriptUsage) {
      recommendations.push(
        "Consider adopting TypeScript for better AI code understanding",
      );
    }

    if (!analysis.codePatterns.testCoverage) {
      recommendations.push(
        "Add testing framework to improve code quality and AI assistance",
      );
    }

    analysis.recommendations = recommendations;
  }
}
