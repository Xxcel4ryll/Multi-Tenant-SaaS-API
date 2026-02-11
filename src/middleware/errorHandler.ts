import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } from 'sequelize';
import logger from '../utils/logger';
import { AppError } from '../types';
import config from '../config';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = 'An unexpected error occurred';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ValidationError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = err.errors.map((e) => e.message).join(', ');
  } else if (err instanceof UniqueConstraintError) {
    statusCode = StatusCodes.CONFLICT;
    const fields = err.errors.map((e) => e.path).join(', ');

    if (fields.includes('email')) {
      message = 'Email already exists';
    } else if (fields.includes('slug')) {
      message = 'Organization slug already exists';
    } else if (fields.includes('name')) {
      message = 'A resource with this name already exists in this organization';
    } else {
      message = 'This resource already exists';
    }
  } else if (err instanceof ForeignKeyConstraintError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Invalid reference to related resource';
  }

  logger.error({
    statusCode,
    message: err.message,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    stack: err.stack,
  });

  const response: {
    success: boolean;
    message: string;
    stack?: string;
  } = {
    success: false,
    message,
  };

  if (config.node_env === 'development' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  logger.warn(`404 - Route not found: ${req.originalUrl}`);
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Resource not found',
  });
};
