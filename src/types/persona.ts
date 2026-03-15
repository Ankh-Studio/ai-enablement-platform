/**
 * Expert Persona System Types
 *
 * Defines the architecture for AI expert personas that provide
 * specialized insights and recommendations for AI enablement
 */

// Import AssessmentResult and Recommendation from assessment-engine to avoid duplication
import type {
  AssessmentResult,
  Recommendation,
} from '../core/assessment-engine';
import type { StructuredAdversarialResponse } from '../llm/structured-types';

// Re-export for use by other modules
export type { AssessmentResult, Recommendation, StructuredAdversarialResponse };

// Forward declaration for StructuredAdversarialResponse to avoid circular imports
// export interface StructuredAdversarialResponse {
//   summary: string;
//   recommendations: string[];
//   confidence: number;
//   evidence: string[];
// }

export interface PersonaContext {
  repository: string;
  assessmentResults: AssessmentResult;
  scores: {
    repoReadiness: number;
    teamReadiness: number;
    orgReadiness: number;
    overallMaturity: number;
  };
  recommendations: Recommendation[];
  targetAudience: 'individual' | 'team' | 'organization';
}

export interface PersonaInsight {
  id: string;
  type: 'analysis' | 'recommendation' | 'warning' | 'opportunity';
  title: string;
  description: string;
  evidence: string[];
  confidence: number; // 0-100
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'strategy' | 'technical' | 'process' | 'cultural' | 'risk';
}

export interface PersonaResponse {
  persona: PersonaType;
  insights: PersonaInsight[];
  summary: string;
  nextSteps: string[];
  timeframe: string;
  perspective: string;
  confidence: 'high' | 'medium' | 'low';
  structuredInsights?: StructuredAdversarialResponse;
}

export type PersonaType =
  | 'consultant'
  | 'evangelist'
  | 'teamlead'
  | 'dana-shah'
  | 'leo-alvarez'
  | 'priya-nair'
  | 'tasha-reed'
  | 'ben-okafor';

// Diffusion of innovations positions
export type DiffusionPosition =
  | 'innovator'
  | 'early-adopter'
  | 'early-majority'
  | 'late-majority'
  | 'laggard';

// Builder mindset categories from DORA research
export type BuilderMindset =
  | 'learner'
  | 'accelerator'
  | 'optimizer'
  | 'miscalibrated-accelerator';

// Trust posture patterns
export type TrustPosture =
  | 'low-verified'
  | 'moderate-delegated'
  | 'high-poorly-calibrated';

// Research-backed psychological dimensions
export interface PsychologicalProfile {
  motivations: string[];
  fears: string[];
  biases: string[];
}

// Enhanced empathy map from research
export interface EmpathyMap {
  thinks: string;
  feels: string;
  says: string;
  does: string;
  pains: string[];
  gains: string[];
}

// Evidence interpretation patterns
export interface InsightGenerationLogic {
  trigger_conditions: string[];
  perspective_shifters: string[];
  evidence_pattern: string;
  priority_order: string[];
}

// Runtime weights for persona behavior (0-1 calibrated values)
export type RuntimeWeights = Record<string, number>;

// Research-backed adversarial persona interface
export interface AdversarialPersona extends PersonaConfig {
  // Research dimensions
  experience_band: number;
  diffusion_position: DiffusionPosition;
  builder_mindset: BuilderMindset;
  trust_posture: TrustPosture;

  // Psychological depth
  psychological_profile: PsychologicalProfile;

  // Runtime behavior
  runtime_weights: RuntimeWeights;

  // Evidence interpretation
  insight_generation_logic: InsightGenerationLogic;

  // Human-centered design
  empathy_map: EmpathyMap;

  // Communication style
  communication_style: string;
  recommendation_style: string;
}

export interface PersonaConfig {
  type: PersonaType;
  name: string;
  description: string;
  expertise: string[];
  focus: string[];
  tone: 'formal' | 'friendly' | 'technical' | 'inspirational';
  targetAudience: string[];
}

export interface LLMRequest {
  prompt: string;
  context: PersonaContext;
  persona: PersonaConfig;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMResponse {
  content: string;
  insights: PersonaInsight[];
  confidence: number;
  tokensUsed: number;
}

export interface PersonaMetrics {
  insightsGenerated: number;
  averageConfidence: number;
  responseTime: number;
  userSatisfaction?: number;
}
