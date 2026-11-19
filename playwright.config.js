import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  timeout: 45000,
  use: { baseURL: 'http://127.0.0.1:5173', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: [
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