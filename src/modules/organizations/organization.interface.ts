/**
 * Organization Interfaces
 */

import { UserRole } from '../../types';

export interface IOrganization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IOrganizationCreate {
  name: string;
  slug: string;
  description?: string;
  created_by: string;
}

export interface IOrganizationUpdate {
  name?: string;
  description?: string;
}

export interface IOrganizationUser {
  id: string;
  user_id: string;
  organization_id: string;
  role: UserRole;
  joined_at: Date;
}

export interface IAddMember {
  user_id: string;
  organization_id: string;
  role: UserRole;
}

export interface IUpdateMemberRole {
  user_id: string;
  organization_id: string;
  role: UserRole;
}

export interface IOrganizationFilter {
  id?: string;
  slug?: string;
  name?: string;
}

export interface IOrganizationWithMembers extends IOrganization {
  members?: IOrganizationUser[];
  member_count?: number;
}
