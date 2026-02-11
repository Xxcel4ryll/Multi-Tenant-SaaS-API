/**
 * Client Data Transfer Objects (DTOs)
 */

export class CreateClientDto {
  name!: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
}

export class UpdateClientDto {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
}

export class ClientResponseDto {
  id!: string;
  organization_id!: string;
  name!: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  created_by!: string;
  created_at!: Date;
  updated_at!: Date;
  creator?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export class ClientListResponseDto {
  id!: string;
  name!: string;
  email?: string;
  company?: string;
  created_at!: Date;
  creator?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}
