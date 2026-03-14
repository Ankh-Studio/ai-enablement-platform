# API Documentation

This directory contains comprehensive API documentation for the AI Enablement Platform.

## API Overview

The AI Enablement Platform provides multiple interfaces for repository analysis and AI enablement insights:

- **CLI Interface**: Command-line tool for direct analysis
- **MCP Server**: Model Context Protocol integration
- **REST API**: HTTP API for web integration
- **SDK**: Programmatic access library

## API Documentation Index

| API | Version | Status | Description |
|-----|---------|--------|-------------|
| [CLI API](cli/) | v1 | Stable | Command-line interface commands |
| [MCP API](mcp/) | v1 | Stable | Model Context Protocol tools |
| [REST API](rest/) | v1 | Development | HTTP REST endpoints |
| [SDK API](sdk/) | v1 | Development | Programmatic access |

## Getting Started

### CLI Interface
```bash
# Analyze a repository
ai-enablement analyze /path/to/repo

# Get maturity score
ai-enablement score /path/to/repo

# Generate recommendations
ai-enablement recommend /path/to/repo --persona consultant
```

### MCP Integration
```json
{
  "tools": [
    {
      "name": "analyze-repository",
      "description": "Analyze repository for AI enablement"
    }
  ]
}
```

### REST API
```bash
# Analyze repository
curl -X POST /api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"repository": "/path/to/repo"}'
```

## API Design Principles

### Consistency
- Standardized response formats
- Consistent error handling
- Uniform authentication patterns
- Predictable naming conventions

### Security
- Input validation and sanitization
- Rate limiting and throttling
- Authentication and authorization
- Audit logging

### Performance
- Efficient data structures
- Streaming for large responses
- Caching strategies
- Compression support

### Extensibility
- Versioned APIs
- Backward compatibility
- Plugin architecture
- Feature flags

## Authentication

### API Keys
```bash
# Set API key
export AI_ENABLEMENT_API_KEY="your-api-key"

# Use in request
curl -H "Authorization: Bearer $AI_ENABLEMENT_API_KEY" \
  https://api.ai-enablement.com/v1/analyze
```

### Environment Variables
```bash
# Configuration
AI_ENABLEMENT_API_ENDPOINT="https://api.ai-enablement.com"
AI_ENABLEMENT_API_VERSION="v1"
AI_ENABLEMENT_TIMEOUT="30000"
```

## Error Handling

### Standard Error Format
```json
{
  "error": {
    "code": "INVALID_REPOSITORY",
    "message": "Repository path is invalid",
    "details": {
      "path": "/invalid/path",
      "reason": "Directory does not exist"
    },
    "timestamp": "2025-03-14T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

### Error Codes
- `INVALID_REPOSITORY`: Repository path is invalid
- `ANALYSIS_FAILED`: Analysis process failed
- `TIMEOUT`: Analysis timeout exceeded
- `UNAUTHORIZED`: Invalid authentication
- `RATE_LIMITED`: Too many requests

## Rate Limiting

### Limits
- **Free Tier**: 100 requests/hour
- **Pro Tier**: 1000 requests/hour
- **Enterprise**: Unlimited

### Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642694400
```

## SDK Usage

### Installation
```bash
npm install @ai-enablement/sdk
```

### Basic Usage
```typescript
import { AIEnablementClient } from '@ai-enablement/sdk';

const client = new AIEnablementClient({
  apiKey: process.env.AI_ENABLEMENT_API_KEY,
  endpoint: 'https://api.ai-enablement.com'
});

const analysis = await client.analyze('/path/to/repo');
```

## Testing

### Mock API
```typescript
import { MockAIEnablementClient } from '@ai-enablement/sdk/testing';

const mockClient = new MockAIEnablementClient();
const analysis = await mockClient.analyze('/path/to/repo');
```

### Integration Tests
```bash
# Run API tests
npm run test:api

# Run integration tests
npm run test:integration
```

## Monitoring and Observability

### Metrics
- Request latency
- Error rates
- Usage patterns
- Performance benchmarks

### Logging
```typescript
// Enable debug logging
process.env.DEBUG = 'ai-enablement:*';

// Log levels
client.logger.setLevel('debug');
```

## Support

### Documentation
- [CLI Guide](cli/README.md)
- [MCP Guide](mcp/README.md)
- [REST API Reference](rest/openapi.yaml)
- [SDK Documentation](sdk/README.md)

### Community
- GitHub Discussions
- Stack Overflow tag `ai-enablement`
- Discord Community
- Support Email

### Troubleshooting
- [Common Issues](troubleshooting.md)
- [FAQ](faq.md)
- [Status Page](https://status.ai-enablement.com)
