import { Outlet, useNavigate } from "react-router-dom";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, Link } from "@heroui/react";
import { useAuth } from "@/features/auth/use-auth";

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar className="bg-white border-b border-slate-200">
        <NavbarBrand>
          <Link href="/" className="font-bold text-lg text-[#0033a0]">
            Sistema POA/PAI
          </Link>
        </NavbarBrand>
        <NavbarContent justify="end">
          <NavbarItem className="text-sm text-slate-600">
            {user.nombre} · {user.rol}
          </NavbarItem>
          <NavbarItem>
            <Button size="sm" variant="light" onPress={logout}>
              Cerrar sesión
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      <main className="max-w-6xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
