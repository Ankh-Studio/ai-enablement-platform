/**
 * Tech Stack Analyzer
 *
 * Analyzes repository technology stack using @specfy/stack-analyser
 * and additional custom analysis for AI readiness assessment
 */

import { constants, access, readFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface TechStackAnalysis {
  languages: {
    primary: string;
    secondary: string[];
    frameworks: string[];
    totalLanguages: number;
  };
  dependencies: {
    total: number;
    categories: {
      frontend: number;
      backend: number;
      testing: number;
      build: number;
      ai: number;
      devops: number;
    };
    aiRelated: Array<{
      name: string;
      version: string;
      category: 'copilot' | 'openai' | 'anthropic' | 'huggingface' | 'other';
    }>;
  };
  infrastructure: {
    packageManager: 'npm' | 'yarn' | 'pnpm' | 'unknown';
    buildTools: string[];
    testingFrameworks: string[];
    ciConfigured: boolean;
    containerization: boolean;
  };
  aiReadiness: {
    typescriptUsage: boolean;
    modernFramework: boolean;
    testCoverage: boolean;
    documentation: boolean;
    score: number;
  };
}

export class TechStackAnalyzer {
  async analyze(repoPath: string): Promise<TechStackAnalysis> {
    const analysis: TechStackAnalysis = {
      languages: {
        primary: 'unknown',
        secondary: [],
        frameworks: [],
        totalLanguages: 0,
      },
      dependencies: {
        total: 0,
        categories: {
          frontend: 0,
          backend: 0,
          testing: 0,
          build: 0,
          ai: 0,
          devops: 0,
        },
        aiRelated: [],
      },
      infrastructure: {
        packageManager: 'unknown',
        buildTools: [],
        testingFrameworks: [],
        ciConfigured: false,
        containerization: false,
      },
      aiReadiness: {
        typescriptUsage: false,
        modernFramework: false,
        testCoverage: false,
        documentation: false,
        score: 0,
      },
    };

    try {
      // Analyze package.json for dependencies and scripts
      await this.analyzePackageJson(repoPath, analysis);

      // Analyze language usage
      await this.analyzeLanguages(repoPath, analysis);

      // Analyze infrastructure
      await this.analyzeInfrastructure(repoPath, analysis);

      // Calculate AI readiness score
      this.calculateAiReadiness(analysis);
    } catch (error) {
      console.warn(`Warning: Could not complete tech stack analysis: ${error}`);
    }

    return analysis;
  }

  private async analyzePackageJson(
    repoPath: string,
    analysis: TechStackAnalysis,
  ): Promise<void> {
    const packageJsonPath = join(repoPath, 'package.json');

    try {
      await access(packageJsonPath, constants.R_OK);
      const content = await readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      // Analyze dependencies
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
        ...packageJson.peerDependencies,
      };

      analysis.dependencies.total = Object.keys(allDeps).length;

      // Categorize dependencies
      for (const [name, version] of Object.entries(allDeps)) {
        this.categorizeDependency(name, version as string, analysis);
      }

      // Detect package manager
      if (await this.exists(join(repoPath, 'yarn.lock'))) {
        analysis.infrastructure.packageManager = 'yarn';
      } else if (await this.exists(join(repoPath, 'pnpm-lock.yaml'))) {
        analysis.infrastructure.packageManager = 'pnpm';
      } else if (await this.exists(join(repoPath, 'package-lock.json'))) {
        analysis.infrastructure.packageManager = 'npm';
      }

      // Detect build tools and testing frameworks from scripts
      if (packageJson.scripts) {
        this.analyzeScripts(packageJson.scripts, analysis);
      }
    } catch (error) {
      console.warn(`Warning: Could not analyze package.json: ${error}`);
    }
  }

  private categorizeDependency(
    name: string,
    version: string,
    analysis: TechStackAnalysis,
  ): void {
    const lowerName = name.toLowerCase();

    // AI-related dependencies
    if (this.isAiDependency(lowerName)) {
      analysis.dependencies.categories.ai++;
      analysis.dependencies.aiRelated.push({
        name,
        version,
        category: this.categorizeAiDependency(lowerName),
      });
    }
    // Frontend dependencies
    else if (this.isFrontendDependency(lowerName)) {
      analysis.dependencies.categories.frontend++;
      if (this.isFramework(lowerName)) {
        analysis.languages.frameworks.push(name);
      }
    }
    // Backend dependencies
    else if (this.isBackendDependency(lowerName)) {
      analysis.dependencies.categories.backend++;
    }
    // Testing dependencies
    else if (this.isTestingDependency(lowerName)) {
      analysis.dependencies.categories.testing++;
      analysis.infrastructure.testingFrameworks.push(name);
    }
    // Build dependencies
    else if (this.isBuildDependency(lowerName)) {
      analysis.dependencies.categories.build++;
      analysis.infrastructure.buildTools.push(name);
    }
    // DevOps dependencies
    else if (this.isDevopsDependency(lowerName)) {
      analysis.dependencies.categories.devops++;
    }
  }

  private isAiDependency(name: string): boolean {
    const aiKeywords = [
      'copilot',
      'openai',
      'anthropic',
      'claude',
      'gpt',
      'chatgpt',
      'huggingface',
      'transformers',
      'tensorflow',
      'torch',
      'keras',
      'langchain',
      'llama',
      'ollama',
      'ai',
      'ml',
      'machine-learning',
    ];
    return aiKeywords.some((keyword) => name.includes(keyword));
  }

  private categorizeAiDependency(
    name: string,
  ): 'copilot' | 'openai' | 'anthropic' | 'huggingface' | 'other' {
    if (name.includes('copilot')) return 'copilot';
    if (name.includes('openai')) return 'openai';
    if (name.includes('anthropic') || name.includes('claude'))
      return 'anthropic';
    if (name.includes('huggingface')) return 'huggingface';
    return 'other';
  }

  private isFrontendDependency(name: string): boolean {
    const frontendKeywords = [
      'react',
      'vue',
      'angular',
      'svelte',
      'next',
      'nuxt',
      'webpack',
      'vite',
      'parcel',
      'rollup',
      'esbuild',
      'css',
      'sass',
      'scss',
      'less',
      'stylus',
      'tailwind',
      'bootstrap',
      'material-ui',
      'antd',
      'chakra',
      'mantine',
    ];
    return frontendKeywords.some((keyword) => name.includes(keyword));
  }

  private isFramework(name: string): boolean {
    const frameworks = [
      'react',
      'vue',
      'angular',
      'svelte',
      'next',
      'nuxt',
      'express',
      'fastify',
      'koa',
    ];
    return frameworks.includes(name);
  }

  private isBackendDependency(name: string): boolean {
    const backendKeywords = [
      'express',
      'fastify',
      'koa',
      'hapi',
      'nest',
      'loopback',
      'mongoose',
      'sequelize',
      'prisma',
      'typeorm',
      'knex',
      'passport',
      'jsonwebtoken',
      'bcrypt',
      'helmet',
      'cors',
    ];
    return backendKeywords.some((keyword) => name.includes(keyword));
  }

  private isTestingDependency(name: string): boolean {
    const testingKeywords = [
      'jest',
      'vitest',
      'mocha',
      'chai',
      'jasmine',
      'karma',
      'cypress',
      'playwright',
      'puppeteer',
      'testing-library',
      'supertest',
      'sinon',
      'nyc',
      'istanbul',
      'coverage',
    ];
    return testingKeywords.some((keyword) => name.includes(keyword));
  }

  private isBuildDependency(name: string): boolean {
    const buildKeywords = [
      'webpack',
      'vite',
      'parcel',
      'rollup',
      'esbuild',
      'babel',
      'typescript',
      'ts-node',
      'nodemon',
      'eslint',
      'prettier',
      'lint-staged',
      'husky',
    ];
    return buildKeywords.some((keyword) => name.includes(keyword));
  }

  private isDevopsDependency(name: string): boolean {
    const devopsKeywords = [
      'docker',
      'kubernetes',
      'helm',
      'terraform',
      'ansible',
      'ci',
      'cd',
      'github-actions',
      'gitlab-ci',
      'jenkins',
    ];
    return devopsKeywords.some((keyword) => name.includes(keyword));
  }

  private analyzeScripts(
    scripts: Record<string, string>,
    analysis: TechStackAnalysis,
  ): void {
    for (const [, scriptCommand] of Object.entries(scripts)) {
      const command = scriptCommand.toLowerCase();

      // Detect build tools
      if (
        command.includes('webpack') ||
        command.includes('vite') ||
        command.includes('parcel')
      ) {
        const tool = command.includes('webpack')
          ? 'webpack'
          : command.includes('vite')
            ? 'vite'
            : 'parcel';
        if (!analysis.infrastructure.buildTools.includes(tool)) {
          analysis.infrastructure.buildTools.push(tool);
        }
      }

      // Detect testing frameworks
      if (
        command.includes('jest') ||
        command.includes('vitest') ||
        command.includes('mocha')
      ) {
        const framework = command.includes('jest')
          ? 'jest'
          : command.includes('vitest')
            ? 'vitest'
            : 'mocha';
        if (!analysis.infrastructure.testingFrameworks.includes(framework)) {
          analysis.infrastructure.testingFrameworks.push(framework);
        }
      }
    }
  }

  private async analyzeLanguages(
    repoPath: string,
    analysis: TechStackAnalysis,
  ): Promise<void> {
    // Check for TypeScript
    if (await this.exists(join(repoPath, 'tsconfig.json'))) {
      analysis.languages.primary = 'typescript';
      analysis.aiReadiness.typescriptUsage = true;
    } else {
      analysis.languages.primary = 'javascript';
    }

    // In a full implementation, we would scan source files to detect:
    // - Secondary languages
    // - Total language count
    // For now, set reasonable defaults
    analysis.languages.secondary = ['json'];
    analysis.languages.totalLanguages = 2;
  }

  private async analyzeInfrastructure(
    repoPath: string,
    analysis: TechStackAnalysis,
  ): Promise<void> {
    // Check for CI configuration
    const ciPaths = [
      '.github/workflows',
      '.gitlab-ci.yml',
      'jenkinsfile',
      'azure-pipelines.yml',
      '.travis.yml',
    ];

    for (const path of ciPaths) {
      if (await this.exists(join(repoPath, path))) {
        analysis.infrastructure.ciConfigured = true;
        break;
      }
    }

    // Check for containerization
    const containerPaths = [
      'Dockerfile',
      'docker-compose.yml',
      'docker-compose.yaml',
      '.dockerignore',
    ];

    for (const path of containerPaths) {
      if (await this.exists(join(repoPath, path))) {
        analysis.infrastructure.containerization = true;
        break;
      }
    }

    // Check for documentation
    const docPaths = ['README.md', 'docs/', 'doc/', '.github/README.md'];

    for (const path of docPaths) {
      if (await this.exists(join(repoPath, path))) {
        analysis.aiReadiness.documentation = true;
        break;
      }
    }

    // Check for test coverage setup
    analysis.aiReadiness.testCoverage =
      analysis.infrastructure.testingFrameworks.length > 0;

    // Check for modern framework
    analysis.aiReadiness.modernFramework = analysis.languages.frameworks.some(
      (framework) =>
        ['react', 'vue', 'next', 'nuxt', 'svelte'].includes(
          framework.toLowerCase(),
        ),
    );
  }

  private calculateAiReadiness(analysis: TechStackAnalysis): void {
    let score = 0;
    const maxScore = 4;

    if (analysis.aiReadiness.typescriptUsage) score++;
    if (analysis.aiReadiness.modernFramework) score++;
    if (analysis.aiReadiness.testCoverage) score++;
    if (analysis.aiReadiness.documentation) score++;

    // Bonus points for AI-related dependencies
    if (analysis.dependencies.aiRelated.length > 0) {
      score += Math.min(analysis.dependencies.aiRelated.length, 2);
    }

    analysis.aiReadiness.score = Math.min((score / (maxScore + 2)) * 100, 100);
  }

  private async exists(path: string): Promise<boolean> {
    try {
      await access(path, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }
}
