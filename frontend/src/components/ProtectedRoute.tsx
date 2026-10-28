import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import type { UserRole } from "../types/auth";

export default function ProtectedRoute({
  roles,
}: {
  roles?: UserRole[];
}) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}