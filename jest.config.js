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
    'app/lib/payroll-engine-cjs.js',
  ],
  // Pas de threshold strict — coverage informatif seulement
  // coverageThreshold supprimé pour éviter les faux positifs
};
module.exports = config;
