import { createContext } from "react";
import type {
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from "../types/auth";

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
