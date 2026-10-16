# Database

PostgreSQL. Files: `schema.sql` (tables, constraints, indexes) and `seed.sql` (demo data, run once on an empty database).

## Option A: Supabase (no local install)
1. Create a project at supabase.com. Go to **Project Settings > Database** and copy the connection string.
2. In `.env` set `DATABASE_URL=<that string with your password>` and `DATABASE_SSL=true`.

## Option B: Local PostgreSQL
1. Install PostgreSQL, create a database: `createdb scopelock` (or use pgAdmin).
2. In `.env` set `DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/scopelock`, `DATABASE_SSL=false`.

## Create the tables
From the `backend` folder:
```powershell
npm run db:init            # tables only
npm run db:init -- --seed  # tables + demo data (empty database only)
```
Alternatively paste `schema.sql` then `seed.sql` into the Supabase SQL Editor.

## Design notes
- `original_*` columns are the locked baseline. The app only updates `current_approved_*`.
- Database `CHECK`s block invalid statuses, negative money, and approved terms below the original.
- Switching databases later only requires changing `DATABASE_URL` (code lives in `backend/config/database.js`).
