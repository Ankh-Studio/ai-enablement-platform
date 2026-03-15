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

// Re-export for use by other modules
export type { AssessmentResult, Recommendation };

// Forward declaration for StructuredAdversarialResponse to avoid circular imports
export interface StructuredAdversarialResponse {
  summary: string;
  recommendations: string[];
  confidence: number;
  evidence: string[];
}

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

export type PersonaType = 'consultant' | 'evangelist' | 'teamlead';

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
