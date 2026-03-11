/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],
  testMatch: ['**/__tests__/**/*.test.js'],
  testTimeout: 30000,
  forceExit: true,
  collectCoverageFrom: [
    'app/lib/payroll-engine.js',
    'app/lib/calc-paie.js',
    'app/lib/calc-pp.js',
  ],
  coverageThreshold: {
    global: { lines: 70, functions: 70 }
  }
};
module.exports = config;
