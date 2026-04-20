const env = require('../config/env');

function notFoundMiddleware(req, _res, next) {
  const error = new Error(`Rota nao encontrada: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorMiddleware(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;

  const response = {
    message: err.message || 'Erro interno do servidor'
  };

  if (env.nodeEnv !== 'production' && err.details) {
    response.details = err.details;
  }

  if (env.nodeEnv !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = {
  notFoundMiddleware,
  errorMiddleware
};
