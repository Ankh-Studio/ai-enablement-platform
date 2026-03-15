/**
 * Recommendation Engine V2 Types
 *
 * Core type definitions for evidence-based recommendation pipeline
 * following 8-layer agentic architecture principles
 */

// Evidence anchors for specific repo facts
export interface EvidenceAnchor {
  type: 'file' | 'pattern' | 'metric' | 'config' | 'missing';
  path?: string; // Specific file path
  pattern?: string; // Matched pattern or regex
  metric?: {
    name: string;
    value: number | string;
    threshold?: number;
  };
  config?: {
    file: string;
    setting: string;
    expected?: string;
    actual?: string;
  };
  description: string; // Human-readable description
  confidence: number; // 0-100 confidence in this evidence
}

// Structured finding - grounded fact, not advice
export interface Finding {
  id: string;
  category: 'foundation' | 'security' | 'workflow' | 'ai' | 'governance';
  severity: 'critical' | 'high' | 'medium' | 'low';
  summary: string;
  evidenceAnchors: EvidenceAnchor[];
  affectedFiles: string[];
  relatedScores: {
    category: string;
    score: number;
    impact: 'positive' | 'negative' | 'neutral';
  }[];
  metadata: {
    detectionMethod: string;
    reproducible: boolean;
    timestamp: string;
  };
}

// Hypothesis - inferred issue/opportunity needing validation
export interface Hypothesis {
  id: string;
  title: string;
  description: string;
  category: 'foundation' | 'security' | 'workflow' | 'ai' | 'governance';
  supportingFindings: string[]; // Finding IDs
  reasoning: string;
  confidence: number; // 0-100
  alternativeInterpretations: string[];
  validationChecks: ValidationCheck[];
  estimatedImpact: 'critical' | 'high' | 'medium' | 'low';
  estimatedEffort: 'small' | 'medium' | 'large';
}

// Validation check for hypotheses
export interface ValidationCheck {
  id: string;
  type:
    | 'evidence_strength'
    | 'repo_specificity'
    | 'actionability'
    | 'redundancy'
    | 'contradiction';
  description: string;
  expected: string;
  actual?: string;
  passed?: boolean;
  reason?: string;
}

// Validation result
export interface ValidationResult {
  hypothesisId: string;
  passed: boolean;
  confidence: number; // 0-100 after validation
  validationChecks: ValidationCheck[];
  blockers: string[];
  warnings: string[];
  recommendation: 'promote' | 'downgrade' | 'reject' | 'human_review';
}

// Challenger assessment
export interface ChallengerAssessment {
  recommendationId: string;
  criticisms: string[];
  strengths: string[];
  alternativeActions: string[];
  downgradeReasons: string[];
  finalVerdict: 'approve' | 'downgrade' | 'reject' | 'require_human_review';
  confidenceAdjustment: number; // -100 to +100
}

// Final recommendation shape
export interface RecommendationV2 {
  id: string;
  title: string;
  category: 'foundation' | 'security' | 'workflow' | 'ai' | 'governance';
  priority: 'critical' | 'high' | 'medium' | 'low';
  summary: string;
  whyThisMatters: string;
  evidenceAnchors: EvidenceAnchor[];
  affectedFiles: string[];
  supportingFindings: string[]; // Finding IDs
  supportingHypotheses: string[]; // Hypothesis IDs
  validationSummary: {
    passed: boolean;
    confidence: number;
    blockers: string[];
    warnings: string[];
  };
  expectedImpact: {
    description: string;
    areas: string[];
    metrics: string[];
  };
  estimatedEffort: {
    size: 'small' | 'medium' | 'large';
    timeframes: {
      best: string;
      expected: string;
      worst: string;
    };
    resources: string[];
  };
  confidence: {
    overall: number; // 0-100
    evidenceQuality: number;
    repoSpecificity: number;
    actionability: number;
  };
  caveats: string[];
  suggestedNextStep: string;
  humanReviewNeeded: boolean;
  implementationHints?: {
    commands?: string[];
    fileTemplates?: string[];
    references?: string[];
  };
  tags: string[];
  metadata: {
    generated: string;
    version: string;
    pipeline: string[];
  };
}

// Feedback collection
export interface RecommendationFeedback {
  recommendationId: string;
  timestamp: string;
  reviewer: string;
  scores: {
    grounded: number; // 0-2 - evidence quality
    correct: number; // 0-2 - accuracy
    specific: number; // 0-2 - repo specificity
    actionable: number; // 0-2 - actionability
    valuable: number; // 0-2 - overall value
  };
  notes?: string;
  implemented: boolean;
  implementationNotes?: string;
}

// Pipeline context
export interface RecommendationContext {
  repoPath: string;
  evidence: any; // EvidenceData from evidence collector
  scores: any; // ReadinessScores from scorer
  copilotFeatures: any; // CopilotFeatureAnalysis from scanner
  techStack: any; // TechStackAnalysis from analyzer
  config: {
    enableChallenger: boolean;
    confidenceThreshold: number;
    humanReviewThreshold: number;
  };
}

// Pipeline stage result
export interface PipelineStageResult<T> {
  stage: string;
  success: boolean;
  data: T[];
  errors: string[];
  warnings: string[];
  metadata: {
    duration: number;
    inputCount: number;
    outputCount: number;
  };
}

// Final engine result
export interface RecommendationEngineResult {
  findings: Finding[];
  hypotheses: Hypothesis[];
  validationResults: ValidationResult[];
  challengerAssessments: ChallengerAssessment[];
  recommendations: RecommendationV2[];
  pipeline: {
    findings: PipelineStageResult<Finding>;
    hypotheses: PipelineStageResult<Hypothesis>;
    validation: PipelineStageResult<ValidationResult>;
    challenger: PipelineStageResult<ChallengerAssessment>;
    ranking: PipelineStageResult<RecommendationV2>;
  };
  metadata: {
    totalDuration: number;
    evidenceCount: number;
    confidenceDistribution: {
      high: number;
      medium: number;
      low: number;
    };
    categoryDistribution: Record<string, number>;
  };
}
