# ADR-0003: Expert Persona System

## Status
Proposed

## Context
The AI Enablement Platform needs to provide insights from different expert perspectives to give comprehensive AI enablement recommendations. Different stakeholders require different types of analysis and recommendations:

- **Consultants**: Need strategic insights and business value
- **Evangelists**: Need technical details and innovation opportunities
- **Team Leads**: Need practical implementation guidance and team considerations

A one-size-fits-all approach would not provide the depth and specificity needed for different audiences.

## Decision
We will implement an Expert Persona System with three primary personas, each providing unique insights and recommendations:

### Core Personas

1. **Consultant Persona**
   - Focus: Strategic business value and ROI
   - Output: Executive summaries, business cases, strategic recommendations
   - Tone: Professional, business-focused, metrics-driven
   - Key concerns: Cost-benefit analysis, risk assessment, business impact

2. **Evangelist Persona**
   - Focus: Technical innovation and best practices
   - Output: Technical deep dives, architecture recommendations, innovation opportunities
   - Tone: Enthusiastic, technical-forward, visionary
   - Key concerns: Technical excellence, innovation, industry trends

3. **Team Lead Persona**
   - Focus: Practical implementation and team dynamics
   - Output: Implementation guides, team training plans, practical steps
   - Tone: Pragmatic, team-focused, actionable
   - Key concerns: Team readiness, implementation complexity, training needs

### Implementation Architecture

```typescript
interface ExpertPersona {
  name: string;
  focus: PersonaFocus;
  generateInsights(analysis: AnalysisResult): PersonaInsights;
  formatRecommendations(recommendations: Recommendation[]): string;
}

class PersonaSystem {
  private personas: Map<string, ExpertPersona> = new Map();
  
  async getPersonaInsights(
    analysis: AnalysisResult, 
    personaTypes: PersonaType[]
  ): Promise<PersonaInsights[]> {
    const insights = await Promise.all(
      personaTypes.map(type => 
        this.personas.get(type)?.generateInsights(analysis)
      )
    );
    return insights.filter(Boolean);
  }
}
```

### LLM Coalescing Strategy

- Use Copilot SDK for intelligent insight generation
- Persona-specific prompts and context
- Consistent formatting across personas
- Evidence-based recommendations

## Consequences

### Positive
- Comprehensive insights from multiple perspectives
- Tailored recommendations for different stakeholders
- Better adoption through targeted messaging
- Richer analysis outcomes
- Flexible for future persona additions

### Negative
- Increased complexity in analysis pipeline
- More processing time for multiple persona insights
- Potential for conflicting recommendations
- Requires careful persona definition and maintenance

## Implementation

1. Define persona interfaces and base classes
2. Implement core persona logic
3. Create persona-specific prompt templates
4. Integrate with Copilot SDK for LLM coalescing
5. Build insight aggregation system
6. Add persona selection and configuration

## Test Requirements

- Unit tests for each persona
- Integration tests for persona system
- Validation of persona-specific outputs
- Consistency tests across personas
- Performance tests for multi-persona analysis

## Alternatives Considered

1. **Single Generic Persona**: Rejected due to lack of specificity
2. **User-Defined Personas**: Rejected due to complexity and maintenance overhead
3. **Dynamic Persona Generation**: Rejected due to consistency concerns

## References

- [ADR-0001: Platform Architecture Decisions](0001-platform-architecture.md)
- [ADR-0002: Deterministic Analysis Strategy](0002-deterministic-analysis.md)

## Discussion

GitHub Issue: #[link-to-issue]
