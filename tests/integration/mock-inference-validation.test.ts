/**
 * Mock Inference Validation Tests
 * 
 * Tests inference validation logic with mock data only
 */

import { describe, it, expect, beforeAll } from 'bun:test';
import { InferenceValidator } from './utils/inference-validator';
import { ScoreAnalyzer } from './utils/score-analyzer';

describe('Mock Inference Validation Tests', () => {
  let inferenceValidator: InferenceValidator;
  let scoreAnalyzer: ScoreAnalyzer;

  beforeAll(() => {
    inferenceValidator = new InferenceValidator();
    scoreAnalyzer = new ScoreAnalyzer();
  });

  describe('Score Progression Validation', () => {
    it('should validate logical score progression', () => {
      const mockTestResults = {
        worst: {
          scores: {
            repoReadiness: 35,
            teamReadiness: 30,
            orgReadiness: 25,
            overallMaturity: 2
          }
        },
        middle: {
          scores: {
            repoReadiness: 55,
            teamReadiness: 50,
            orgReadiness: 45,
            overallMaturity: 4
          }
        },
        best: {
          scores: {
            repoReadiness: 85,
            teamReadiness: 80,
            orgReadiness: 75,
            overallMaturity: 7
          }
        }
      };

      const scoreValidation = scoreAnalyzer.validateScoreProgression(mockTestResults);
      expect(scoreValidation.isValid).toBe(true);
      expect(scoreValidation.worstToBestDifference).toBeGreaterThan(2);
      expect(scoreValidation.middleInRange).toBe(true);
    });

    it('should detect invalid score progression', () => {
      const mockTestResults = {
        worst: {
          scores: {
            repoReadiness: 80,
            teamReadiness: 75,
            orgReadiness: 70,
            overallMaturity: 6
          }
        },
        best: {
          scores: {
            repoReadiness: 30,
            teamReadiness: 25,
            orgReadiness: 20,
            overallMaturity: 2
          }
        }
      };

      const scoreValidation = scoreAnalyzer.validateScoreProgression(mockTestResults);
      expect(scoreValidation.isValid).toBe(false);
      expect(scoreValidation.errors.length).toBeGreaterThan(0);
    });

    it('should validate score consistency', () => {
      const scores = [
        {
          repoReadiness: 43,
          teamReadiness: 42,
          orgReadiness: 39,
          overallMaturity: 3
        },
        {
          repoReadiness: 43,
          teamReadiness: 42,
          orgReadiness: 39,
          overallMaturity: 3
        },
        {
          repoReadiness: 43,
          teamReadiness: 42,
          orgReadiness: 39,
          overallMaturity: 3
        }
      ];

      const consistency = scoreAnalyzer.validateScoreConsistency(scores);
      expect(consistency.isConsistent).toBe(true);
      expect(consistency.maxVariance).toBeLessThan(5);
    });
  });

  describe('Recommendation Validation', () => {
    it('should validate appropriate recommendation categories', () => {
      const mockTestResults = {
        worst: {
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
                title: 'Implement security scanning',
                description: 'Add security vulnerability scanning',
                priority: 'high',
                category: 'security',
                effort: 'medium',
                timeframe: '2-4 weeks',
                dependencies: [],
                expectedOutcomes: ['Better security posture']
              }
            ]
          }
        },
        best: {
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
                expectedOutcomes: ['Better AI performance']
              }
            ]
          }
        }
      };

      const categoryValidation = inferenceValidator.validateRecommendationCategories(mockTestResults);
      expect(categoryValidation.isValid).toBe(true);
    });

    it('should validate effort-timeframe consistency', () => {
      const mockTestResults = {
        worst: {
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
                expectedOutcomes: ['Improved code quality']
              },
              {
                title: 'Add CODEOWNERS file',
                description: 'Define code ownership',
                priority: 'medium',
                category: 'security',
                effort: 'small',
                timeframe: '1 week',
                dependencies: [],
                expectedOutcomes: ['Better security']
              }
            ]
          }
        }
      };

      const effortValidation = inferenceValidator.validateEffortTimeframeConsistency(mockTestResults);
      expect(effortValidation.isValid).toBe(true);
    });

    it('should detect invalid effort-timeframe combinations', () => {
      const mockTestResults = {
        worst: {
          analysis: {
            recommendations: [
              {
                title: 'Add basic testing framework',
                description: 'Implement unit and integration tests',
                priority: 'high',
                category: 'foundation',
                effort: 'small',
                timeframe: '6 months', // Invalid: small effort with long timeframe
                dependencies: [],
                expectedOutcomes: ['Improved code quality']
              }
            ]
          }
        }
      };

      const effortValidation = inferenceValidator.validateEffortTimeframeConsistency(mockTestResults);
      expect(effortValidation.isValid).toBe(false);
      expect(effortValidation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Roadmap Validation', () => {
    it('should validate roadmap phase progression', () => {
      const mockTestResults = {
        worst: {
          roadmap: {
            phases: [
              {
                id: 'foundation',
                name: 'Foundation & Infrastructure',
                duration: '3 months',
                priority: 'critical',
                actions: []
              },
              {
                id: 'integration',
                name: 'AI Integration & Adoption',
                duration: '5 months',
                priority: 'high',
                actions: []
              },
              {
                id: 'optimization',
                name: 'Optimization & Scale',
                duration: '4 months',
                priority: 'medium',
                actions: []
              }
            ],
            summary: {
              currentMaturity: 2,
              targetMaturity: 5,
              criticalPath: ['Foundation & Infrastructure', 'AI Integration & Adoption']
            }
          }
        },
        best: {
          roadmap: {
            phases: [
              {
                id: 'optimization',
                name: 'Optimization & Scale',
                duration: '2 months',
                priority: 'medium',
                actions: []
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

      const phaseValidation = inferenceValidator.validateRoadmapPhases(mockTestResults);
      expect(phaseValidation.isValid).toBe(true);
    });

    it('should validate timeline proportionality', () => {
      const mockTestResults = {
        worst: {
          roadmap: {
            phases: [
              {
                id: 'foundation',
                name: 'Foundation & Infrastructure',
                duration: '3 months',
                priority: 'critical',
                actions: []
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
              targetMaturity: 5
            }
          }
        },
        best: {
          roadmap: {
            phases: [
              {
                id: 'optimization',
                name: 'Optimization & Scale',
                duration: '2 months',
                priority: 'medium',
                actions: []
              }
            ],
            summary: {
              currentMaturity: 7,
              targetMaturity: 8
            }
          }
        }
      };

      const timelineValidation = inferenceValidator.validateTimelineProportionality(mockTestResults);
      expect(timelineValidation.isValid).toBe(true);
    });
  });

  describe('Quality Assurance Validation', () => {
    it('should detect contradictions in recommendations', () => {
      const mockTestResults = {
        worst: {
          analysis: {
            recommendations: [
              {
                title: 'Add authentication system',
                description: 'Implement user authentication',
                priority: 'high',
                category: 'security',
                effort: 'large',
                timeframe: '2-3 months',
                dependencies: [],
                expectedOutcomes: ['Better security']
              },
              {
                title: 'Remove authentication system',
                description: 'Remove user authentication',
                priority: 'low',
                category: 'security',
                effort: 'small',
                timeframe: '1 week',
                dependencies: [],
                expectedOutcomes: ['Simpler system']
              }
            ]
          }
        }
      };

      const contradictionCheck = inferenceValidator.checkForContradictions(mockTestResults);
      expect(contradictionCheck.hasContradictions).toBe(true);
      expect(contradictionCheck.contradictions.length).toBeGreaterThan(0);
    });

    it('should validate dependency graphs', () => {
      const mockTestResults = {
        worst: {
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
                expectedOutcomes: ['Improved code quality']
              },
              {
                title: 'Add integration tests',
                description: 'Add comprehensive integration tests',
                priority: 'medium',
                category: 'foundation',
                effort: 'medium',
                timeframe: '2-4 weeks',
                dependencies: ['Add basic testing framework'],
                expectedOutcomes: ['Better test coverage']
              }
            ]
          }
        }
      };

      const graphValidation = inferenceValidator.validateDependencyGraphs(mockTestResults);
      expect(graphValidation.isValid).toBe(true);
    });

    it('should detect circular dependencies', () => {
      const mockTestResults = {
        worst: {
          analysis: {
            recommendations: [
              {
                title: 'Task A',
                description: 'First task',
                priority: 'high',
                category: 'foundation',
                effort: 'medium',
                timeframe: '2-4 weeks',
                dependencies: ['Task B'],
                expectedOutcomes: ['First outcome']
              },
              {
                title: 'Task B',
                description: 'Second task',
                priority: 'high',
                category: 'foundation',
                effort: 'medium',
                timeframe: '2-4 weeks',
                dependencies: ['Task A'],
                expectedOutcomes: ['Second outcome']
              }
            ]
          }
        }
      };

      const graphValidation = inferenceValidator.validateDependencyGraphs(mockTestResults);
      expect(graphValidation.isValid).toBe(false);
      expect(graphValidation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Pattern Analysis', () => {
    it('should identify logical score patterns', () => {
      const mockTestResults = {
        worst: {
          scores: {
            repoReadiness: 43,
            teamReadiness: 42,
            orgReadiness: 39,
            overallMaturity: 3
          }
        }
      };

      const patternAnalysis = scoreAnalyzer.analyzeScorePatterns(mockTestResults);
      expect(patternAnalysis.hasLogicalPatterns).toBe(true);
      expect(patternAnalysis.patterns.length).toBeGreaterThan(0);
    });

    it('should detect score anomalies', () => {
      const mockTestResults = {
        worst: {
          scores: {
            repoReadiness: 100, // Perfect score - anomaly
            teamReadiness: 10,  // Very low score
            orgReadiness: 5,    // Very low score
            overallMaturity: 3  // Doesn't match average
          }
        }
      };

      const patternAnalysis = scoreAnalyzer.analyzeScorePatterns(mockTestResults);
      expect(patternAnalysis.anomalies.length).toBeGreaterThan(0);
    });
  });
});
