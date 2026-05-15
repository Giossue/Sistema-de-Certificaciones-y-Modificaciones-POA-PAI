import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { AppLayout } from "./layouts/app-layout";
import { LoginPage } from "./features/auth/login-page";
import { DashboardPage } from "./features/dashboard/dashboard-page";
import { TramitesPage } from "./features/tramites/tramites-page";
import { CedulaMefPage } from "./features/cedula-mef/cedula-mef-page";
import { NuevaCertificacionPage } from "./features/certificacion/nueva-certificacion-page";
import { PoaPage } from "./features/poa/poa-page";
import { ModificacionesPoaPage } from "./features/modificaciones-poa/modificaciones-poa-page";
import { LiquidacionesPage } from "./features/liquidaciones/liquidaciones-page";
import { AnulacionesPage } from "./features/anulaciones/anulaciones-page";
import { ReportesPage } from "./features/reportes/reportes-page";
import { UsuariosPage } from "./features/usuarios/usuarios-page";
import { RequireRole } from "./features/auth/require-role";
import { moduleRoles } from "./features/auth/role-access";
import { clearAuthSession } from "./services/api-client";

function AuthExpiredListener() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthExpired = () => {
      clearAuthSession();
      if (location.pathname !== "/login") {
        navigate("/login", { replace: true });
      }
    };

    window.addEventListener("auth:expired", handleAuthExpired);
    return () => window.removeEventListener("auth:expired", handleAuthExpired);
  }, [location.pathname, navigate]);

  return null;
}

function App() {
  return (
    <>
      <AuthExpiredListener />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="tramites" element={<RequireRole allowedRoles={moduleRoles.tramites}><TramitesPage /></RequireRole>} />
          <Route path="poa" element={<RequireRole allowedRoles={moduleRoles.poa}><PoaPage /></RequireRole>} />
          <Route path="cedula-mef" element={<RequireRole allowedRoles={moduleRoles.cedulaMef}><CedulaMefPage /></RequireRole>} />
          <Route path="certificaciones" element={<RequireRole allowedRoles={moduleRoles.certificaciones}><NuevaCertificacionPage /></RequireRole>} />
          <Route path="modificaciones-poa" element={<RequireRole allowedRoles={moduleRoles.modificacionesPoa}><ModificacionesPoaPage /></RequireRole>} />
          <Route path="liquidaciones" element={<RequireRole allowedRoles={moduleRoles.liquidaciones}><LiquidacionesPage /></RequireRole>} />
          <Route path="anulaciones" element={<RequireRole allowedRoles={moduleRoles.anulaciones}><AnulacionesPage /></RequireRole>} />
          <Route path="reportes" element={<RequireRole allowedRoles={moduleRoles.reportes}><ReportesPage /></RequireRole>} />
          <Route path="usuarios" element={<RequireRole allowedRoles={moduleRoles.usuarios}><UsuariosPage /></RequireRole>} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
