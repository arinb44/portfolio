import { defineConfig, devices } from '@playwright/test';

// Tests run against the built site (`npm run build` first), served by `astro preview` on its own port,
// never reusing a running server (a dev server on 4321 would otherwise be tested instead of dist/).
const PORT = 4329;

export default defineConfig({
  testDir: 'tests/e2e',
  webServer: {
    command: `npm run preview -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
    // The home scene draws ~690k particles: use the real GPU (new headless mode + ANGLE on D3D11), not software GL.
    channel: 'chromium',
    launchOptions: { args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
