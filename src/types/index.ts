import { Request } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  error?: string;
}

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// User types
export type UserRole = 'owner' | 'admin' | 'member';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: Date;
  updated_at: Date;
}

export interface OrganizationUser {
  id: string;
  organization_id: string;
  user_id: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface Client {
  id: string;
  organization_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  organization_id: string;
  client_id?: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  start_date?: Date;
  end_date?: Date;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

// JWT Payload
export interface JwtPayload {
  userId: string;
  email: string;
}

// Extended Request with auth user
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
  organizationId?: string;
  userRole?: UserRole;
}
