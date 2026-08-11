import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

export function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const location = useLocation();
  const auth = sessionStorage.getItem("hcp-auth");

  if (!auth) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (adminOnly && auth !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const auth = sessionStorage.getItem("hcp-auth");

  if (!auth) {
    return <Navigate to={`/admin/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (auth !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
