/**
 * Custom Application Error Class
 * Use in controllers: throw new AppError('message', 400)
 * Status codes: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 etc.
 */

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

