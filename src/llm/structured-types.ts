/**
 * Structured Coalescing Types
 *
 * JSON schema definitions for structured LLM coalescing with evidence grounding
 */

export interface StructuredAdversarialResponse {
  insights: AdversarialInsight[];
  confidence: number;
  evidenceValidation: EvidenceValidation;
  processingTime: number;
  metadata: ResponseMetadata;
}

export interface AdversarialInsight {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  evidenceIds: string[];
  adversarialChallenge: string;
  strategicImplication: string;
  category: 'strategy' | 'risk' | 'opportunity' | 'implementation';
  timeframe: string;
  effort: 'small' | 'medium' | 'large';
}

export interface EvidenceValidation {
  totalInsights: number;
  groundedInsights: number;
  missingEvidence: string[];
  invalidEvidence: string[];
  groundingScore: number;
}

export interface ResponseMetadata {
  model: string;
  tokensUsed: number;
  temperature: number;
  reasoningEffort: string;
  sessionId: string;
  timestamp: number;
}

export interface StructuredCoalescingConfig {
  enableStrictValidation: boolean;
  requireEvidenceGrounding: boolean;
  minGroundingScore: number;
  maxInsights: number;
  confidenceThreshold: number;
  evidenceCategories: string[];
}

export interface CoalescingValidationResult {
  isValid: boolean;
  confidence: number;
  issues: ValidationIssue[];
  suggestions: string[];
  processingTime: number;
}

export interface ValidationIssue {
  type: 'evidence_missing' | 'evidence_invalid' | 'malformed_json' | 'confidence_low' | 'structure_invalid';
  severity: 'error' | 'warning' | 'info';
  message: string;
  insightId?: string;
  evidenceId?: string;
}

export interface EvidenceReference {
  id: string;
  content: string;
  category: string;
  confidence: number;
  relevanceScore: number;
}

// JSON Schema for validation
export const STRUCTURED_RESPONSE_SCHEMA = {
  type: 'object',
  required: ['insights', 'confidence', 'evidenceValidation', 'processingTime', 'metadata'],
  properties: {
    insights: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'title', 'description', 'priority', 'confidence', 'evidenceIds', 'adversarialChallenge', 'strategicImplication', 'category', 'timeframe', 'effort'],
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          priority: { enum: ['critical', 'high', 'medium', 'low'] },
          confidence: { type: 'number', minimum: 0, maximum: 1 },
          evidenceIds: { type: 'array', items: { type: 'string' } },
          adversarialChallenge: { type: 'string' },
          strategicImplication: { type: 'string' },
          category: { enum: ['strategy', 'risk', 'opportunity', 'implementation'] },
          timeframe: { type: 'string' },
          effort: { enum: ['small', 'medium', 'large'] }
        }
      }
    },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    evidenceValidation: {
      type: 'object',
      required: ['totalInsights', 'groundedInsights', 'missingEvidence', 'invalidEvidence', 'groundingScore'],
      properties: {
        totalInsights: { type: 'number' },
        groundedInsights: { type: 'number' },
        missingEvidence: { type: 'array', items: { type: 'string' } },
        invalidEvidence: { type: 'array', items: { type: 'string' } },
        groundingScore: { type: 'number', minimum: 0, maximum: 1 }
      }
    },
    processingTime: { type: 'number' },
    metadata: {
      type: 'object',
      required: ['model', 'tokensUsed', 'temperature', 'reasoningEffort', 'sessionId', 'timestamp'],
      properties: {
        model: { type: 'string' },
        tokensUsed: { type: 'number' },
        temperature: { type: 'number' },
        reasoningEffort: { type: 'string' },
        sessionId: { type: 'string' },
        timestamp: { type: 'number' }
      }
    }
  }
};
