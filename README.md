# AI Enablement Platform

A comprehensive AI enablement platform that combines deterministic repository analysis with expert consulting personas to provide professional AI adoption guidance.

## 🚀 Quick Start

```bash
npm install -g @ankh-studio/ai-enablement-platform
ai-enablement analyze ./my-project --persona consultant
```

## 📋 Features

- 🔍 **Deterministic Analysis**: Tech stack, maturity, AI usage, team metrics
- 👥 **Expert Personas**: Consultant, Evangelist, Team Lead perspectives
- 📝 **Professional ADRs**: Consultant-quality architecture decisions
- 🔧 **MCP Integration**: Tool ecosystem compatibility
- 🎯 **Evidence-Based**: All recommendations backed by structured data

## 📚 Documentation

- [User Guide](docs/user-guide/) - How to use the platform
- [API Reference](docs/api/) - API documentation
- [Development Guide](docs/development/) - Contributing and development
- [Architecture Decisions](docs/adr/) - Design decisions and rationale

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Expert Persona │    │   MCP Integration │    │  Deterministic  │
│   Plugins        │◄──►│   Layer           │◄──►│  SDK            │
│ (AI Consultant)  │    │ (Context Bridge)  │    │ (Data Collection)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📦 Installation

### CLI Installation
```bash
npm install -g @ankh-studio/ai-enablement-platform
```

### Programmatic Installation
```bash
npm install @ankh-studio/ai-enablement-platform
```

## 🎯 Usage

### Basic Analysis
```bash
ai-enablement analyze ./my-project
```

### Expert Consultation
```bash
ai-enablement consult ./my-project --persona consultant
```

### ADR Generation
```bash
ai-enablement adr ./my-project --persona consultant --output ./adr.md
```

### MCP Server
```bash
ai-enablement mcp ./my-project --server
```

### Programmatic Usage
```typescript
import { AIEnablementPlatform } from '@ankh-studio/ai-enablement-platform';

const platform = new AIEnablementPlatform();
const analysis = await platform.analyze('./my-project');
const adr = await platform.generateADR('./my-project', 'consultant');
```

## 🤝 Contributing

See [Contributing Guide](CONTRIBUTING.md) for details on how to contribute to the project.

## 📄 License

[License details]

## 🔗 Links

- [Documentation](docs/)
- [GitHub Repository](https://github.com/Ankh-Studio/ai-enablement-platform)
- [Issues](https://github.com/Ankh-Studio/ai-enablement-platform/issues)
- [Discussions](https://github.com/Ankh-Studio/ai-enablement-platform/discussions)
