import Joi from 'joi';

export const projectValidation = {
  create: Joi.object({
    name: Joi.string().min(1).max(200).required().trim().messages({
      'string.min': 'Project name cannot be empty',
      'string.max': 'Project name cannot exceed 200 characters',
      'any.required': 'Project name is required',
    }),
    description: Joi.string().max(2000).allow('', null).trim().messages({
      'string.max': 'Description cannot exceed 2000 characters',
    }),
    client_id: Joi.string().uuid().allow(null).messages({
      'string.guid': 'Client ID must be a valid UUID',
    }),
    status: Joi.string()
      .valid('planning', 'active', 'on-hold', 'completed', 'cancelled')
      .default('planning')
      .messages({
        'any.only': 'Status must be one of: planning, active, on-hold, completed, cancelled',
      }),
    start_date: Joi.date().iso().allow(null).messages({
      'date.format': 'Start date must be a valid ISO 8601 date',
    }),
    end_date: Joi.date().iso().allow(null).greater(Joi.ref('start_date')).messages({
      'date.format': 'End date must be a valid ISO 8601 date',
      'date.greater': 'End date must be after start date',
    }),
  }),
  update: Joi.object({
    name: Joi.string().min(1).max(200).trim().messages({
      'string.min': 'Project name cannot be empty',
      'string.max': 'Project name cannot exceed 200 characters',
    }),
    description: Joi.string().max(2000).allow('', null).trim().messages({
      'string.max': 'Description cannot exceed 2000 characters',
    }),
    client_id: Joi.string().uuid().allow(null).messages({
      'string.guid': 'Client ID must be a valid UUID',
    }),
    status: Joi.string().valid('planning', 'active', 'on-hold', 'completed', 'cancelled').messages({
      'any.only': 'Status must be one of: planning, active, on-hold, completed, cancelled',
    }),
    start_date: Joi.date().iso().allow(null).messages({
      'date.format': 'Start date must be a valid ISO 8601 date',
    }),
    end_date: Joi.date().iso().allow(null).messages({
      'date.format': 'End date must be a valid ISO 8601 date',
    }),
  })
    .min(1)
    .custom((value, helpers) => {
      if (value.start_date && value.end_date) {
        const start = new Date(value.start_date);
        const end = new Date(value.end_date);
        if (end <= start) {
          return helpers.error('date.greater');
        }
      }
      return value;
    }),

  projectId: Joi.object({
    id: Joi.string().uuid().required().messages({
      'string.guid': 'Project ID must be a valid UUID',
      'any.required': 'Project ID is required',
    }),
  }),
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
    status: Joi.string().valid('planning', 'active', 'on-hold', 'completed', 'cancelled').messages({
      'any.only': 'Status must be one of: planning, active, on-hold, completed, cancelled',
    }),
    client_id: Joi.string().uuid().messages({
      'string.guid': 'Client ID must be a valid UUID',
    }),
  }),
};
