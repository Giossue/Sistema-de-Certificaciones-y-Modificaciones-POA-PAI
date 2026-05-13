import { useEffect } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@heroui/react";
import { useAuth } from "@/features/auth/use-auth";
import { hasRole, moduleRoles } from "@/features/auth/role-access";
import {
  LayoutDashboard,
  Inbox,
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

const navGroups = [
  {
    key: "principal",
    label: "Principal",
    items: [
      { path: "/", label: "Inicio", icon: LayoutDashboard, roles: moduleRoles.inicio },
      { path: "/tramites", label: "Bandeja de Trámites", icon: Inbox, roles: moduleRoles.tramites },
    ],
  },
  {
    key: "planificacion",
    label: "Planificación",
    items: [
      { path: "/poa", label: "POA", icon: Layers, roles: moduleRoles.poa },
      { path: "/cedula-mef", label: "Cédula MEF", icon: FileSpreadsheet, roles: moduleRoles.cedulaMef },
      { path: "/modificaciones-poa", label: "Modificaciones POA", icon: GitBranch, roles: moduleRoles.modificacionesPoa },
    ],
  },
  {
    key: "ejecucion",
    label: "Ejecución",
    items: [
      { path: "/certificaciones", label: "Certificaciones", icon: CreditCard, roles: moduleRoles.certificaciones },
      { path: "/liquidaciones", label: "Liquidaciones", icon: DollarSign, roles: moduleRoles.liquidaciones },
      { path: "/anulaciones", label: "Anulaciones", icon: Ban, roles: moduleRoles.anulaciones },
    ],
  },
  {
    key: "gestion",
    label: "Gestión",
    items: [
      { path: "/reportes", label: "Reportes", icon: BarChart2, roles: moduleRoles.reportes },
      { path: "/usuarios", label: "Usuarios", icon: Users, roles: moduleRoles.usuarios },
    ],
  },
];

const navItems = navGroups.flatMap((group) => group.items);

function isPathActive(currentPath: string, path: string) {
  return path === "/" ? currentPath === "/" : currentPath.startsWith(path);
}

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
    <div className="flex min-h-screen min-w-0 flex-col bg-app-bg md:flex-row">
      {/* Sidebar */}
      <aside className="app-sidebar sticky top-0 z-20 flex h-auto w-full flex-shrink-0 flex-col overflow-hidden bg-primary md:h-screen md:w-60 md:overflow-y-auto">
        {/* Logo area */}
        <div className="px-4 py-4 border-b border-white/10 md:py-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold text-xs">POA</span>
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-tight">Sistema POA/PAI</p>
              <p className="text-white/60 text-xs">Universidad Estatal de Bolívar</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex gap-1 overflow-x-auto px-2 py-2 md:hidden">
          {navItems.filter((item) => hasRole(user.rol, item.roles)).map(({ path, label, icon: Icon }) => {
            const isActive = isPathActive(location.pathname, path);
            return (
              <Link
                key={path}
                to={path}
                className={`flex shrink-0 items-center gap-2 px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span className="whitespace-nowrap">{label}</span>
              </Link>
            );
          })}
        </nav>
        <nav className="hidden flex-1 overflow-y-auto px-2 py-3 md:block">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter((item) => hasRole(user.rol, item.roles));
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.key} className="mb-2">
                <p className="px-3 py-2 text-[11px] font-semibold uppercase text-white/45">{group.label}</p>
                <div className="space-y-1">
                  {visibleItems.map(({ path, label, icon: Icon }) => {
                    const isActive = isPathActive(location.pathname, path);
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
                        <Icon size={17} />
                        <span className="min-w-0 truncate">{label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className="hidden px-3 py-4 border-t border-white/10 md:block">
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
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
