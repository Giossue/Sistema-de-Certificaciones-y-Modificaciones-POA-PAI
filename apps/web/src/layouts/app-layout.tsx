import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@heroui/react";
import { useAuth } from "@/features/auth/use-auth";
import { hasRole, moduleRoles } from "@/features/auth/role-access";
import {
  LayoutDashboard,
  Inbox,
  FileSpreadsheet,
  ClipboardList,
  FileCheck2,
  GitCompareArrows,
  DollarSign,
  Ban,
  BarChart2,
  Users,
  LogOut,
  MoreHorizontal,
  X,
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
      { path: "/poa", label: "POA", icon: ClipboardList, roles: moduleRoles.poa },
      { path: "/cedula-mef", label: "Cédula MEF", icon: FileSpreadsheet, roles: moduleRoles.cedulaMef },
      { path: "/modificaciones-poa", label: "Modificaciones POA", icon: GitCompareArrows, roles: moduleRoles.modificacionesPoa },
    ],
  },
  {
    key: "ejecucion",
    label: "Ejecución",
    items: [
      { path: "/certificaciones", label: "Certificaciones", icon: FileCheck2, roles: moduleRoles.certificaciones },
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
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    setMobileMoreOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg">
        <p className="text-slate-500">Cargando...</p>
      </div>
    );
  }

  if (!user) return null;

  const visibleNavItems = navItems.filter((item) => hasRole(user.rol, item.roles));
  const mobilePrimaryItems = visibleNavItems.slice(0, 4);

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
      <main className="app-main-content flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>

      <nav className="app-mobile-bottom-nav md:hidden" aria-label="Navegación principal móvil">
        {mobilePrimaryItems.map(({ path, label, icon: Icon }) => {
          const isActive = isPathActive(location.pathname, path);
          return (
            <Link
              key={path}
              to={path}
              className={`app-mobile-bottom-link ${isActive ? "is-active" : ""}`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          className={`app-mobile-bottom-link ${mobileMoreOpen ? "is-active" : ""}`}
          aria-expanded={mobileMoreOpen}
          aria-controls="mobile-more-menu"
          onClick={() => setMobileMoreOpen(true)}
        >
          <MoreHorizontal size={20} />
          <span>Más</span>
        </button>
      </nav>

      {mobileMoreOpen ? (
        <div
          className="app-mobile-more-backdrop md:hidden"
          role="presentation"
          onClick={() => setMobileMoreOpen(false)}
        >
          <aside
            id="mobile-more-menu"
            className="app-mobile-more-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Más opciones de navegación"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="app-mobile-more-header">
              <div>
                <p className="app-mobile-more-title">Más opciones</p>
                <p className="app-mobile-more-subtitle">{user.rol}</p>
              </div>
              <button
                type="button"
                className="app-mobile-more-close"
                aria-label="Cerrar menú"
                onClick={() => setMobileMoreOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <nav className="app-mobile-more-nav" aria-label="Navegación completa">
              {navGroups.map((group) => {
                const visibleItems = group.items.filter((item) => hasRole(user.rol, item.roles));
                if (visibleItems.length === 0) return null;

                return (
                  <div key={group.key} className="app-mobile-more-group">
                    <p className="app-mobile-more-group-title">{group.label}</p>
                    <div className="app-mobile-more-links">
                      {visibleItems.map(({ path, label, icon: Icon }) => {
                        const isActive = isPathActive(location.pathname, path);
                        return (
                          <Link
                            key={path}
                            to={path}
                            className={`app-mobile-more-link ${isActive ? "is-active" : ""}`}
                          >
                            <Icon size={18} />
                            <span>{label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>

            <div className="app-mobile-more-user">
              <div className="app-mobile-more-user-row">
                <div className="app-mobile-more-avatar">
                  {(user.nombre || "U").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="app-mobile-more-user-name">{user.nombre}</p>
                  <p className="app-mobile-more-user-role">{user.rol}</p>
                </div>
              </div>
              <Button
                size="sm"
                className="app-mobile-more-logout"
                onPress={() => {
                  setMobileMoreOpen(false);
                  logout();
                }}
              >
                Cerrar sesión
              </Button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
