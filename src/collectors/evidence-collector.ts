/**
 * Evidence Collector
 *
 * Collects structured evidence from repository for AI readiness assessment
 * including metrics, patterns, and contextual information
 */

import { constants, access, readFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';

export interface EvidenceData {
  structure: {
    hasReadme: boolean;
    hasLicense: boolean;
    hasChangelog: boolean;
    hasContributing: boolean;
    hasDocs: boolean;
    directoryDepth: number;
    fileCount: number;
  };
  configuration: {
    hasGitignore: boolean;
    hasEditorconfig: boolean;
    hasPrettier: boolean;
    hasEslint: boolean;
    hasTypeScript: boolean;
    hasTests: boolean;
    hasCi: boolean;
  };
  patterns: {
    commitMessageQuality: 'excellent' | 'good' | 'basic' | 'none';
    branchProtection: boolean;
    prTemplates: boolean;
    issueTemplates: boolean;
    documentationCoverage: number;
    codeComplexity: 'low' | 'medium' | 'high' | 'unknown';
  };
  metrics: {
    linesOfCode: number;
    testCoverage: number;
    documentationRatio: number;
    dependencyHealth: 'excellent' | 'good' | 'fair' | 'poor';
  };
}

export class EvidenceCollector {
  async collect(repoPath: string): Promise<EvidenceData> {
    const evidence: EvidenceData = {
      structure: {
        hasReadme: false,
        hasLicense: false,
        hasChangelog: false,
        hasContributing: false,
        hasDocs: false,
        directoryDepth: 0,
        fileCount: 0,
      },
      configuration: {
        hasGitignore: false,
        hasEditorconfig: false,
        hasPrettier: false,
        hasEslint: false,
        hasTypeScript: false,
        hasTests: false,
        hasCi: false,
      },
      patterns: {
        commitMessageQuality: 'none',
        branchProtection: false,
        prTemplates: false,
        issueTemplates: false,
        documentationCoverage: 0,
        codeComplexity: 'unknown',
      },
      metrics: {
        linesOfCode: 0,
        testCoverage: 0,
        documentationRatio: 0,
        dependencyHealth: 'fair',
      },
    };

    try {
      // Collect structure evidence
      await this.collectStructureEvidence(repoPath, evidence);

      // Collect configuration evidence
      await this.collectConfigurationEvidence(repoPath, evidence);

      // Collect pattern evidence
      await this.collectPatternEvidence(repoPath, evidence);

      // Collect metrics evidence
      await this.collectMetricsEvidence(repoPath, evidence);
    } catch (error) {
      console.warn(`Warning: Could not complete evidence collection: ${error}`);
    }

    return evidence;
  }

  private async collectStructureEvidence(
    repoPath: string,
    evidence: EvidenceData,
  ): Promise<void> {
    const structureFiles = [
      { path: 'README.md', prop: 'hasReadme' },
      { path: 'README', prop: 'hasReadme' },
      { path: 'LICENSE', prop: 'hasLicense' },
      { path: 'CHANGELOG.md', prop: 'hasChangelog' },
      { path: 'CONTRIBUTING.md', prop: 'hasContributing' },
      { path: 'docs/', prop: 'hasDocs' },
      { path: 'doc/', prop: 'hasDocs' },
    ];

    for (const { path, prop } of structureFiles) {
      const fullPath = join(repoPath, path);
      try {
        if (path.endsWith('/')) {
          // Directory check
          await this.access(fullPath, constants.F_OK);
          (evidence.structure as any)[prop] = true;
        } else {
          // File check
          await this.access(fullPath, constants.R_OK);
          (evidence.structure as any)[prop] = true;
        }
      } catch {
        // File doesn't exist, keep default false
      }
    }

    // Calculate directory depth and file count
    const { depth, count } = await this.analyzeDirectoryStructure(repoPath);
    evidence.structure.directoryDepth = depth;
    evidence.structure.fileCount = count;
  }

  private async collectConfigurationEvidence(
    repoPath: string,
    evidence: EvidenceData,
  ): Promise<void> {
    const configFiles = [
      { path: '.gitignore', prop: 'hasGitignore' },
      { path: '.editorconfig', prop: 'hasEditorconfig' },
      { path: '.prettierrc', prop: 'hasPrettier' },
      { path: 'prettier.config.js', prop: 'hasPrettier' },
      { path: '.eslintrc.json', prop: 'hasEslint' },
      { path: '.eslintrc.js', prop: 'hasEslint' },
      { path: 'tsconfig.json', prop: 'hasTypeScript' },
      { path: 'jest.config.js', prop: 'hasTests' },
      { path: 'jest.config.json', prop: 'hasTests' },
      { path: 'vitest.config.ts', prop: 'hasTests' },
      { path: '.github/workflows/', prop: 'hasCi' },
      { path: '.gitlab-ci.yml', prop: 'hasCi' },
    ];

    for (const { path, prop } of configFiles) {
      const fullPath = join(repoPath, path);
      try {
        if (path.endsWith('/')) {
          await this.access(fullPath, constants.F_OK);
          (evidence.configuration as any)[prop] = true;
        } else {
          await this.access(fullPath, constants.R_OK);
          (evidence.configuration as any)[prop] = true;
        }
      } catch {
        // File doesn't exist, keep default false
      }
    }
  }

  private async collectPatternEvidence(
    repoPath: string,
    evidence: EvidenceData,
  ): Promise<void> {
    const githubDir = join(repoPath, '.github');

    try {
      // Check for GitHub patterns
      await this.access(githubDir, constants.F_OK);

      // PR templates
      const prTemplatePaths = [
        join(githubDir, 'pull_request_template.md'),
        join(githubDir, 'PULL_REQUEST_TEMPLATE.md'),
      ];

      for (const path of prTemplatePaths) {
        try {
          await this.access(path, constants.R_OK);
          evidence.patterns.prTemplates = true;
          break;
        } catch {
          // Template doesn't exist
        }
      }

      // Issue templates
      const issueTemplateDir = join(githubDir, 'ISSUE_TEMPLATE');
      try {
        const files = await this.readdir(issueTemplateDir);
        evidence.patterns.issueTemplates = files.length > 0;
      } catch {
        // Directory doesn't exist
      }

      // Branch protection (would require git API, set default)
      evidence.patterns.branchProtection = false;

      // Documentation coverage estimation
      evidence.patterns.documentationCoverage =
        await this.calculateDocumentationCoverage(repoPath);

      // Code complexity estimation
      evidence.patterns.codeComplexity =
        await this.estimateCodeComplexity(repoPath);
    } catch (error) {
      console.warn(`Warning: Could not analyze GitHub patterns: ${error}`);
    }
  }

  private async collectMetricsEvidence(
    repoPath: string,
    evidence: EvidenceData,
  ): Promise<void> {
    // Lines of code estimation
    evidence.metrics.linesOfCode = await this.countLinesOfCode(repoPath);

    // Test coverage estimation (would need test runner integration)
    evidence.metrics.testCoverage = evidence.configuration.hasTests ? 50 : 0; // Placeholder

    // Documentation ratio
    const docFiles = await this.countDocumentationFiles(repoPath);
    const totalFiles = evidence.structure.fileCount;
    evidence.metrics.documentationRatio =
      totalFiles > 0 ? (docFiles / totalFiles) * 100 : 0;

    // Dependency health (would need security audit)
    evidence.metrics.dependencyHealth = 'fair'; // Placeholder
  }

  private async analyzeDirectoryStructure(
    repoPath: string,
  ): Promise<{ depth: number; count: number }> {
    let maxDepth = 0;
    let fileCount = 0;

    const scanDirectory = async (
      dir: string,
      currentDepth: number,
    ): Promise<void> => {
      maxDepth = Math.max(maxDepth, currentDepth);

      try {
        const entries = await this.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = join(dir, entry.name);

          if (
            entry.isDirectory() &&
            !entry.name.startsWith('.') &&
            entry.name !== 'node_modules'
          ) {
            await scanDirectory(fullPath, currentDepth + 1);
          } else if (entry.isFile()) {
            fileCount++;
          }
        }
      } catch (error) {
        // Directory access denied, skip
      }
    };

    await scanDirectory(repoPath, 0);
    return { depth: maxDepth, count: fileCount };
  }

  private async calculateDocumentationCoverage(
    repoPath: string,
  ): Promise<number> {
    let docFiles = 0;
    let codeFiles = 0;

    const scanFiles = async (dir: string): Promise<void> => {
      try {
        const entries = await this.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = join(dir, entry.name);

          if (
            entry.isDirectory() &&
            !entry.name.startsWith('.') &&
            entry.name !== 'node_modules'
          ) {
            await scanFiles(fullPath);
          } else if (entry.isFile()) {
            const ext = extname(entry.name).toLowerCase();
            const name = entry.name.toLowerCase();

            if (
              ['.md', '.txt', '.rst', '.adoc'].includes(ext) ||
              name.includes('readme')
            ) {
              docFiles++;
            } else if (
              [
                '.js',
                '.ts',
                '.jsx',
                '.tsx',
                '.py',
                '.java',
                '.cpp',
                '.c',
                '.go',
                '.rs',
              ].includes(ext)
            ) {
              codeFiles++;
            }
          }
        }
      } catch (error) {
        // Directory access denied, skip
      }
    };

    await scanFiles(repoPath);

    if (codeFiles === 0) return 0;
    return Math.min((docFiles / codeFiles) * 100, 100);
  }

  private async estimateCodeComplexity(
    repoPath: string,
  ): Promise<'low' | 'medium' | 'high' | 'unknown'> {
    // Simple heuristic based on file structure and dependencies
    let complexityScore = 0;

    try {
      const packageJsonPath = join(repoPath, 'package.json');
      await this.access(packageJsonPath, constants.R_OK);
      const content = await this.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      const depCount = Object.keys({
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      }).length;

      if (depCount > 50) complexityScore += 2;
      else if (depCount > 20) complexityScore += 1;

      // Check for complex patterns
      if (await this.exists(join(repoPath, 'src/'))) complexityScore += 1;
      if (await this.exists(join(repoPath, 'lib/'))) complexityScore += 1;
      if (await this.exists(join(repoPath, 'packages/'))) complexityScore += 2; // Monorepo
    } catch (error) {
      return 'unknown';
    }

    if (complexityScore >= 4) return 'high';
    if (complexityScore >= 2) return 'medium';
    return 'low';
  }

  private async countLinesOfCode(repoPath: string): Promise<number> {
    let totalLines = 0;

    const countLines = async (dir: string): Promise<void> => {
      try {
        const entries = await this.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = join(dir, entry.name);

          if (
            entry.isDirectory() &&
            !entry.name.startsWith('.') &&
            entry.name !== 'node_modules'
          ) {
            await countLines(fullPath);
          } else if (entry.isFile()) {
            const ext = extname(entry.name).toLowerCase();

            if (
              [
                '.js',
                '.ts',
                '.jsx',
                '.tsx',
                '.py',
                '.java',
                '.cpp',
                '.c',
                '.go',
                '.rs',
              ].includes(ext)
            ) {
              try {
                const content = await this.readFile(fullPath, 'utf-8');
                totalLines += content.split('\n').length;
              } catch {
                // File read error, skip
              }
            }
          }
        }
      } catch (error) {
        // Directory access denied, skip
      }
    };

    await countLines(repoPath);
    return totalLines;
  }

  private async countDocumentationFiles(repoPath: string): Promise<number> {
    let count = 0;

    const countDocs = async (dir: string): Promise<void> => {
      try {
        const entries = await this.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = join(dir, entry.name);

          if (
            entry.isDirectory() &&
            !entry.name.startsWith('.') &&
            entry.name !== 'node_modules'
          ) {
            await countDocs(fullPath);
          } else if (entry.isFile()) {
            const ext = extname(entry.name).toLowerCase();
            const name = entry.name.toLowerCase();

            if (
              ['.md', '.txt', '.rst', '.adoc'].includes(ext) ||
              name.includes('readme')
            ) {
              count++;
            }
          }
        }
      } catch (error) {
        // Directory access denied, skip
      }
    };

    await countDocs(repoPath);
    return count;
  }

  private async access(path: string, mode?: number): Promise<void> {
    return access(path, mode || constants.R_OK);
  }

  private async readFile(path: string, encoding: string): Promise<string> {
    return readFile(path, { encoding: encoding as BufferEncoding });
  }

  private async readdir(
    path: string,
    options?: { withFileTypes: true },
  ): Promise<any[]> {
    if (options) {
      return readdir(path, options);
    }
    return readdir(path);
  }

  private async exists(path: string): Promise<boolean> {
    try {
      await this.access(path, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }
}
