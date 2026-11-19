# VM synchronization

Use GitHub push/pull on `main`, with `git pull --ff-only` on the VM. The reviewed
`pre-github-sync-schema-reconciliation` stash contained only the Nginx report
proxy regex, already present in committed `nginx.conf`; no separate VM variant
is required. Syncing source does not rebuild the running frontend container.

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
reference creation, blank editing, operation lifecycle, bill/payment creation,
payment/shipping downloads, payroll save/export, failed-save input retention,
and section navigation. Full workflow and VM browser
coverage remain tracked in `../MIGRATION.md`.

## Isolated VM browser checks

Reset the disposable MySQL clone with the backend's `mysql_fullclone_qa.py`.
From the VM Compose directory, run `python3 backend/scripts/browser_vm_qa.py start`.
It creates clone-restricted credentials and temporary backend/Nginx containers
on port 8081. Supply the current frontend `dist/`, backend source, and scripts.
Never point browser tests at the working service on port 8080.

Set `BROWSER_QA_URL=http://127.0.0.1:8081` (through an SSH tunnel if needed), then
run `npm run test:e2e`. Finally run
`python3 backend/scripts/browser_vm_qa.py stop` to remove containers/account and
record working-table checksum comparisons in `qa-results/browser-integrity.json`.
The fixture creates known QA accounts only in the disposable database.
