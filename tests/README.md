# Tests

Run from the `backend` folder:

```powershell
npm test
```

**Automated (no database needed):** impact calculation, health check, input validation, "database not configured" error.

**Not automated yet (needs a configured database)** - test by hand with the frontend or an API tool, using seed data:

- [ ] Approve a pending change: project budget/deadline increase; `original_*` values unchanged.
- [ ] Reject a pending change: approved budget/deadline unchanged.
- [ ] Approve/reject the same change twice: second call returns 409.
- [ ] Approve/reject id `99999`: returns 404.
- [ ] Every submit/approve/reject appears in `GET /api/projects/:id/audit`.

Testing team: turning this checklist into automated tests against a separate test database is a good task.
