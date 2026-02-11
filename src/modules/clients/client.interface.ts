/**
 * Client Interfaces
 */

export interface IClient {
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

export interface IClientCreate {
  organization_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  created_by: string;
}

export interface IClientUpdate {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
}

export interface IClientFilter {
  organization_id: string;
  id?: string;
  name?: string;
  email?: string;
  company?: string;
}

export interface IClientWithCreator extends IClient {
  creator?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}
