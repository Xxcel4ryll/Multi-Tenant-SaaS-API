import { UserRole } from '../../types';

export class CreateOrganizationDto {
  name!: string;
  slug!: string;
  description?: string;
}

export class UpdateOrganizationDto {
  name?: string;
  description?: string;
}

export class AddMemberDto {
  user_id!: string;
  role!: UserRole;
}

export class UpdateMemberRoleDto {
  role!: UserRole;
}

export class OrganizationResponseDto {
  id!: string;
  name!: string;
  slug!: string;
  description?: string;
  created_at!: Date;
  updated_at!: Date;
}

export class OrganizationMemberResponseDto {
  id!: string;
  user_id!: string;
  organization_id!: string;
  role!: UserRole;
  joined_at!: Date;
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export class OrganizationWithMembersDto extends OrganizationResponseDto {
  members?: OrganizationMemberResponseDto[];
  member_count?: number;
}
