/**
 * User Validation Schemas
 * Joi schemas for validating user-related requests
 */

import Joi from 'joi';

export const userValidation = {
  /**
   * Validation for user registration
   */
  register: Joi.object({
    email: Joi.string().email().required().lowercase().trim().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password cannot exceed 128 characters',
        'string.pattern.base':
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required',
      }),
    first_name: Joi.string().min(1).max(50).required().trim().messages({
      'string.min': 'First name cannot be empty',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required',
    }),
    last_name: Joi.string().min(1).max(50).required().trim().messages({
      'string.min': 'Last name cannot be empty',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required',
    }),
  }),

  /**
   * Validation for user login
   */
  login: Joi.object({
    email: Joi.string().email().required().lowercase().trim().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
    }),
  }),

  /**
   * Validation for updating user profile
   */
  update: Joi.object({
    first_name: Joi.string().min(1).max(50).trim().messages({
      'string.min': 'First name cannot be empty',
      'string.max': 'First name cannot exceed 50 characters',
    }),
    last_name: Joi.string().min(1).max(50).trim().messages({
      'string.min': 'Last name cannot be empty',
      'string.max': 'Last name cannot exceed 50 characters',
    }),
    email: Joi.string().email().lowercase().trim().messages({
      'string.email': 'Please provide a valid email address',
    }),
  }).min(1), // At least one field must be provided
};
