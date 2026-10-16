// Consistent error format: { success: false, error: { message, details? } }
class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function notFound(req, res, next) {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    err = new AppError(400, 'Request body is not valid JSON.');
  }
  // Postgres connection problems -> 503 with a helpful message
  if (['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', '28P01', '3D000'].includes(err.code)) {
    err = new AppError(503, 'Cannot connect to the database. Check DATABASE_URL and that PostgreSQL is running.');
  }
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({
    success: false,
    error: {
      message: status === 500 ? 'Internal server error.' : err.message,
      ...(err.details ? { details: err.details } : {}),
    },
  });
}

module.exports = { AppError, notFound, errorHandler };
