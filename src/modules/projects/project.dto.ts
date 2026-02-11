/**
 * Project Data Transfer Objects (DTOs)
 */

import { ProjectStatus } from '../../types';

export class CreateProjectDto {
  name!: string;
  description?: string;
  client_id?: string;
  status?: ProjectStatus;
  start_date?: Date;
  end_date?: Date;
}

export class UpdateProjectDto {
  name?: string;
  description?: string;
  client_id?: string;
  status?: ProjectStatus;
  start_date?: Date;
  end_date?: Date;
}

export class ProjectResponseDto {
  id!: string;
  organization_id!: string;
  name!: string;
  description?: string;
  client_id?: string;
  status!: ProjectStatus;
  start_date?: Date;
  end_date?: Date;
  created_by!: string;
  created_at!: Date;
  updated_at!: Date;
  client?: {
    id: string;
    name: string;
    email?: string;
    company?: string;
  };
  creator?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export class ProjectListResponseDto {
  id!: string;
  name!: string;
  description?: string;
  status!: ProjectStatus;
  start_date?: Date;
  end_date?: Date;
  created_at!: Date;
  client?: {
    id: string;
    name: string;
  };
  creator?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export class ProjectFilterDto {
  status?: ProjectStatus;
  client_id?: string;
  page?: number;
  limit?: number;
}
