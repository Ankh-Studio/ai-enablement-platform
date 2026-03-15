/**
 * Inference Validator Utility
 * 
 * Validates CLI results using inference-based rules rather than exact matches
 */

export class InferenceValidator {
  
  validateRecommendationCategories(testResults: any): ValidationResult {
    const validation: ValidationResult = {
      isValid: true,
      details: [],
      errors: []
    };

    try {
      const worstRecs = testResults.worst?.analysis?.recommendations || [];
      const middleRecs = testResults.middle?.analysis?.recommendations || [];
      const bestRecs = testResults.best?.analysis?.recommendations || [];

      // Worst case should have more foundational recommendations
      const worstFoundational = worstRecs.filter((r: any) => 
        r.category === 'foundation' || r.category === 'security'
      ).length;

      const bestFoundational = bestRecs.filter((r: any) => 
        r.category === 'foundation' || r.category === 'security'
      ).length;

      if (worstFoundational <= bestFoundational) {
        validation.isValid = false;
        validation.errors.push('Worst case should have more foundational recommendations than best case');
      }

      // Best case should have more optimization/governance recommendations
      const bestOptimization = bestRecs.filter((r: any) => 
        r.category === 'ai' || r.category === 'governance'
      ).length;

      const worstOptimization = worstRecs.filter((r: any) => 
        r.category === 'ai' || r.category === 'governance'
      ).length;

      if (bestOptimization <= worstOptimization) {
        validation.isValid = false;
        validation.errors.push('Best case should have more optimization recommendations than worst case');
      }

      validation.details.push(`Worst foundational: ${worstFoundational}, Best foundational: ${bestFoundational}`);
      validation.details.push(`Best optimization: ${bestOptimization}, Worst optimization: ${worstOptimization}`);

    } catch (error) {
      validation.isValid = false;
      validation.errors.push(`Error validating recommendation categories: ${error}`);
    }

    return validation;
  }

  validateRecommendationPriorities(testResults: any): ValidationResult {
    const validation: ValidationResult = {
      isValid: true,
      details: [],
      errors: []
    };

    try {
      const worstRecs = testResults.worst?.analysis?.recommendations || [];
      const bestRecs = testResults.best?.analysis?.recommendations || [];

      // Worst case should have more high-priority recommendations
      const worstHigh = worstRecs.filter((r: any) => r.priority === 'high').length;
      const bestHigh = bestRecs.filter((r: any) => r.priority === 'high').length;

      if (worstHigh < bestHigh) {
        validation.isValid = false;
        validation.errors.push('Worst case should have more high-priority recommendations');
      }

      validation.details.push(`Worst high priority: ${worstHigh}, Best high priority: ${bestHigh}`);

    } catch (error) {
      validation.isValid = false;
      validation.errors.push(`Error validating recommendation priorities: ${error}`);
    }

    return validation;
  }

  validateEffortTimeframeConsistency(testResults: any): ValidationResult {
    const validation: ValidationResult = {
      isValid: true,
      details: [],
      errors: []
    };

    try {
      const allRecs = [
        ...(testResults.worst?.analysis?.recommendations || []),
        ...(testResults.middle?.analysis?.recommendations || []),
        ...(testResults.best?.analysis?.recommendations || [])
      ];

      const inconsistencies: string[] = [];

      allRecs.forEach((rec: any) => {
        const { effort, timeframe } = rec;
        
        // Check for logical consistency between effort and timeframe
        if (effort === 'small' && timeframe.includes('months')) {
          inconsistencies.push(`Small effort with long timeframe: ${rec.title}`);
        }
        if (effort === 'large' && timeframe.includes('days')) {
          inconsistencies.push(`Large effort with short timeframe: ${rec.title}`);
        }
      });

      if (inconsistencies.length > 0) {
        validation.isValid = false;
        validation.errors.push(...inconsistencies);
      }

      validation.details.push(`Checked ${allRecs.length} recommendations for effort-timeframe consistency`);

    } catch (error) {
      validation.isValid = false;
      validation.errors.push(`Error validating effort-timeframe consistency: ${error}`);
    }

    return validation;
  }

