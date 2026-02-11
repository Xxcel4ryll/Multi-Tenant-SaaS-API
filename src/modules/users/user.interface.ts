export interface IUser {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface IUserCreate {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface IUserUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface IUserFilter {
  email?: string;
  id?: string;
}

export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface IAuthTokens {
  token: string;
  refresh_token: string;
}
