module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testTimeout: 10000,
  setupFilesAfterEnv: [],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/.windsurf/',
    '/coverage/',
    '/.nyc_output/',
    '/tmp/',
    '/temp/',
    '/test-results/',
    '/docs/_build/',
    '/analysis-results/',
    '/reports/',
    '/.mcp-data/',
    '/mcp-logs/',
    '/personas/custom/',
    '/analysis-cache/',
    '/tool-output/',
    '/.local/',
    '/dev-data/',
    '/test-repos/',
    '/sample-repos/',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
