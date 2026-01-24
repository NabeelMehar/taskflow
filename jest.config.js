const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/app/layout.tsx',
    '!src/middleware.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 15,
      functions: 18,
      lines: 19,
      statements: 19,
    },
  },
  // Exclude complex UI components and Supabase from coverage requirements
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'src/lib/supabase/',
    'src/components/ui/dialog.tsx',
    'src/components/ui/select.tsx',
    'src/components/ui/toast.tsx',
    'src/components/ui/toaster.tsx',
    'src/components/ui/use-toast.ts',
    'src/components/ui/popover.tsx',
    'src/components/ui/alert-dialog.tsx',
    'src/components/ui/table.tsx',
    'src/components/ui/switch.tsx',
    'src/components/ui/checkbox.tsx',
    'src/app/auth/callback',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
