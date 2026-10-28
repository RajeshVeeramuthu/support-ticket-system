export type UserRole = "USER" | "AGENT" | "ADMIN";

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}