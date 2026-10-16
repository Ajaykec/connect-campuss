# ScopeLock - Scope Lock & Contract Management

ScopeLock keeps a project's **original scope, budget and deadline locked** as a baseline. Extra work becomes a **change request** with an estimated cost and delay; the client approves or rejects it. Only approval changes the *current approved* budget and deadline, and every step is written to an **audit log**.

**Stack:** HTML/CSS/vanilla JS - Node.js + Express - PostgreSQL (Supabase optional). No frontend framework.

## Status (read this first)
- Works: all endpoints below, transactions, validation, frontend shell. The API flow was exercised with curl against a real local PostgreSQL 16 (approve, reject, duplicate decisions, 404s, audit log). The frontend pages were checked to load, but **not clicked through in a browser**.
- Automated tests (`npm test`) cover the calculator, health check and validation only. Database flows are a manual checklist in `tests/README.md`.
- **No authentication or authorization.** Anyone who can reach the server can approve or reject a change; "only the client approves" is not enforced. Do not deploy publicly as-is.
- Not built: edit/delete projects, users/roles, weekend-aware deadlines, currency choice (UI shows USD).

## Quick start (Windows, VS Code, PowerShell)
Needs Node.js 18+ and a PostgreSQL database (see `database/README.md`: Supabase or local).

```powershell
cd scopelock\backend
npm install
cd ..
Copy-Item .env.example .env      # open .env and set DATABASE_URL (and DATABASE_SSL=true for Supabase)
cd backend
npm run db:init -- --seed        # tables + demo data (or "npm run db:init" for tables only)
npm start
```
Open **http://localhost:3000**. Health check: http://localhost:3000/api/health (works without a database and shows `databaseConfigured`).

If `DATABASE_URL` is empty the server still starts, but database endpoints return **503** explaining what to configure. Nothing is faked.

Tests: `cd backend; npm test`

## Layout
```
frontend/   index.html, pages/, css/, js/ (api.js = all API calls)
backend/    server.js (starts) - app.js (Express setup) - routes/ -> controllers/ -> services/ -> config/database.js
            scripts/initDb.js (runs the SQL files)
database/   schema.sql, seed.sql, README.md
tests/      automated tests + manual checklist
```
Changes from your proposed structure: added `backend/scripts/initDb.js` (so `npm run db:init` works on Windows without `psql`), `backend/routes/wrap.js` (sends async errors to the error handler), and `frontend/assets/.gitkeep` (Git ignores empty folders). Express also serves `frontend/`, so no CORS setup is needed in the browser.

A request flows: **route** (URL + validation) -> **controller** (HTTP in/out) -> **service** (business rules) -> **database.js** (SQL).

## Business rules and assumptions
- New change requests start `pending`. Only `pending` can be decided; a second decision returns **409**.
- Approve runs in **one transaction**: set status, `current_approved_budget += cost`, `current_approved_deadline += days`, write audit row. Reject: status + audit only.
- `original_*` columns are never updated.
- **Impact calculation** (`backend/services/impactCalculator.js`): with `estimated_hours`, cost = hours x `HOURLY_RATE` (default 50) and days = ceil(hours / `WORKING_HOURS_PER_DAY`) (default 6). Days are calendar days (weekends not skipped). Or send cost and days yourself. Change the rules in `.env` or that file.

## API reference
Success: `{ "success": true, "data": ... }`. Error: `{ "success": false, "error": { "message": "...", "details": ["..."] } }`.
Codes: 200 OK, 201 created, 400 validation/bad id, 404 not found, 409 already decided, 503 database unavailable.
Dates `YYYY-MM-DD`, timestamps ISO strings, ids and money are numbers.

| Method & path | Body | Returns |
|---|---|---|
| `GET /api/health` | - | `{status:"ok", databaseConfigured:bool}` |
| `GET /api/projects` | - | array of projects |
| `POST /api/projects` | `{project_name, client_name, original_scope, original_budget, original_deadline}` | 201 project |
| `GET /api/projects/:id` | - | project |
| `POST /api/projects/:id/changes` | `{description, reason, estimated_hours}` **or** `{description, reason, estimated_extra_cost, estimated_additional_days}` | 201 change request |
| `GET /api/projects/:id/changes` | - | array, newest first |
| `POST /api/changes/:id/approve` | - | updated change request |
| `POST /api/changes/:id/reject` | - | updated change request |
| `GET /api/projects/:id/audit` | - | array, newest first |

Project: `{id, project_name, client_name, original_scope, original_budget, original_deadline, current_approved_budget, current_approved_deadline, created_at}`
Change request: `{id, project_id, description, reason, estimated_extra_cost, estimated_additional_days, status, created_at, decided_at}`
Audit log: `{id, project_id, change_request_id|null, action, details, created_at}`; action is `project_created`, `change_submitted`, `change_approved` or `change_rejected`.

## Team workflow
See `CONTRIBUTING.md`.
