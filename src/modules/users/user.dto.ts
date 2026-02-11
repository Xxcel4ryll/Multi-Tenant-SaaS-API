/**
 * User Data Transfer Objects (DTOs)
 * These define the shape of data sent to/from the API
 */

export class CreateUserDto {
  email!: string;
  password!: string;
  first_name!: string;
  last_name!: string;
}

export class LoginDto {
  email!: string;
  password!: string;
}

export class UpdateUserDto {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export class UserResponseDto {
  id!: string;
  email!: string;
  first_name!: string;
  last_name!: string;
  created_at!: Date;
  updated_at!: Date;
}

export class LoginResponseDto {
  token!: string;
  refresh_token!: string;
  user!: UserResponseDto;
}
