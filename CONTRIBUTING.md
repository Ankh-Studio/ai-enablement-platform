# Contributing to AI Enablement Platform

Thank you for your interest in contributing to the AI Enablement Platform! This guide will help you get started with contributing to the project.

## 🚀 Getting Started

### Prerequisites

- Node.js 16.0.0 or higher
- npm or yarn package manager
- Git
- Basic knowledge of TypeScript

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork the repository on GitHub
   git clone https://github.com/YOUR_USERNAME/ai-enablement.git
   cd ai-enablement
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run tests**
   ```bash
   npm test
   ```

4. **Start development**
   ```bash
   npm run dev
   ```

## 📋 Development Process

### 1. Create an Issue

Before starting work, create an issue to discuss your proposed changes:

- **Bug Reports**: Use the [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) template
- **Feature Requests**: Use the [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) template
- **Enhancements**: Describe the improvement and its benefits

### 2. Create a Branch

Create a feature branch from the main branch:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. Make Changes

Follow our coding standards and guidelines:

- Use TypeScript for all new code
- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed

### 4. Test Your Changes

Ensure your changes work correctly:

```bash
# Run all tests
npm test

# Run linting
npm run lint

# Run type checking
npm run type-check
```

### 5. Submit a Pull Request

Create a pull request with:

- Clear description of changes
- Reference to related issues
- Test results
- Documentation updates

## 🏗️ Project Structure

```
ai-enablement/
├── src/                    # Source code
│   ├── sdk/               # Deterministic analysis SDK
│   ├── personas/          # Expert persona system
│   ├── cli/               # Command-line interface
│   ├── mcp/               # MCP integration
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── tests/                 # Test files
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── e2e/               # End-to-end tests
├── docs/                  # Documentation
│   ├── adr/               # Architecture Decision Records
│   ├── design/            # Design documents
│   ├── api/               # API documentation
│   ├── user-guide/        # User documentation
│   └── development/       # Development documentation
└── examples/              # Usage examples
```

## 📝 Coding Standards

### TypeScript Guidelines

- Use strict TypeScript configuration
- Provide type annotations for all public APIs
- Use interfaces for object shapes
- Prefer explicit return types

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in multi-line structures
- Keep lines under 100 characters

### Naming Conventions

- **Files**: kebab-case (`my-component.ts`)
- **Classes**: PascalCase (`MyClass`)
- **Functions**: camelCase (`myFunction`)
- **Constants**: UPPER_SNAKE_CASE (`MY_CONSTANT`)
- **Interfaces**: PascalCase with 'I' prefix (`IMyInterface`)

## 🧪 Testing Guidelines

### Test Structure

```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should do something', async () => {
      // Arrange
      const input = createTestData();
      
      // Act
      const result = await component.methodName(input);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.someProperty).toBe(expectedValue);
    });
  });
});
```

### Test Types

- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test component interactions
- **End-to-End Tests**: Test complete workflows

### Coverage Requirements

- Maintain >90% test coverage
- All public methods must be tested
- Edge cases should be covered
- Error handling should be tested

## 📚 Documentation

### Updating Documentation

- Update README.md for user-facing changes
- Update API documentation for new interfaces
- Add ADRs for architectural changes
- Update design documents for component changes

### Documentation Style

- Use clear, concise language
- Include code examples
- Add diagrams where helpful
- Keep documentation up-to-date

## 🔄 Release Process

### Version Management

We follow semantic versioning (SemVer):

- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes (backward compatible)

### Release Steps

1. Update version in package.json
2. Update CHANGELOG.md
3. Create release tag
4. Publish to npm
5. Update documentation

## 🤝 Contribution Types

### Code Contributions

- **Bug fixes**: Resolve reported issues
- **Features**: Add new functionality
- **Enhancements**: Improve existing features
- **Performance**: Optimize code performance

### Documentation Contributions

- **User guides**: Improve user documentation
- **API docs**: Enhance API documentation
- **Examples**: Add usage examples
- **Tutorials**: Create learning materials

### Community Contributions

- **Issue triage**: Help manage issues
- **Code review**: Review pull requests
- **Testing**: Improve test coverage
- **Translation**: Add internationalization

## 🎯 Areas of Focus

### High Priority

- [ ] Core analysis engine improvements
- [ ] Expert persona enhancements
- [ ] CLI interface polish
- [ ] Performance optimizations

### Medium Priority

- [ ] Additional integrations
- [ ] Documentation improvements
- [ ] Test coverage expansion
- [ ] Code quality enhancements

### Low Priority

- [ ] UI/UX improvements
- [ ] Internationalization
- [ ] Advanced features
- [ ] Experimental functionality

## 📞 Getting Help

### Resources

- [Documentation](docs/)
- [API Reference](docs/api/)
- [Architecture Decisions](docs/adr/)
- [Design Documents](docs/design/)

### Community

- [GitHub Discussions](https://github.com/Ankh-Studio/ai-enablement/discussions)
- [GitHub Issues](https://github.com/Ankh-Studio/ai-enablement/issues)
- [Discord Community](https://discord.gg/ankh-studio)

### Maintainers

- Review pull requests within 48 hours
- Respond to issues within 72 hours
- Provide guidance for contributors
- Ensure code quality standards

## 🏆 Recognition

Contributors are recognized in:

- README.md contributors section
- Release notes
- GitHub contributors list
- Community highlights

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to the AI Enablement Platform! 🎉
