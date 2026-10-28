import { useCallback, useMemo, useState, type ReactNode } from "react";
import { authApi } from "../api/authApi";
import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from "../types/auth";
import { AuthContext } from "./contextValue";

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== "object" || value === null) return false;
  const user = value as Record<string, unknown>;
  return (
    typeof user.id === "number" &&
    typeof user.fullName === "string" &&
    typeof user.email === "string" &&
    (user.role === "USER" || user.role === "AGENT" || user.role === "ADMIN")
  );
}

function getStoredUser(): AuthUser | null {
  const raw = sessionStorage.getItem("authUser");
  const token = sessionStorage.getItem("accessToken");

  if (!raw || !token) {
    sessionStorage.removeItem("authUser");
    sessionStorage.removeItem("accessToken");
    return null;
  }

  try {
    const user: unknown = JSON.parse(raw);
    if (isAuthUser(user)) return user;
  } catch {
    sessionStorage.removeItem("authUser");
    sessionStorage.removeItem("accessToken");
    return null;
  }

  sessionStorage.removeItem("authUser");
  sessionStorage.removeItem("accessToken");
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);

  const saveSession = useCallback((data: AuthResponse) => {
    sessionStorage.setItem("accessToken", data.token);
    sessionStorage.setItem("authUser", JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    saveSession(await authApi.login(data));
  }, [saveSession]);

  const register = useCallback(async (data: RegisterRequest) => {
    await authApi.register(data);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("authUser");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user && sessionStorage.getItem("accessToken")),
      login,
      register,
      logout,
    }),
    [user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
