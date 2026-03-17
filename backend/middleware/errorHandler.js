// Global Error Handling Middleware
// Catches all errors and formats consistent response
// Beginner-friendly: Logs errors, sends user-safe messages

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Trust error from app code
  }
}

const errorHandler = (err, req, res, next) => {
  // Set default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Development: detailed error info
  // Production: minimal info
  const errorDev = process.env.NODE_ENV === 'development' ? {
    message: err.message,
    stack: err.stack,
    ...(err.errors && { validation: err.errors }),
  } : {};

  // Operational errors (known issues)
  const errorProd = { message: err.isOperational ? err.message : 'Something went wrong!' };

  // Send response
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && errorDev),
    ...(process.env.NODE_ENV !== 'development' && errorProd),
  });
};

module.exports = errorHandler;

