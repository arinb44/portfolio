import { defineConfig, devices } from '@playwright/test';

// Tests run against the built site (`npm run build` first), served by `astro preview`.
export default defineConfig({
  testDir: 'tests/e2e',
  webServer: {
    command: 'npm run preview -- --port 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: true,
  },
  use: { baseURL: 'http://localhost:4321' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
