const db = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const approvalService = require('../services/approvalService');

async function submitChange(req, res) {
  const change = await approvalService.submitChange(req.params.id, req.body);
  res.status(201).json({ success: true, data: change });
}

async function listChanges(req, res) {
  const p = await db.query('SELECT id FROM projects WHERE id = $1', [req.params.id]);
  if (!p.rows.length) throw new AppError(404, `Project ${req.params.id} not found.`);
  const { rows } = await db.query(
    'SELECT * FROM change_requests WHERE project_id = $1 ORDER BY created_at DESC, id DESC',
    [req.params.id]
  );
  res.json({ success: true, data: rows });
}

const approve = async (req, res) => {
  res.json({ success: true, data: await approvalService.decideChange(req.params.id, 'approved') });
};
const reject = async (req, res) => {
  res.json({ success: true, data: await approvalService.decideChange(req.params.id, 'rejected') });
};

module.exports = { submitChange, listChanges, approve, reject };
