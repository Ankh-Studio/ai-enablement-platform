# Modular Exports

This library supports modular imports to reduce bundle size and improve tree-shaking.

## Import Patterns

### Full Library Import
```typescript
import { AssessmentEngine, TechStackAnalyzer, BasePersona } from '@ankh-studio/ai-enablement';
```

### Modular Imports
```typescript
// Core functionality only
import { AssessmentEngine } from '@ankh-studio/ai-enablement/core';

// Analyzers only
import { TechStackAnalyzer } from '@ankh-studio/ai-enablement/analyzers';

// Personas only
import { BasePersona, ConsultantPersona } from '@ankh-studio/ai-enablement/personas';

// Types only
import { PersonaConfig, PersonaType } from '@ankh-studio/ai-enablement/types';
```

## Available Modules

- **`@ankh-studio/ai-enablement/core`** - AssessmentEngine and core functionality
- **`@ankh-studio/ai-enablement/analyzers`** - TechStackAnalyzer and analysis tools
- **`@ankh-studio/ai-enablement/collectors`** - EvidenceCollector and data collection
- **`@ankh-studio/ai-enablement/scorers`** - ReadinessScorer and scoring algorithms
- **`@ankh-studio/ai-enablement/scanners`** - CopilotFeatureScanner and feature detection
- **`@ankh-studio/ai-enablement/generators`** - ADRGenerator and document generation
- **`@ankh-studio/ai-enablement/personas`** - Expert persona classes and factory
- **`@ankh-studio/ai-enablement/types`** - TypeScript interfaces and types

## Benefits

1. **Reduced Bundle Size**: Only import what you need
2. **Faster Load Times**: Less code to parse and execute
3. **Better Tree-shaking**: Unused code can be eliminated
4. **Clear Dependencies**: Explicit module dependencies
