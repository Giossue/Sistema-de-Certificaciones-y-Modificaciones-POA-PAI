import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/use-auth";
import { PageHeader } from "@/components/saas-layout";
import { Loader } from "lucide-react";
import { getAuthToken } from "@/services/auth-headers";
import { DashboardActionsCard } from "./components/dashboard-actions-card";
import { FiscalSummaryCard } from "./components/fiscal-summary-card";
import { PendingWorkSection } from "./components/pending-work-section";
import { SaldosAlertasSection } from "./components/saldos-alertas-section";
import {
  cargarDatosPeriodoDashboard,
  cargarPeriodosDashboard,
} from "./services/dashboard-api";
import type { Certificacion, PeriodoFiscal, SaldosResumen } from "./types";
import {
  actionsFor,
  fiscalStatsFor,
  pendingStatesFor,
  roleDescription,
  roleTitle,
} from "./utils/dashboard-helpers";

export function DashboardPage() {
  const { user } = useAuth();
  const [periodo, setPeriodo] = useState<PeriodoFiscal | null>(null);
  const [resumen, setResumen] = useState<SaldosResumen | null>(null);
  const [certificaciones, setCertificaciones] = useState<Certificacion[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const cargar = async () => {
      const token = getAuthToken();
      if (!token) return;
      setLoading(true);
      try {
        const periodos = await cargarPeriodosDashboard();
        const current = periodos.find((p) => p.activo) || periodos[0] || null;
        setPeriodo(current);
        if (current) {
          const data = await cargarDatosPeriodoDashboard(current.id);
          setResumen(data.resumen);
          setCertificaciones(data.certificaciones);
        }
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);
  const userRole = user?.rol || "unidad";
  const pendientes = useMemo(() => {
    const relevantes = pendingStatesFor(userRole);
    return certificaciones
      .filter((cert) => relevantes.includes(cert.estado))
      .slice(0, 8);
  }, [certificaciones, userRole]);
  const fiscalStats = useMemo(() => fiscalStatsFor(resumen), [resumen]);
  const actions = actionsFor(userRole);
  return (
    <div className="p-4 md:p-6">
      <PageHeader
        title={roleTitle[userRole] || "Inicio"}
        description={
          periodo
            ? `${roleDescription[userRole] || "Resumen operativo"} · ${periodo.nombre} (${periodo.anio})`
            : roleDescription[userRole]
        }
        actions={
          loading && (
            <div className="flex items-center gap-2">
              <Loader size={16} className="animate-spin" /> Cargando
            </div>
          )
        }
      />
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <PendingWorkSection userRole={userRole} pendientes={pendientes} />
          <SaldosAlertasSection resumen={resumen} />
        </div>
        <aside className="space-y-5">
          <FiscalSummaryCard fiscalStats={fiscalStats} />
          <DashboardActionsCard actions={actions} />
        </aside>
      </div>
    </div>
  );
}
