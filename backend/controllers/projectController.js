const db = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

async function listProjects(req, res) {
  const { rows } = await db.query('SELECT * FROM projects ORDER BY created_at DESC, id DESC');
  res.json({ success: true, data: rows });
}

async function createProject(req, res) {
  const b = req.body;
  const project = await db.withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO projects (project_name, client_name, original_scope, original_budget, original_deadline,
                             current_approved_budget, current_approved_deadline)
       VALUES ($1, $2, $3, $4, $5, $4, $5) RETURNING *`,
      [b.project_name.trim(), b.client_name.trim(), b.original_scope.trim(), b.original_budget, b.original_deadline]
    );
    await client.query(
      `INSERT INTO audit_logs (project_id, action, details) VALUES ($1, 'project_created', $2)`,
      [rows[0].id, `Project "${rows[0].project_name}" created with budget ${rows[0].original_budget} and deadline ${rows[0].original_deadline}.`]
    );
    return rows[0];
  });
  res.status(201).json({ success: true, data: project });
}

async function getProject(req, res) {
  const { rows } = await db.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
  if (!rows.length) throw new AppError(404, `Project ${req.params.id} not found.`);
  res.json({ success: true, data: rows[0] });
}

module.exports = { listProjects, createProject, getProject };