  validateDependencies(testResults: any): ValidationResult {
    const validation: ValidationResult = {
      isValid: true,
      details: [],
      errors: []
    };

    try {
      const allRecs = [
        ...(testResults.worst?.analysis?.recommendations || []),
        ...(testResults.middle?.analysis?.recommendations || []),
        ...(testResults.best?.analysis?.recommendations || [])
      ];

      const dependencyIssues: string[] = [];

      allRecs.forEach((rec: any) => {
        if (rec.dependencies && rec.dependencies.length > 0) {
          // Check for self-dependencies
          if (rec.dependencies.includes(rec.title)) {
            dependencyIssues.push(`Self-dependency detected: ${rec.title}`);
          }

          // Check for circular dependencies (simplified check)
          rec.dependencies.forEach((dep: string) => {
            const depRec = allRecs.find((r: any) => r.title === dep);
            if (depRec && depRec.dependencies && depRec.dependencies.includes(rec.title)) {
              dependencyIssues.push(`Circular dependency detected: ${rec.title} <-> ${dep}`);
            }
          });
        }
      });

      if (dependencyIssues.length > 0) {
        validation.isValid = false;
        validation.errors.push(...dependencyIssues);
      }

      validation.details.push(`Checked ${allRecs.length} recommendations for dependency issues`);

    } catch (error) {
      validation.isValid = false;
      validation.errors.push(`Error validating dependencies: ${error}`);
    }

    return validation;
  }

  validateRoadmapPhases(testResults: any): ValidationResult {
    const validation: ValidationResult = {
      isValid: true,
      details: [],
      errors: []
    };

    try {
      const worstRoadmap = testResults.worst?.roadmap;
      const bestRoadmap = testResults.best?.roadmap;

      if (!worstRoadmap || !bestRoadmap) {
        validation.isValid = false;
        validation.errors.push('Missing roadmap data for comparison');
        return validation;
      }

      // Worst case should have more phases (more work needed)
      if (worstRoadmap.phases.length <= bestRoadmap.phases.length) {
        validation.isValid = false;
        validation.errors.push('Worst case should have more roadmap phases than best case');
      }

      // Check that phases are logically ordered
      const phaseOrder = ['foundation', 'integration', 'optimization'];
      const worstPhaseOrder = worstRoadmap.phases.map((p: any) => p.id);
      const bestPhaseOrder = bestRoadmap.phases.map((p: any) => p.id);

      // Simplified order validation
      if (!this.isValidPhaseOrder(worstPhaseOrder)) {
        validation.isValid = false;
        validation.errors.push('Worst case roadmap phases are not in logical order');
      }

      validation.details.push(`Worst phases: ${worstRoadmap.phases.length}, Best phases: ${bestRoadmap.phases.length}`);
      validation.details.push(`Worst order: ${worstPhaseOrder.join(', ')}, Best order: ${bestPhaseOrder.join(', ')}`);

    } catch (error) {
      validation.isValid = false;
      validation.errors.push(`Error validating roadmap phases: ${error}`);
    }

    return validation;
  }

  validateTimelineProportionality(testResults: any): ValidationResult {
    const validation: ValidationResult = {
      isValid: true,
      details: [],
      errors: []
    };

    try {
      const worstRoadmap = testResults.worst?.roadmap;
      const bestRoadmap = testResults.best?.roadmap;

      if (!worstRoadmap || !bestRoadmap) {
        validation.isValid = false;
        validation.errors.push('Missing roadmap data for timeline comparison');
        return validation;
      }

      // Extract total duration from roadmaps
      const worstDuration = this.extractTotalDuration(worstRoadmap);
      const bestDuration = this.extractTotalDuration(bestRoadmap);

      // Worst case should have longer timeline (more work needed)
      if (worstDuration <= bestDuration) {
        validation.isValid = false;
        validation.errors.push('Worst case should have longer timeline than best case');
      }

      validation.details.push(`Worst duration: ${worstDuration} months, Best duration: ${bestDuration} months`);

    } catch (error) {
      validation.isValid = false;
      validation.errors.push(`Error validating timeline proportionality: ${error}`);
    }

    return validation;
  }

