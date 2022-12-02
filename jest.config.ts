import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  moduleDirectories: ['node_modules', 'test'],
  verbose: true,
  setupFiles: ['<rootDir>/tests/setup.ts'],
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect']
};

export default config;
