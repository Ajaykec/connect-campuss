const db = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

async function getAudit(req, res) {
  const p = await db.query('SELECT id FROM projects WHERE id = $1', [req.params.id]);
  if (!p.rows.length) throw new AppError(404, `Project ${req.params.id} not found.`);
  const { rows } = await db.query(
    'SELECT * FROM audit_logs WHERE project_id = $1 ORDER BY created_at DESC, id DESC',
    [req.params.id]
  );
  res.json({ success: true, data: rows });
}

module.exports = { getAudit };
