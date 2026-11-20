import { defineConfig } from '@playwright/test';
const remote = process.env.BROWSER_QA_URL;
const managedLocal = process.env.BROWSER_QA_MANAGED_LOCAL === '1';
if (remote && managedLocal) throw new Error('Choose isolated remote or managed local QA, not both');
if (remote && new URL(remote).port !== '8081') throw new Error('Remote browser QA must use isolated port 8081');

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  timeout: 90000,
  expect: { timeout: 20000 },
  use: { baseURL: remote || 'http://127.0.0.1:5173', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: remote || managedLocal ? undefined : [
    {
      command: 'uv run python -m scripts.browser_fixture && uv run uvicorn app.main:app --host 127.0.0.1 --port 8000',
      cwd: '../backend',
      env: { DATABASE_URL: 'sqlite:///./data/browser-e2e.db', SESSION_SECRET: 'isolated-browser-tests-only' },
      url: 'http://127.0.0.1:8000/health',
      reuseExistingServer: false,
    },
    { command: 'npm run dev -- --host 127.0.0.1', url: 'http://127.0.0.1:5173', reuseExistingServer: false },
  ],
});