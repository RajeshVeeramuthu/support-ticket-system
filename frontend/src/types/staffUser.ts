import type { UserRole } from "./auth";

export type StaffRole = Extract<UserRole, "AGENT" | "ADMIN">;

export interface StaffUser {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface CreateStaffUserRequest {
  fullName: string;
  email: string;
  password: string;
  role: StaffRole;
}
