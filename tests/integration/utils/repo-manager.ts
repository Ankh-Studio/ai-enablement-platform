/**
 * Repository Manager Utility
 * 
 * Handles cloning, setup, and cleanup of test repositories
 */

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

export class RepoManager {
  private testDir: string;
  private repos: Map<string, string> = new Map();

  constructor() {
    this.testDir = join(process.cwd(), 'tmp', 'test-repos');
    this.ensureTestDir();
  }

  private ensureTestDir(): void {
    if (!existsSync(this.testDir)) {
      mkdirSync(this.testDir, { recursive: true });
    }
  }

  async setupTestRepos(): Promise<void> {
    // Setup worst case (our current repo - local copy)
    this.repos.set('worst', process.cwd());

    // Setup best case (microsoft/vscode-copilot-chat)
    await this.cloneRepo('best', 'https://github.com/microsoft/vscode-copilot-chat');

    // Setup middle case (a popular repo with some AI tooling)
    await this.cloneRepo('middle', 'https://github.com/microsoft/vscode');
  }

  private async cloneRepo(type: string, url: string): Promise<void> {
    const targetPath = join(this.testDir, type);
    
    // Clean up if directory exists
    if (existsSync(targetPath)) {
      rmSync(targetPath, { recursive: true, force: true });
    }

    try {
      console.log(`Cloning ${type} case repository: ${url}`);
      execSync(`git clone ${url} ${targetPath}`, {
        stdio: 'pipe',
        timeout: 60000 // 60 second timeout
      });
      
      this.repos.set(type, targetPath);
      console.log(`Successfully cloned ${type} case repository`);
    } catch (error) {
      console.error(`Failed to clone ${type} case repository:`, error);
      throw error;
    }
  }

  getWorstCaseRepo(): string {
    return this.repos.get('worst') || process.cwd();
  }

  getBestCaseRepo(): string {
    const path = this.repos.get('best');
    if (!path || !existsSync(path)) {
      throw new Error('Best case repository not available');
    }
    return path;
  }

  getMiddleCaseRepo(): string {
    const path = this.repos.get('middle');
    if (!path || !existsSync(path)) {
      throw new Error('Middle case repository not available');
    }
    return path;
  }

  getAllRepos(): { type: string; path: string }[] {
    return Array.from(this.repos.entries()).map(([type, path]) => ({ type, path }));
  }

  async cleanupTestRepos(): Promise<void> {
    console.log('Cleaning up test repositories...');
    
    // Only clean up cloned repos, not our current working directory
    const clonedTypes = ['best', 'middle'];
    
    for (const type of clonedTypes) {
      const path = this.repos.get(type);
      if (path && existsSync(path) && path !== process.cwd()) {
        try {
          rmSync(path, { recursive: true, force: true });
          console.log(`Cleaned up ${type} case repository`);
        } catch (error) {
          console.error(`Failed to clean up ${type} case repository:`, error);
        }
      }
    }

    // Clean up test directory if it's empty
    try {
      if (existsSync(this.testDir)) {
        const files = require('fs').readdirSync(this.testDir);
        if (files.length === 0) {
          rmSync(this.testDir, { recursive: true, force: true });
          console.log('Cleaned up test directory');
        }
      }
    } catch (error) {
      console.error('Failed to clean up test directory:', error);
    }
  }

  getRepoMetadata(type: string): any {
    const path = this.repos.get(type);
    if (!path || !existsSync(path)) {
      return null;
    }

    try {
      // Basic repository metadata
      const packageJsonPath = join(path, 'package.json');
      const hasPackageJson = existsSync(packageJsonPath);
      
      const readmePath = join(path, 'README.md');
      const hasReadme = existsSync(readmePath);

      // Check for AI-related files and configurations
      const aiIndicators = {
        hasCopilotConfig: existsSync(join(path, '.github/copilot-instructions.md')),
        hasAIDependencies: false,
        hasAIWorkflows: false,
        hasAIDocumentation: false
      };

      if (hasPackageJson) {
        const packageJson = JSON.parse(require('fs').readFileSync(packageJsonPath, 'utf-8'));
        aiIndicators.hasAIDependencies = this.checkForAIDependencies(packageJson);
      }

      // Check for AI-related documentation
      const docsPath = join(path, 'docs');
      if (existsSync(docsPath)) {
        aiIndicators.hasAIDocumentation = this.checkForAIDocumentation(docsPath);
      }

      // Check for AI-related workflows
      const workflowsPath = join(path, '.github', 'workflows');
      if (existsSync(workflowsPath)) {
        aiIndicators.hasAIWorkflows = this.checkForAIWorkflows(workflowsPath);
      }

      return {
        type,
        path,
        hasPackageJson,
        hasReadme,
        aiIndicators,
        estimatedComplexity: this.estimateComplexity(path)
      };
    } catch (error) {
      console.error(`Failed to get metadata for ${type} repository:`, error);
      return null;
    }
  }

  private checkForAIDependencies(packageJson: any): boolean {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const aiKeywords = ['copilot', 'openai', 'ai', 'ml', 'tensorflow', 'pytorch', 'huggingface'];
    
    return Object.keys(deps).some(dep => 
      aiKeywords.some(keyword => dep.toLowerCase().includes(keyword))
    );
  }

  private checkForAIDocumentation(docsPath: string): boolean {
    try {
      const files = require('fs').readdirSync(docsPath, { withFileTypes: true });
      return files.some((file: any) => {
        const name = file.name.toLowerCase();
        return file.isFile() && (name.includes('ai') || name.includes('copilot') || name.includes('ml'));
      });
    } catch {
      return false;
    }
  }

  private checkForAIWorkflows(workflowsPath: string): boolean {
    try {
      const files = require('fs').readdirSync(workflowsPath);
      return files.some((file: any) => {
        const content = require('fs').readFileSync(join(workflowsPath, file), 'utf-8');
        return content.toLowerCase().includes('copilot') || content.toLowerCase().includes('ai');
      });
    } catch {
      return false;
    }
  }

  private estimateComplexity(path: string): 'low' | 'medium' | 'high' {
    try {
      let fileCount = 0;
      let dirCount = 0;
      
      const countItems = (dir: string, depth = 0) => {
        if (depth > 3) return; // Limit depth for performance
        
        const items = require('fs').readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
          if (item.isDirectory()) {
            dirCount++;
            countItems(join(dir, item.name), depth + 1);
          } else {
            fileCount++;
          }
        }
      };

      countItems(path);

      if (fileCount < 100 && dirCount < 10) return 'low';
      if (fileCount < 500 && dirCount < 50) return 'medium';
      return 'high';
    } catch {
      return 'medium';
    }
  }
}