  validateCriticalPaths(testResults: any): ValidationResult {
    const validation: ValidationResult = {
      isValid: true,
      details: [],
      errors: []
    };

    try {
      const worstRoadmap = testResults.worst?.roadmap;
      const bestRoadmap = testResults.best?.roadmap;

      if (!worstRoadmap || !bestRoadmap) {
        validation.isValid = false;
        validation.errors.push('Missing roadmap data for critical path validation');
        return validation;
      }

      // Critical paths should focus on high-priority items
      const worstCritical = worstRoadmap.summary.criticalPath || [];
      const bestCritical = bestRoadmap.summary.criticalPath || [];

      if (worstCritical.length === 0 || bestCritical.length === 0) {
        validation.isValid = false;
        validation.errors.push('Critical paths should not be empty');
      }

      validation.details.push(`Worst critical path: ${worstCritical.length} items, Best critical path: ${bestCritical.length} items`);

    } catch (error) {
      validation.isValid = false;
      validation.errors.push(`Error validating critical paths: ${error}`);
    }

    return validation;
  }

  validateActionCoherence(testResults: any): ValidationResult {
    const validation: ValidationResult = {
      isValid: true,
      details: [],
      errors: []
    };

    try {
      const allRoadmaps = [
        testResults.worst?.roadmap,
        testResults.middle?.roadmap,
        testResults.best?.roadmap
      ].filter(Boolean);

      let totalActions = 0;
      let incoherentActions = 0;

      allRoadmaps.forEach((roadmap: any) => {
        roadmap.phases.forEach((phase: any) => {
          phase.actions.forEach((action: any) => {
            totalActions++;
            
            // Check for action coherence
            if (!action.title || !action.description || !action.expectedOutcomes) {
              incoherentActions++;
            }
          });
        });
      });

      if (incoherentActions > 0) {
        validation.isValid = false;
        validation.errors.push(`${incoherentActions} incoherent actions found out of ${totalActions}`);
      }

      validation.details.push(`Checked ${totalActions} actions for coherence`);

    } catch (error) {
      validation.isValid = false;
      validation.errors.push(`Error validating action coherence: ${error}`);
    }

    return validation;
  }

  validateScoreRepoCorrelation(testResults: any): ValidationResult {
    const validation: ValidationResult = {
      isValid: true,
      details: [],
      errors: []
    };

    try {
      const worstScores = testResults.worst?.scores;
      const bestScores = testResults.best?.scores;

      if (!worstScores || !bestScores) {
        validation.isValid = false;
        validation.errors.push('Missing score data for correlation validation');
        return validation;
      }

      // Scores should correlate with repository characteristics
      const scoreDiff = bestScores.overallMaturity - worstScores.overallMaturity;
      
      if (scoreDiff < 2) {
        validation.isValid = false;
        validation.errors.push('Score difference between best and worst cases should be at least 2 points');
      }

      validation.details.push(`Score difference: ${scoreDiff} points`);
      validation.details.push(`Worst maturity: ${worstScores.overallMaturity}, Best maturity: ${bestScores.overallMaturity}`);

    } catch (error) {
      validation.isValid = false;
      validation.errors.push(`Error validating score-repo correlation: ${error}`);
    }

    return validation;
  }

  checkForContradictions(testResults: any): { hasContradictions: boolean; contradictions: string[] } {
    const contradictions: string[] = [];

    try {
      const allRecs = [
        ...(testResults.worst?.analysis?.recommendations || []),
        ...(testResults.middle?.analysis?.recommendations || []),
        ...(testResults.best?.analysis?.recommendations || [])
      ];

      // Check for contradictory recommendations
      allRecs.forEach((rec1: any, index1: number) => {
        allRecs.forEach((rec2: any, index2: number) => {
          if (index1 !== index2) {
            // Simple contradiction check (can be expanded)
            if (rec1.category === rec2.category && 
                rec1.priority === 'high' && 
                rec2.priority === 'low' &&
                this.areContradictory(rec1.title, rec2.title)) {
              contradictions.push(`Contradictory recommendations: ${rec1.title} vs ${rec2.title}`);
            }
          }
        });
      });

    } catch (error) {
      contradictions.push(`Error checking contradictions: ${error}`);
    }

    return {
      hasContradictions: contradictions.length > 0,
      contradictions
    };
  }

