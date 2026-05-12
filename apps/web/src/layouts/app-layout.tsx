import { useEffect } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@heroui/react";
import { useAuth } from "@/features/auth/use-auth";
import { hasRole, moduleRoles } from "@/features/auth/role-access";
import {
  LayoutDashboard,
  FileSpreadsheet,
  CreditCard,
  GitBranch,
  DollarSign,
  Ban,
  BarChart2,
  Users,
  LogOut,
  Layers,
} from "lucide-react";

const navItems = [
  { path: "/", label: "Inicio", icon: LayoutDashboard, roles: moduleRoles.inicio },
  { path: "/poa", label: "POA", icon: Layers, roles: moduleRoles.poa },
  { path: "/cedula-mef", label: "Cedula MEF", icon: FileSpreadsheet, roles: moduleRoles.cedulaMef },
  { path: "/certificaciones", label: "Certificaciones", icon: CreditCard, roles: moduleRoles.certificaciones },
  { path: "/modificaciones-poa", label: "Modificaciones POA", icon: GitBranch, roles: moduleRoles.modificacionesPoa },
  { path: "/liquidaciones", label: "Liquidaciones", icon: DollarSign, roles: moduleRoles.liquidaciones },
  { path: "/anulaciones", label: "Anulaciones", icon: Ban, roles: moduleRoles.anulaciones },
  { path: "/reportes", label: "Reportes", icon: BarChart2, roles: moduleRoles.reportes },
  { path: "/usuarios", label: "Usuarios", icon: Users, roles: moduleRoles.usuarios },
];

export function AppLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg">
        <p className="text-slate-500">Cargando...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-app-bg">
      {/* Sidebar */}
      <aside className="w-60 bg-primary flex flex-col flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        {/* Logo area */}
        <div className="px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold text-xs">POA</span>
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-tight">Sistema POA/PAI</p>
              <p className="text-white/60 text-xs">Universidad Estatal de Bolivar</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2">
          {navItems.filter((item) => hasRole(user.rol, item.roles)).map(({ path, label, icon: Icon }) => {
            const isActive = path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">
                {(user.nombre || "U").charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.nombre}</p>
              <p className="text-white/60 text-xs">{user.rol}</p>
            </div>
          </div>
          <Button
            size="sm"
            className="w-full justify-start bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
            onPress={logout}
          >
            <LogOut size={15} />
            Cerrar sesion
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
