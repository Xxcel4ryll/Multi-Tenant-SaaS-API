import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../types';

interface ValidationSchemas {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}

export const validateRequest = (schemas: ValidationSchemas) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (schemas.body) {
      const { error } = schemas.body.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const message = error.details.map((detail) => detail.message).join(', ');
        throw new AppError(message, StatusCodes.BAD_REQUEST);
      }
    }

    if (schemas.query) {
      const { error, value } = schemas.query.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const message = error.details.map((detail) => detail.message).join(', ');
        throw new AppError(message, StatusCodes.BAD_REQUEST);
      }

      req.query = value as typeof req.query;
    }

    if (schemas.params) {
      const { error, value } = schemas.params.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const message = error.details.map((detail) => detail.message).join(', ');
        throw new AppError(message, StatusCodes.BAD_REQUEST);
      }

      req.params = value as typeof req.params;
    }

    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((detail) => detail.message).join(', ');
      throw new AppError(message, StatusCodes.BAD_REQUEST);
    }

    req.query = value as typeof req.query;
    next();
  };
};
