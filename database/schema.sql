-- ScopeLock schema (PostgreSQL). Safe to run more than once.

CREATE TABLE IF NOT EXISTS projects (
  id                        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_name              TEXT           NOT NULL CHECK (length(trim(project_name)) > 0),
  client_name               TEXT           NOT NULL CHECK (length(trim(client_name)) > 0),
  -- BASELINE: set once at creation, never updated by the app.
  original_scope            TEXT           NOT NULL CHECK (length(trim(original_scope)) > 0),
  original_budget           NUMERIC(12,2)  NOT NULL CHECK (original_budget >= 0),
  original_deadline         DATE           NOT NULL,
  -- CURRENT TERMS: change only when a change request is approved.
  current_approved_budget   NUMERIC(12,2)  NOT NULL CHECK (current_approved_budget >= 0),
  current_approved_deadline DATE           NOT NULL,
  created_at                TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  CHECK (current_approved_budget >= original_budget),
  CHECK (current_approved_deadline >= original_deadline)
);

CREATE TABLE IF NOT EXISTS change_requests (
  id                        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id                BIGINT         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  description               TEXT           NOT NULL CHECK (length(trim(description)) > 0),
  reason                    TEXT           NOT NULL CHECK (length(trim(reason)) > 0),
  estimated_extra_cost      NUMERIC(12,2)  NOT NULL CHECK (estimated_extra_cost >= 0),
  estimated_additional_days INTEGER        NOT NULL CHECK (estimated_additional_days >= 0),
  status                    TEXT           NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at                TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  decided_at                TIMESTAMPTZ,
  -- a decision time must exist if and only if the request is no longer pending
  CHECK ((status = 'pending' AND decided_at IS NULL) OR (status <> 'pending' AND decided_at IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id        BIGINT       NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  change_request_id BIGINT       REFERENCES change_requests(id) ON DELETE SET NULL,
  action            TEXT         NOT NULL CHECK (action IN
                      ('project_created', 'change_submitted', 'change_approved', 'change_rejected')),
  details           TEXT         NOT NULL,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_change_requests_project ON change_requests (project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_change_requests_status  ON change_requests (status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_project      ON audit_logs (project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_change       ON audit_logs (change_request_id);
