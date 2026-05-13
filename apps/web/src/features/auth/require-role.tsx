import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { AppRole, hasRole } from "./role-access";
import { useAuth } from "./use-auth";

export function RequireRole({
  allowedRoles,
  children,
}: {
  allowedRoles: AppRole[];
  children: ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!hasRole(user.rol, allowedRoles)) {
    return (
      <div className="p-6">
        <div className="section-card p-6 max-w-xl">
          <h1>Acceso restringido</h1>
          <p>Tu rol no tiene permisos para este modulo.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
