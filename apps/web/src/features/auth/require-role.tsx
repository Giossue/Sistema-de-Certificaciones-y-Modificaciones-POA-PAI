import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { AppRole, hasRole } from "./role-access";
import { useAuth } from "./use-auth";

export function RequireRole({ allowedRoles, children }: { allowedRoles: AppRole[]; children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg">
        <p className="text-slate-500">Cargando...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!hasRole(user.rol, allowedRoles)) {
    return (
      <div className="p-6">
        <div className="bg-white shadow-sm p-6 max-w-xl">
          <h1 className="text-xl font-bold text-slate-800">Acceso restringido</h1>
          <p className="text-sm text-slate-500 mt-2">Tu rol no tiene permisos para este modulo.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
