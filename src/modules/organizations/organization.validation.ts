/**
 * Organization Validation Schemas
 */

import Joi from 'joi';

export const organizationValidation = {
  /**
   * Validation for creating an organization
   */
  create: Joi.object({
    name: Joi.string().min(2).max(100).required().trim().messages({
      'string.min': 'Organization name must be at least 2 characters',
      'string.max': 'Organization name cannot exceed 100 characters',
      'any.required': 'Organization name is required',
    }),
    slug: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-z0-9-]+$/)
      .required()
      .lowercase()
      .trim()
      .messages({
        'string.min': 'Slug must be at least 2 characters',
        'string.max': 'Slug cannot exceed 50 characters',
        'string.pattern.base': 'Slug can only contain lowercase letters, numbers, and hyphens',
        'any.required': 'Organization slug is required',
      }),
    description: Joi.string().max(500).allow('', null).trim().messages({
      'string.max': 'Description cannot exceed 500 characters',
    }),
  }),

  /**
   * Validation for updating an organization
   */
  update: Joi.object({
    name: Joi.string().min(2).max(100).trim().messages({
      'string.min': 'Organization name must be at least 2 characters',
      'string.max': 'Organization name cannot exceed 100 characters',
    }),
    description: Joi.string().max(500).allow('', null).trim().messages({
      'string.max': 'Description cannot exceed 500 characters',
    }),
  }).min(1),

  /**
   * Validation for adding a member to an organization
   */
  addMember: Joi.object({
    user_id: Joi.string().uuid().required().messages({
      'string.guid': 'User ID must be a valid UUID',
      'any.required': 'User ID is required',
    }),
    role: Joi.string().valid('owner', 'admin', 'member').required().messages({
      'any.only': 'Role must be one of: owner, admin, member',
      'any.required': 'Role is required',
    }),
  }),

  /**
   * Validation for updating member role
   */
  updateMemberRole: Joi.object({
    role: Joi.string().valid('owner', 'admin', 'member').required().messages({
      'any.only': 'Role must be one of: owner, admin, member',
      'any.required': 'Role is required',
    }),
  }),

  /**
   * Validation for organization ID parameter
   */
  organizationId: Joi.object({
    id: Joi.string().uuid().required().messages({
      'string.guid': 'Organization ID must be a valid UUID',
      'any.required': 'Organization ID is required',
    }),
  }),
};
