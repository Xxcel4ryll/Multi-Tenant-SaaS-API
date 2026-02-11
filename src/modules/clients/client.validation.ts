/**
 * Client Validation Schemas
 */

import Joi from 'joi';

export const clientValidation = {
  /**
   * Validation for creating a client
   */
  create: Joi.object({
    name: Joi.string().min(1).max(100).required().trim().messages({
      'string.min': 'Client name cannot be empty',
      'string.max': 'Client name cannot exceed 100 characters',
      'any.required': 'Client name is required',
    }),
    email: Joi.string().email().allow('', null).lowercase().trim().messages({
      'string.email': 'Please provide a valid email address',
    }),
    phone: Joi.string()
      .max(20)
      .allow('', null)
      .trim()
      .pattern(/^[\d\s\-+()]+$/)
      .messages({
        'string.max': 'Phone number cannot exceed 20 characters',
        'string.pattern.base': 'Please provide a valid phone number',
      }),
    company: Joi.string().max(100).allow('', null).trim().messages({
      'string.max': 'Company name cannot exceed 100 characters',
    }),
    notes: Joi.string().max(1000).allow('', null).trim().messages({
      'string.max': 'Notes cannot exceed 1000 characters',
    }),
  }),

  /**
   * Validation for updating a client
   */
  update: Joi.object({
    name: Joi.string().min(1).max(100).trim().messages({
      'string.min': 'Client name cannot be empty',
      'string.max': 'Client name cannot exceed 100 characters',
    }),
    email: Joi.string().email().allow('', null).lowercase().trim().messages({
      'string.email': 'Please provide a valid email address',
    }),
    phone: Joi.string()
      .max(20)
      .allow('', null)
      .trim()
      .pattern(/^[\d\s\-+()]+$/)
      .messages({
        'string.max': 'Phone number cannot exceed 20 characters',
        'string.pattern.base': 'Please provide a valid phone number',
      }),
    company: Joi.string().max(100).allow('', null).trim().messages({
      'string.max': 'Company name cannot exceed 100 characters',
    }),
    notes: Joi.string().max(1000).allow('', null).trim().messages({
      'string.max': 'Notes cannot exceed 1000 characters',
    }),
  }).min(1),

  /**
   * Validation for client ID parameter
   */
  clientId: Joi.object({
    id: Joi.string().uuid().required().messages({
      'string.guid': 'Client ID must be a valid UUID',
      'any.required': 'Client ID is required',
    }),
  }),

  /**
   * Validation for pagination and filtering
   */
  query: Joi.object({
    page: Joi.number().integer().min(1).messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1',
    }),
    limit: Joi.number().integer().min(1).max(100).messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
    }),
  }),
};
