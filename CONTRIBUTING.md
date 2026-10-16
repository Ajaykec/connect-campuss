# Contributing to ScopeLock

Rule of thumb: **never commit directly to `main`.** Work on a branch, open a pull request (PR), get one teammate to look at it, merge.

## 1. Clone (once)
```powershell
git clone <REPO_URL>
cd scopelock
```

## 2. Branches
Documenting branches does not create them. The repo starts with only `main`; the team lead creates the long-lived work-area branches once:
```powershell
git checkout main
git branch frontend; git branch backend; git branch database; git branch testing
git push -u origin frontend backend database testing
```
| Branch | Area |
|---|---|
| `frontend` | `frontend/` (HTML, CSS, browser JS) |
| `backend` | `backend/` (Express API, business logic) |
| `database` | `database/` (schema, seed, setup) |
| `testing` | `tests/` and docs |

**Simplest beginner workflow:** each person creates a short feature branch *from the work-area branch* and opens a PR back into it; the lead merges work-area branches into `main` via PRs at checkpoints.
```powershell
git checkout backend
git pull
git checkout -b backend/approve-endpoint
```
Name feature branches `area/what-you-do`.

## 3. Commit and push
```powershell
git status
git add backend/services/approvalService.js     # add specific files, not everything
git commit -m "Add approval service"
git push -u origin backend/approve-endpoint
```
Small, frequent commits with clear messages are better than one huge commit.

## 4. Open a pull request
On GitHub, click **Compare & pull request** after pushing. Base = the work-area branch (or `main`), describe what changed and how to test it, request a reviewer.

## 5. Avoid stepping on each other
- Stay in your area's folders. Need a change elsewhere? Ask the owner or make a tiny separate PR.
- Shared files (`README.md`, `package.json`, `schema.sql`, `app.js`): tell the team before editing.
- API shapes are the contract. Change a request/response format only after telling frontend and backend people (see README "API reference").
- Pull often, push often, keep PRs small.

## 6. Get the latest changes
```powershell
git checkout main
git pull
git checkout your-branch
git merge main
```

## 7. Resolve a merge conflict
Git stops and marks the file:
```
<<<<<<< HEAD
your version
=======
their version
>>>>>>> main
```
1. Open the file in VS Code (it shows *Accept Current / Incoming / Both* buttons).
2. Keep the correct code and delete all `<<<<<<<`, `=======`, `>>>>>>>` lines.
3. Test that it still runs.
4. `git add <file>` then `git commit` (finishes the merge).
5. Unsure? Stop and ask the other author. `git merge --abort` undoes the merge attempt.

## Secrets
Never commit `.env`, passwords, API keys or database URLs. Only `.env.example` (placeholders) goes in Git. If you leak one by accident, tell the team and change that password immediately.
