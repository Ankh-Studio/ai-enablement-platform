/**
 * Inference Validation Integration Tests
 * 
 * Tests CLI inference logic using our current repo and mock data
 */

import { beforeAll, describe, expect, it } from 'bun:test';
import { execSync } from 'node:child_process';
import { InferenceValidator } from './utils/inference-validator';
import { ScoreAnalyzer } from './utils/score-analyzer';

describe('Inference Validation Tests', () => {
  let inferenceValidator: InferenceValidator;
  let scoreAnalyzer: ScoreAnalyzer;

  beforeAll(() => {
    inferenceValidator = new InferenceValidator();
    scoreAnalyzer = new ScoreAnalyzer();
  });

  describe('CLI Execution Validation', () => {
    it('should execute all CLI commands without errors', () => {
      // Test analyze command
      const analyzeResult = execSync('node dist/cli/index.js analyze . --format json', {
        encoding: 'utf-8',
        cwd: process.cwd()
      });
      
      expect(analyzeResult).toBeDefined();
      const analysisJson = extractJsonFromOutput(analyzeResult);
      const analysis = JSON.parse(analysisJson);
      expect(analysis.scores).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
      expect(analysis.metadata).toBeDefined();

      // Test score command
      const scoreResult = execSync('node dist/cli/index.js score . --json', {
        encoding: 'utf-8',
        cwd: process.cwd()
      });
      
      expect(scoreResult).toBeDefined();
      const scoreJson = extractJsonFromOutput(scoreResult);
      const scores = JSON.parse(scoreJson);
      expect(scores.repoReadiness).toBeDefined();
      expect(scores.teamReadiness).toBeDefined();
      expect(scores.orgReadiness).toBeDefined();
      expect(scores.overallMaturity).toBeDefined();

      // Test recommend command
      const recommendResult = execSync('node dist/cli/index.js recommend .', {
        encoding: 'utf-8',
        cwd: process.cwd()
      });
      
      expect(recommendResult).toBeDefined();
      expect(recommendResult).toContain('Recommendations');

      // Test path command
      const pathResult = execSync('node dist/cli/index.js path . --format json', {
        encoding: 'utf-8',
        cwd: process.cwd()
      });
      
      expect(pathResult).toBeDefined();
      const pathJson = extractJsonFromOutput(pathResult);
      const roadmap = JSON.parse(pathJson);
      expect(roadmap.phases).toBeDefined();
      expect(roadmap.summary).toBeDefined();
      expect(roadmap.metadata).toBeDefined();
    });
  });

  // Helper function to extract JSON from CLI output
  function extractJsonFromOutput(output: string): string {
    // Find the start of JSON (first {) and end of JSON (last })
    const jsonStart = output.indexOf('{');
    const jsonEnd = output.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('No JSON found in output');
    }
    
    return output.substring(jsonStart, jsonEnd + 1);
  }

  describe('Score Inference Validation', () => {
    it('should maintain score consistency across multiple runs', () => {
      const scores = [];
      
      // Run the same command multiple times
      for (let i = 0; i < 3; i++) {
        const result = execSync('node dist/cli/index.js score . --json', {
          encoding: 'utf-8',
          cwd: process.cwd()
        });
        scores.push(JSON.parse(extractJsonFromOutput(result)));
      }
      
      const consistency = scoreAnalyzer.validateScoreConsistency(scores);
      expect(consistency.isConsistent).toBe(true);
      expect(consistency.maxVariance).toBeLessThan(5); // Should be very consistent
    });

    it('should produce scores in expected range for our repo', () => {
      const result = execSync('node dist/cli/index.js score . --json', {
        encoding: 'utf-8',
        cwd: process.cwd()
      });
      
      const scores = JSON.parse(extractJsonFromOutput(result));
      
      // Our repo should score in the developing range (2-4)
      expect(scores.overallMaturity).toBeGreaterThanOrEqual(2);
      expect(scores.overallMaturity).toBeLessThanOrEqual(4);
      
      // Individual scores should be reasonable
      expect(scores.repoReadiness).toBeGreaterThanOrEqual(0);
      expect(scores.repoReadiness).toBeLessThanOrEqual(100);
      expect(scores.teamReadiness).toBeGreaterThanOrEqual(0);
      expect(scores.teamReadiness).toBeLessThanOrEqual(100);
      expect(scores.orgReadiness).toBeGreaterThanOrEqual(0);
      expect(scores.orgReadiness).toBeLessThanOrEqual(100);
    });

    it('should identify logical score patterns', () => {
      const result = execSync('node dist/cli/index.js score . --json', {
        encoding: 'utf-8',
        cwd: process.cwd()
      });
      
      const scores = JSON.parse(extractJsonFromOutput(result));
      const patternAnalysis = scoreAnalyzer.analyzeScorePatterns({ worst: { scores } });
      
      expect(patternAnalysis.hasLogicalPatterns).toBe(true);
      expect(patternAnalysis.patterns).toBeDefined();
      expect(patternAnalysis.anomalies).toBeDefined();
    });
  });

  describe('Recommendation Inference Validation', () => {
    it('should provide appropriate recommendations for our repo type', () => {
      const result = execSync('node dist/cli/index.js analyze . --format json', {
        encoding: 'utf-8',
        cwd: process.cwd()
      });
      
      const analysis = JSON.parse(extractJsonFromOutput(result));
      
      // Should have recommendations
      expect(analysis.recommendations.length).toBeGreaterThan(0);
      
      // Recommendations should have required fields
      analysis.recommendations.forEach((rec: any) => {
        expect(rec.title).toBeDefined();
        expect(rec.description).toBeDefined();
        expect(rec.priority).toBeDefined();
        expect(rec.category).toBeDefined();
        expect(rec.effort).toBeDefined();
        expect(rec.timeframe).toBeDefined();
      });

      // Should have foundational recommendations for a repo with no AI adoption
      const foundationalRecs = analysis.recommendations.filter((r: any) => 
        r.category === 'foundation' || r.category === 'security'
      );
      expect(foundationalRecs.length).toBeGreaterThan(0);
    });

    it('should have consistent effort-timeframe estimates', () => {
      const result = execSync('node dist/cli/index.js analyze . --format json', {
        encoding: 'utf-8',
        cwd: process.cwd()
      });
      
      const analysis = JSON.parse(extractJsonFromOutput(result));
      const testResults = { worst: { analysis } };
      
      const effortValidation = inferenceValidator.validateEffortTimeframeConsistency(testResults);
      expect(effortValidation.isValid).toBe(true);
    });

    it('should have logically sound dependencies', () => {
      const result = execSync('node dist/cli/index.js analyze . --format json', {
        encoding: 'utf-8',
        cwd: process.cwd()
      });
      
      const analysis = JSON.parse(extractJsonFromOutput(result));
      const testResults = { worst: { analysis } };
      
      const dependencyValidation = inferenceValidator.validateDependencies(testResults);
      expect(dependencyValidation.isValid).toBe(true);
    });
  });

  describe('Roadmap Inference Validation', () => {
    it('should generate appropriate roadmap for our repo maturity', () => {
      const result = execSync('node dist/cli/index.js path . --format json', {
        encoding: 'utf-8',
        cwd: process.cwd()
      });
      
      const roadmap = JSON.parse(extractJsonFromOutput(result));
      
      // Should have phases
      expect(roadmap.phases.length).toBeGreaterThan(0);
      expect(roadmap.phases.length).toBeLessThanOrEqual(4);
      
      // Should have summary and metadata
      expect(roadmap.summary).toBeDefined();
      expect(roadmap.metadata).toBeDefined();
      
      // Current maturity should be in developing range
      expect(roadmap.summary.currentMaturity).toBeGreaterThanOrEqual(2);
      expect(roadmap.summary.currentMaturity).toBeLessThanOrEqual(4);
    });

    it('should have coherent action sequences', () => {
      const result = execSync('node dist/cli/index.js path . --format json', {
        encoding: 'utf-8',
        cwd: process.cwd()
      });
      
      const roadmap = JSON.parse(extractJsonFromOutput(result));
      const testResults = { worst: { roadmap } };
      
      const actionValidation = inferenceValidator.validateActionCoherence(testResults);
      expect(actionValidation.isValid).toBe(true);
    });

    it('should have no logical contradictions', () => {
      const result = execSync('node dist/cli/index.js analyze . --format json', {
        encoding: 'utf-8',
        cwd: process.cwd()
      });
      
      const analysis = JSON.parse(extractJsonFromOutput(result));
      const testResults = { worst: { analysis } };
      
      const contradictionCheck = inferenceValidator.checkForContradictions(testResults);
      expect(contradictionCheck.hasContradictions).toBe(false);
    });
  });

  describe('Quality Assurance Validation', () => {
    it('should form coherent dependency graphs', () => {
      const result = execSync('node dist/cli/index.js analyze . --format json', {
        encoding: 'utf-8',
        cwd: process.cwd()
      });
      
      const analysis = JSON.parse(extractJsonFromOutput(result));
      const testResults = { worst: { analysis } };
      
      const graphValidation = inferenceValidator.validateDependencyGraphs(testResults);
      expect(graphValidation.isValid).toBe(true);
    });

    it('should provide proportional timeline estimates', () => {
      const result = execSync('node dist/cli/index.js path . --format json', {
        encoding: 'utf-8',
        cwd: process.cwd()
      });
      
      const roadmap = JSON.parse(extractJsonFromOutput(result));
      const testResults = { worst: { roadmap } };
      
      const timelineValidation = inferenceValidator.validateTimelineEffortRatio(testResults);
      expect(timelineValidation.isValid).toBe(true);
    });
  });

  describe('Mock Repository Comparison', () => {
    it('should validate inference logic with mock data', () => {
      // Create mock test results representing different repository types
      const mockTestResults = {
        worst: {
          scores: {
            repoReadiness: 35,
            teamReadiness: 30,
            orgReadiness: 25,
            overallMaturity: 2
          },
          analysis: {
            recommendations: [
              {
                title: 'Add basic testing framework',
                description: 'Implement unit and integration tests',
                priority: 'high',
                category: 'foundation',
                effort: 'medium',
                timeframe: '2-4 weeks',
                dependencies: [],
                expectedOutcomes: ['Improved code quality', 'Better test coverage']
              },
              {
                title: 'Implement CI/CD pipeline',
                description: 'Set up automated build and deployment',
                priority: 'high',
                category: 'workflow',
                effort: 'large',
                timeframe: '1-2 months',
                dependencies: ['Add basic testing framework'],
                expectedOutcomes: ['Automated deployments', 'Faster feedback loops']
              }
            ]
          },
          roadmap: {
            phases: [
              {
                id: 'foundation',
                name: 'Foundation & Infrastructure',
                duration: '3 months',
                priority: 'critical',
                actions: [
                  {
                    title: 'Add basic testing framework',
                    effort: 'medium',
                    timeframe: '2-4 weeks',
                    dependencies: [],
                    expectedOutcomes: ['Improved code quality']
                  }
                ]
              },
              {
                id: 'integration',
                name: 'AI Integration & Adoption',
                duration: '5 months',
                priority: 'high',
                actions: []
              }
            ],
            summary: {
              currentMaturity: 2,
              targetMaturity: 5,
              criticalPath: ['Foundation & Infrastructure']
            }
          }
        },
        best: {
          scores: {
            repoReadiness: 85,
            teamReadiness: 80,
            orgReadiness: 75,
            overallMaturity: 7
          },
          analysis: {
            recommendations: [
              {
                title: 'Optimize AI workflows',
                description: 'Fine-tune AI tooling for better performance',
                priority: 'medium',
                category: 'optimization',
                effort: 'small',
                timeframe: '1-2 weeks',
                dependencies: [],
                expectedOutcomes: ['Better AI performance', 'Improved developer experience']
              }
            ]
          },
          roadmap: {
            phases: [
              {
                id: 'optimization',
                name: 'Optimization & Scale',
                duration: '2 months',
                priority: 'medium',
                actions: [
                  {
                    title: 'Optimize AI workflows',
                    effort: 'small',
                    timeframe: '1-2 weeks',
                    dependencies: [],
                    expectedOutcomes: ['Better AI performance']
                  }
                ]
              }
            ],
            summary: {
              currentMaturity: 7,
              targetMaturity: 8,
              criticalPath: ['Optimization & Scale']
            }
          }
        }
      };

      // Test score progression
      const scoreValidation = scoreAnalyzer.validateScoreProgression(mockTestResults);
      expect(scoreValidation.isValid).toBe(true);
      expect(scoreValidation.worstToBestDifference).toBeGreaterThan(2);

      // Test recommendation categories
      const categoryValidation = inferenceValidator.validateRecommendationCategories(mockTestResults);
      expect(categoryValidation.isValid).toBe(true);

      // Test roadmap phases
      const phaseValidation = inferenceValidator.validateRoadmapPhases(mockTestResults);
      expect(phaseValidation.isValid).toBe(true);
    });
  });
});
