/**
 * asyncHandler
 * Wraps async route handlers to catch errors without try-catch
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * errorHandler
 * Centralized error handler with proper formatting
 */
const errorHandler = (err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error('❌ Error:', message);

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = {
  asyncHandler,
  errorHandler,
};
