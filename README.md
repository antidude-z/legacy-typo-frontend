# Typography frontend

Svelte 5 frontend for the legacy typography application.

## Local development

```text
npm install
npm run dev
```

## Tests

```text
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser tests require `uv` and the backend dependencies. They start dedicated
local servers on ports 8000/5173 and recreate only
`../backend/data/browser-e2e.db`; an occupied port causes failure rather than
reusing an unknown service. Never use this fixture as a business database.
Failure screenshots and traces are saved in ignored `test-results/`.

Current browser coverage: real login, all order types, edit/copy, tabs,
reference creation, and section navigation. Full workflow and VM browser
coverage remain tracked in `../MIGRATION.md`.
