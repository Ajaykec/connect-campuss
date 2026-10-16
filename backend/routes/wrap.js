// Express 4 doesn't catch errors from async functions by itself; this passes them to the error handler.
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
