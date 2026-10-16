// These tests need NO database: they cover the health check and input validation (rejected before any SQL runs).
// Approve/reject/audit flows need a real database - see tests/README.md for the manual checklist.
const test = require('node:test');
const assert = require('node:assert');
delete process.env.DATABASE_URL; // make sure the "not configured" path is what we test
const app = require('../backend/app');

let server, base;
test.before(async () => {
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  base = `http://localhost:${server.address().port}`;
});
test.after(() => server.close());

const call = async (path, options) => {
  const res = await fetch(base + path, { headers: { 'Content-Type': 'application/json' }, ...options });
  return { status: res.status, body: await res.json() };
};

test('GET /api/health works without a database', async () => {
  const { status, body } = await call('/api/health');
  assert.strictEqual(status, 200);
  assert.strictEqual(body.data.status, 'ok');
  assert.strictEqual(body.data.databaseConfigured, false);
});

test('POST /api/projects with empty body -> 400 with details', async () => {
  const { status, body } = await call('/api/projects', { method: 'POST', body: '{}' });
  assert.strictEqual(status, 400);
  assert.strictEqual(body.success, false);
  assert.ok(body.error.details.length >= 5);
});

test('invalid ids -> 400', async () => {
  assert.strictEqual((await call('/api/projects/abc')).status, 400);
  assert.strictEqual((await call('/api/projects/0/audit')).status, 400);
  assert.strictEqual((await call('/api/changes/-1/approve', { method: 'POST' })).status, 400);
});

test('change request without estimates -> 400', async () => {
  const { status } = await call('/api/projects/1/changes', { method: 'POST', body: JSON.stringify({ description: 'x', reason: 'y' }) });
  assert.strictEqual(status, 400);
});

test('valid request but no database configured -> 503 with clear message', async () => {
  const { status, body } = await call('/api/projects');
  assert.strictEqual(status, 503);
  assert.match(body.error.message, /DATABASE_URL/);
});

test('unknown API route -> 404', async () => {
  assert.strictEqual((await call('/api/nope')).status, 404);
});