  validateDependencyGraphs(testResults: any): ValidationResult {
    const validation: ValidationResult = {
      isValid: true,
      details: [],
      errors: []
    };

    try {
      const allRecs = [
        ...(testResults.worst?.analysis?.recommendations || []),
        ...(testResults.middle?.analysis?.recommendations || []),
        ...(testResults.best?.analysis?.recommendations || [])
      ];

      // Build dependency graph
      const graph = new Map<string, string[]>();
      const allTitles = new Set(allRecs.map((r: any) => r.title));

      allRecs.forEach((rec: any) => {
        if (rec.dependencies) {
          graph.set(rec.title, rec.dependencies.filter((dep: string) => allTitles.has(dep)));
        }
      });

      // Check for cycles (simplified)
      const cycles = this.detectCycles(graph);
      if (cycles.length > 0) {
        validation.isValid = false;
        validation.errors.push(`Dependency cycles detected: ${cycles.join(', ')}`);
      }

      validation.details.push(`Dependency graph: ${graph.size} nodes, ${cycles.length} cycles`);

    } catch (error) {
      validation.isValid = false;
      validation.errors.push(`Error validating dependency graphs: ${error}`);
    }

    return validation;
  }

  validateTimelineEffortRatio(testResults: any): ValidationResult {
    const validation: ValidationResult = {
      isValid: true,
      details: [],
      errors: []
    };

    try {
      const allRoadmaps = [
        testResults.worst?.roadmap,
        testResults.middle?.roadmap,
        testResults.best?.roadmap
      ].filter(Boolean);

      const ratios: number[] = [];

      allRoadmaps.forEach((roadmap: any) => {
        const totalEffort = this.calculateTotalEffort(roadmap);
        const totalTimeline = this.extractTotalDuration(roadmap);
        
        if (totalTimeline > 0) {
          ratios.push(totalEffort / totalTimeline);
        }
      });

      // Check if ratios are reasonable (not too extreme)
      const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
      if (avgRatio > 10 || avgRatio < 0.5) {
        validation.isValid = false;
        validation.errors.push(`Effort-to-timeline ratio seems unreasonable: ${avgRatio}`);
      }

      validation.details.push(`Average effort-to-timeline ratio: ${avgRatio.toFixed(2)}`);

    } catch (error) {
      validation.isValid = false;
      validation.errors.push(`Error validating timeline-effort ratio: ${error}`);
    }

    return validation;
  }

  // Helper methods
  private isValidPhaseOrder(phases: string[]): boolean {
    const validOrders = [
      ['foundation'],
      ['foundation', 'integration'],
      ['foundation', 'integration', 'optimization']
    ];
    
    return validOrders.some(validOrder => 
      validOrder.every((phase, index) => phases[index] === phase)
    );
  }

  private extractTotalDuration(roadmap: any): number {
    if (!roadmap.phases) return 0;
    
    return roadmap.phases.reduce((total: number, phase: any) => {
      const duration = parseFloat(phase.duration) || 0;
      return total + duration;
    }, 0);
  }

  private calculateTotalEffort(roadmap: any): number {
    if (!roadmap.phases) return 0;
    
    const effortMap = { 'small': 1, 'medium': 3, 'large': 5 };
    
    return roadmap.phases.reduce((total: number, phase: any) => {
      if (!phase.actions) return total;
      
      return total + phase.actions.reduce((phaseTotal: number, action: any) => {
        const effort = effortMap[action.effort as keyof typeof effortMap] || 3;
        return phaseTotal + effort;
      }, 0);
    }, 0);
  }

  private areContradictory(title1: string, title2: string): boolean {
    // Simple contradiction detection - can be expanded
    const contradictions = [
      ['add', 'remove'],
      ['enable', 'disable'],
      ['implement', 'deprecate']
    ];

    return contradictions.some(([word1, word2]) => 
      (title1.toLowerCase().includes(word1) && title2.toLowerCase().includes(word2)) ||
      (title1.toLowerCase().includes(word2) && title2.toLowerCase().includes(word1))
    );
  }

  private detectCycles(graph: Map<string, string[]>): string[] {
    const cycles: string[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (node: string, path: string[]): void => {
      if (recursionStack.has(node)) {
        const cycleStart = path.indexOf(node);
        cycles.push(path.slice(cycleStart).join(' -> '));
        return;
      }

      if (visited.has(node)) return;

      visited.add(node);
      recursionStack.add(node);

      const dependencies = graph.get(node) || [];
      dependencies.forEach(dep => {
        dfs(dep, [...path, node]);
      });

      recursionStack.delete(node);
    };

    graph.forEach((_, node) => {
      if (!visited.has(node)) {
        dfs(node, []);
      }
    });

    return cycles;
  }
}

interface ValidationResult {
  isValid: boolean;
  details: string[];
  errors: string[];
}
