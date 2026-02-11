/**
 * Project Interfaces
 */

import { ProjectStatus } from '../../types';

export interface IProject {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  client_id?: string;
  status: ProjectStatus;
  start_date?: Date;
  end_date?: Date;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface IProjectCreate {
  organization_id: string;
  name: string;
  description?: string;
  client_id?: string;
  status?: ProjectStatus;
  start_date?: Date;
  end_date?: Date;
  created_by: string;
}

export interface IProjectUpdate {
  name?: string;
  description?: string;
  client_id?: string;
  status?: ProjectStatus;
  start_date?: Date;
  end_date?: Date;
}

export interface IProjectFilter {
  organization_id: string;
  status?: ProjectStatus;
  client_id?: string;
}

export interface IProjectWithRelations extends IProject {
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
