// Small hand-written validators (no extra libraries, easy for beginners to read).
const { AppError } = require('./errorHandler');

// Checks :id in the URL is a positive whole number.
function validateIdParam(req, res, next) {
  if (!/^[1-9]\d*$/.test(req.params.id)) {
    return next(new AppError(400, 'ID must be a positive whole number.'));
  }
  req.params.id = Number(req.params.id);
  next();
}

// Wraps a function that returns a list of error strings ([] = valid).
function validateBody(checkFn) {
  return (req, res, next) => {
    const errors = checkFn(req.body || {});
    if (errors.length) return next(new AppError(400, 'Validation failed.', errors));
    next();
  };
}

const isText = (v) => typeof v === 'string' && v.trim().length > 0;
const isMoney = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const isDays = (v) => Number.isInteger(v) && v >= 0;
const isDate = (v) => {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(v + 'T00:00:00Z');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
};

function checkProject(b) {
  const e = [];
  if (!isText(b.project_name)) e.push('project_name is required.');
  if (!isText(b.client_name)) e.push('client_name is required.');
  if (!isText(b.original_scope)) e.push('original_scope is required.');
  if (!isMoney(b.original_budget)) e.push('original_budget must be a number >= 0.');
  if (!isDate(b.original_deadline)) e.push('original_deadline must be a date like 2026-12-31.');
  return e;
}

// A change request needs EITHER estimated_hours (we calculate) OR both manual estimates.
function checkChangeRequest(b) {
  const e = [];
  if (!isText(b.description)) e.push('description is required.');
  if (!isText(b.reason)) e.push('reason is required.');
  if (b.estimated_hours !== undefined && b.estimated_hours !== null) {
    if (typeof b.estimated_hours !== 'number' || !(b.estimated_hours > 0)) e.push('estimated_hours must be a number > 0.');
  } else {
    if (!isMoney(b.estimated_extra_cost)) e.push('Provide estimated_hours, or estimated_extra_cost (number >= 0).');
    if (!isDays(b.estimated_additional_days)) e.push('Provide estimated_hours, or estimated_additional_days (whole number >= 0).');
  }
  return e;
}

module.exports = { validateIdParam, validateBody, checkProject, checkChangeRequest };
