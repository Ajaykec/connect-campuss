// Business logic for change requests. All SQL touching approvals lives here.
const db = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { resolveImpact } = require('./impactCalculator');

async function submitChange(projectId, body) {
  const impact = resolveImpact(body);
  return db.withTransaction(async (client) => {
    const p = await client.query('SELECT id FROM projects WHERE id = $1', [projectId]);
    if (!p.rows.length) throw new AppError(404, `Project ${projectId} not found.`);

    const { rows } = await client.query(
      `INSERT INTO change_requests (project_id, description, reason, estimated_extra_cost, estimated_additional_days)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [projectId, body.description.trim(), body.reason.trim(), impact.estimated_extra_cost, impact.estimated_additional_days]
    );
    const change = rows[0];
    await client.query(
      `INSERT INTO audit_logs (project_id, change_request_id, action, details) VALUES ($1, $2, 'change_submitted', $3)`,
      [projectId, change.id, `Change request submitted: ${change.description} (+${change.estimated_extra_cost} cost, +${change.estimated_additional_days} days)`]
    );
    return change;
  });
}

// decision is 'approved' or 'rejected'. One transaction: status + project terms + audit log.
async function decideChange(changeId, decision) {
  return db.withTransaction(async (client) => {
    // FOR UPDATE locks the row so two people can't decide the same request at once.
    const found = await client.query('SELECT * FROM change_requests WHERE id = $1 FOR UPDATE', [changeId]);
    const change = found.rows[0];
    if (!change) throw new AppError(404, `Change request ${changeId} not found.`);
    if (change.status !== 'pending') {
      throw new AppError(409, `Change request already ${change.status}. Only pending requests can be decided.`);
    }

    const updated = await client.query(
      `UPDATE change_requests SET status = $1, decided_at = NOW() WHERE id = $2 RETURNING *`,
      [decision, changeId]
    );

    let details = `Change request ${changeId} rejected. Project terms unchanged.`;
    if (decision === 'approved') {
      // Only the CURRENT approved values change. original_* columns are never touched.
      await client.query(
        `UPDATE projects
            SET current_approved_budget   = current_approved_budget + $1,
                current_approved_deadline = current_approved_deadline + $2::int
          WHERE id = $3`,
        [change.estimated_extra_cost, change.estimated_additional_days, change.project_id]
      );
      details = `Change request ${changeId} approved: budget +${change.estimated_extra_cost}, deadline +${change.estimated_additional_days} days.`;
    }

    await client.query(
      `INSERT INTO audit_logs (project_id, change_request_id, action, details) VALUES ($1, $2, $3, $4)`,
      [change.project_id, changeId, decision === 'approved' ? 'change_approved' : 'change_rejected', details]
    );
    return updated.rows[0];
  });
}

module.exports = { submitChange, decideChange };
