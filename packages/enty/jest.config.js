module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    testMatch: ['<rootDir>/src/**/__tests__/*-test.{ts,tsx}'],
    collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx}'],
    coverageThreshold: {
        global: {
            branches: 100,
            functions: 100,
            lines: 100
        }
    }
};

