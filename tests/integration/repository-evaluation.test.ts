/**
 * Repository Evaluation Integration Tests
 * 
 * Tests CLI against repositories with different AI/Copilot adoption levels
 * using inference-based validation instead of exact matches
 */

import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { RepoManager } from './utils/repo-manager';
import { InferenceValidator } from './utils/inference-validator';
import { ScoreAnalyzer } from './utils/score-analyzer';

describe('Repository Evaluation Integration Tests', () => {
  let repoManager: RepoManager;
  let inferenceValidator: InferenceValidator;
  let scoreAnalyzer: ScoreAnalyzer;
  let testResults: any = {};

  beforeAll(async () => {
    repoManager = new RepoManager();
    inferenceValidator = new InferenceValidator();
    scoreAnalyzer = new ScoreAnalyzer();
    
    // Setup test repositories
    await repoManager.setupTestRepos();
  });

  afterAll(async () => {
    // Cleanup test repositories
    await repoManager.cleanupTestRepos();
  });

  describe('CLI Command Execution', () => {
    const repos = [
      { name: 'ai-enablement-platform', type: 'worst', path: repoManager.getWorstCaseRepo() },
      { name: 'microsoft/vscode-copilot-chat', type: 'best', path: repoManager.getBestCaseRepo() },
      { name: 'middle-case-repo', type: 'middle', path: repoManager.getMiddleCaseRepo() }
    ];

    repos.forEach(repo => {
      describe(`${repo.name} (${repo.type} case)`, () => {
        it('should execute analyze command without errors', () => {
          const result = execSync(`node dist/cli/index.js analyze ${repo.path} --format json`, {
            encoding: 'utf-8',
            cwd: process.cwd()
          });
          
          expect(result).toBeDefined();
          const analysis = JSON.parse(result);
          testResults[repo.type] = { ...testResults[repo.type], analysis };
          
          expect(analysis.scores).toBeDefined();
          expect(analysis.recommendations).toBeDefined();
          expect(analysis.metadata).toBeDefined();
        });

        it('should execute score command without errors', () => {
          const result = execSync(`node dist/cli/index.js score ${repo.path} --json`, {
            encoding: 'utf-8',
            cwd: process.cwd()
          });
          
          expect(result).toBeDefined();
          const scores = JSON.parse(result);
          testResults[repo.type] = { ...testResults[repo.type], scores };
          
          expect(scores.repoReadiness).toBeDefined();
          expect(scores.teamReadiness).toBeDefined();
          expect(scores.orgReadiness).toBeDefined();
          expect(scores.overallMaturity).toBeDefined();
        });

        it('should execute recommend command without errors', () => {
          const result = execSync(`node dist/cli/index.js recommend ${repo.path}`, {
            encoding: 'utf-8',
            cwd: process.cwd()
          });
          
          expect(result).toBeDefined();
          expect(result).toContain('Recommendations');
        });

        it('should execute adr command without errors', () => {
          const result = execSync(`node dist/cli/index.js adr ${repo.path}`, {
            encoding: 'utf-8',
            cwd: process.cwd()
          });
          
          expect(result).toBeDefined();
          expect(result).toContain('Architecture Decision Record');
        });

        it('should execute path command without errors', () => {
          const result = execSync(`node dist/cli/index.js path ${repo.path} --format json`, {
            encoding: 'utf-8',
            cwd: process.cwd()
          });
          
          expect(result).toBeDefined();
          const roadmap = JSON.parse(result);
          testResults[repo.type] = { ...testResults[repo.type], roadmap };
          
          expect(roadmap.phases).toBeDefined();
          expect(roadmap.summary).toBeDefined();
          expect(roadmap.metadata).toBeDefined();
        });
      });
    });
  });

  describe('Inference-Based Score Validation', () => {
    it('should show logical score progression across repository types', () => {
      const scoreValidation = scoreAnalyzer.validateScoreProgression(testResults);
      
      expect(scoreValidation.isValid).toBe(true);
      expect(scoreValidation.worstToBestDifference).toBeGreaterThan(30);
      expect(scoreValidation.middleInRange).toBe(true);
    });

    it('should maintain score consistency across multiple runs', () => {
      // Test the same repo multiple times to ensure consistency
      const repoPath = repoManager.getWorstCaseRepo();
      const scores = [];
      
      for (let i = 0; i < 3; i++) {
        const result = execSync(`node dist/cli/index.js score ${repoPath} --json`, {
          encoding: 'utf-8',
          cwd: process.cwd()
        });
        scores.push(JSON.parse(result));
      }
      
      const consistency = scoreAnalyzer.validateScoreConsistency(scores);
      expect(consistency.isConsistent).toBe(true);
      expect(consistency.maxVariance).toBeLessThan(10);
    });

    it('should correlate scores with repository characteristics', () => {
      const correlation = inferenceValidator.validateScoreRepoCorrelation(testResults);
      expect(correlation.isValid).toBe(true);
    });
  });

  describe('Inference-Based Recommendation Validation', () => {
    it('should provide appropriate recommendation categories for each repository type', () => {
      const categoryValidation = inferenceValidator.validateRecommendationCategories(testResults);
      expect(categoryValidation.isValid).toBe(true);
    });

    it('should prioritize recommendations logically', () => {
      const priorityValidation = inferenceValidator.validateRecommendationPriorities(testResults);
      expect(priorityValidation.isValid).toBe(true);
    });

    it('should provide consistent effort-timeframe estimates', () => {
      const effortValidation = inferenceValidator.validateEffortTimeframeConsistency(testResults);
      expect(effortValidation.isValid).toBe(true);
    });

    it('should have logically sound dependencies', () => {
      const dependencyValidation = inferenceValidator.validateDependencies(testResults);
      expect(dependencyValidation.isValid).toBe(true);
    });
  });

  describe('Inference-Based Roadmap Validation', () => {
    it('should align roadmap phases with maturity levels', () => {
      const phaseValidation = inferenceValidator.validateRoadmapPhases(testResults);
      expect(phaseValidation.isValid).toBe(true);
    });

    it('should provide proportional timelines', () => {
      const timelineValidation = inferenceValidator.validateTimelineProportionality(testResults);
      expect(timelineValidation.isValid).toBe(true);
    });

    it('should identify appropriate critical paths', () => {
      const criticalPathValidation = inferenceValidator.validateCriticalPaths(testResults);
      expect(criticalPathValidation.isValid).toBe(true);
    });

    it('should provide coherent action sequences', () => {
      const actionValidation = inferenceValidator.validateActionCoherence(testResults);
      expect(actionValidation.isValid).toBe(true);
    });
  });

  describe('Quality Assurance Metrics', () => {
    it('should have no logical contradictions in recommendations', () => {
      const contradictionCheck = inferenceValidator.checkForContradictions(testResults);
      expect(contradictionCheck.hasContradictions).toBe(false);
    });

    it('should form coherent dependency graphs', () => {
      const graphValidation = inferenceValidator.validateDependencyGraphs(testResults);
      expect(graphValidation.isValid).toBe(true);
    });

    it('should provide proportional timeline estimates', () => {
      const timelineValidation = inferenceValidator.validateTimelineEffortRatio(testResults);
      expect(timelineValidation.isValid).toBe(true);
    });
  });
});
