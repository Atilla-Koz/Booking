import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.e2e-spec.ts',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    headless: true,
  },
  webServer: {
    command: 'npm run build && npm run start -- -p 3000',
    port: 3000,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
