import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/use-auth";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  FileSpreadsheet,
  Gauge,
  Loader,
  TrendingDown,
  Users,
} from "lucide-react";

interface PeriodoFiscal {
  id: string;
  anio: number;
  nombre: string;
  activo: boolean;
}

interface SaldoAlerta {
  actividadId: string;
  programaCodigo: string;
  actividadCodigo: string;
  itemCodigo: string;
  itemNombre: string;
  fuenteCodigo: string;
  saldoDisponible: string;
  montoPlanificado: string;
  porcentajeDisponible: number;
  estado: "ok" | "bajo" | "critico" | "agotado";
}

interface SaldosResumen {
  totalActividades: number;
  actividadesConSaldo: number;
  actividadesBajo30: number;
  actividadesBajo10: number;
  montoPlanificado: string;
  saldoDisponible: string;
  certificadoVigente: string;
  bloqueadoSolicitudes: string;
  alertas: SaldoAlerta[];
}

interface Certificacion {
  id: string;
  numero: string | null;
  estado: string;
  monto: number;
  createdAt: string;
  actividad?: {
    itemCodigo: string;
    itemNombre: string;
  } | null;
}

const money = (value: string | number) =>
  Number(value).toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const estadoLabel: Record<string, string> = {
  solicitada: "Solicitada",
  observada: "Observada",
  generada: "Generada",
  suscrita: "Suscrita",
  en_uso: "En uso",
};

export function DashboardPage() {
  const { user } = useAuth();
  const [periodo, setPeriodo] = useState<PeriodoFiscal | null>(null);
  const [resumen, setResumen] = useState<SaldosResumen | null>(null);
  const [certificaciones, setCertificaciones] = useState<Certificacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const token = localStorage.getItem("poa_token");
      if (!token) return;
      setLoading(true);
      try {
        const periodosRes = await fetch("/api/v1/periodos-fiscales", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const periodosData = await periodosRes.json();
        const periodos: PeriodoFiscal[] = periodosData || [];
        const current = periodos.find((p) => p.activo) || periodos[0] || null;
        setPeriodo(current);

        if (current) {
          const [saldosRes, certsRes] = await Promise.all([
            fetch(`/api/v1/saldos/${current.id}/resumen`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch("/api/v1/certificaciones", { headers: { Authorization: `Bearer ${token}` } }),
          ]);
          const saldosData = await saldosRes.json();
          const certsData = await certsRes.json();
          if (saldosRes.ok) setResumen(saldosData.data);
          if (certsRes.ok) setCertificaciones(certsData.data || []);
        }
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  const stats = useMemo(() => {
    const pendientes = certificaciones.filter((c) => ["solicitada", "observada", "generada"].includes(c.estado)).length;
    const suscritas = certificaciones.filter((c) => c.estado === "suscrita" || c.estado === "en_uso").length;

    return [
      {
        label: "Pendientes",
        value: pendientes.toLocaleString(),
        detail: "Certificaciones abiertas",
        icon: Clock,
        color: "text-amber-700",
        bg: "bg-amber-50",
      },
      {
        label: "Suscritas",
        value: suscritas.toLocaleString(),
        detail: "Con saldo descontado",
        icon: CheckCircle,
        color: "text-green-700",
        bg: "bg-green-50",
      },
      {
        label: "Saldo disponible",
        value: resumen ? `$${money(resumen.saldoDisponible)}` : "-",
        detail: resumen ? `${resumen.actividadesConSaldo} actividades con saldo` : "Sin periodo activo",
        icon: DollarSign,
        color: "text-primary",
        bg: "bg-blue-50",
      },
      {
        label: "Saldos bajos",
        value: resumen ? (resumen.actividadesBajo30 + resumen.actividadesBajo10).toLocaleString() : "-",
        detail: "Menor al 30%",
        icon: TrendingDown,
        color: "text-red-700",
        bg: "bg-red-50",
      },
    ];
  }, [certificaciones, resumen]);

  const acciones = [
    {
      label: "Nueva certificacion",
      description: "Solicitar POA/PAI",
      icon: CreditCard,
      href: "/certificaciones",
      show: true,
    },
    {
      label: "Consultar saldos",
      description: "Revisar POA vigente",
      icon: Gauge,
      href: "/poa",
      show: true,
    },
    {
      label: "Importar cedula MEF",
      description: "Actualizar version vigente",
      icon: FileSpreadsheet,
      href: "/cedula-mef",
      show: user?.rol !== "unidad",
    },
    {
      label: "Usuarios",
      description: "Gestion institucional",
      icon: Users,
      href: "/usuarios",
      show: user?.rol === "admin",
    },
  ].filter((a) => a.show);

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Panel de unidad</h1>
          <p className="text-sm text-slate-500 mt-1">
            {periodo ? `${periodo.nombre} (${periodo.anio})` : "Periodo fiscal activo"}
          </p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader size={16} className="animate-spin" />
            Cargando indicadores
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, detail, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white shadow-sm p-4 flex items-center gap-4">
            <div className={`${bg} p-3`}>
              <Icon size={22} className={color} />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-semibold text-slate-800 truncate">{value}</p>
              <p className="text-xs font-medium text-slate-600">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{detail}</p>
            </div>
          </div>
        ))}
      </div>

      {resumen && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white shadow-sm p-4">
            <p className="text-xs text-slate-500 uppercase">Planificado</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">${money(resumen.montoPlanificado)}</p>
            <p className="text-xs text-slate-500 mt-2">{resumen.totalActividades.toLocaleString()} actividades vigentes</p>
          </div>
          <div className="bg-white shadow-sm p-4">
            <p className="text-xs text-slate-500 uppercase">Certificado vigente</p>
            <p className="text-2xl font-bold text-green-700 mt-1">${money(resumen.certificadoVigente)}</p>
            <p className="text-xs text-slate-500 mt-2">Saldo ya comprometido por certificaciones suscritas</p>
          </div>
          <div className="bg-white shadow-sm p-4">
            <p className="text-xs text-slate-500 uppercase">Bloqueado en tramite</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">${money(resumen.bloqueadoSolicitudes)}</p>
            <p className="text-xs text-slate-500 mt-2">Solicitudes pendientes de cierre</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <div className="bg-white shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-700">Alertas de saldo</h2>
            <Link to="/poa" className="text-xs text-primary font-medium flex items-center gap-1">
              Ver POA <ArrowRight size={14} />
            </Link>
          </div>
          {!resumen || resumen.alertas.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">
              <CheckCircle size={20} className="mx-auto mb-2" />
              Sin saldos bajos
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {resumen.alertas.map((alerta) => (
                <div key={alerta.actividadId} className="p-4 flex items-center gap-3">
                  <div className={alerta.estado === "bajo" ? "bg-amber-50 p-2" : "bg-red-50 p-2"}>
                    <AlertTriangle size={18} className={alerta.estado === "bajo" ? "text-amber-700" : "text-red-700"} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {alerta.itemCodigo} - {alerta.itemNombre}
                    </p>
                    <p className="text-xs text-slate-500">
                      {alerta.programaCodigo}/{alerta.actividadCodigo}/{alerta.fuenteCodigo}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-800">${money(alerta.saldoDisponible)}</p>
                    <p className="text-xs text-slate-400">{alerta.porcentajeDisponible.toFixed(2)}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white shadow-sm">
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-700">Acciones rapidas</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {acciones.map(({ label, description, icon: Icon, href }) => (
                <Link key={href} to={href} className="p-4 flex items-center gap-3 hover:bg-slate-50">
                  <div className="bg-slate-50 p-2.5">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{label}</p>
                    <p className="text-xs text-slate-500">{description}</p>
                  </div>
                  <ArrowRight size={16} className="text-slate-400" />
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white shadow-sm">
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-700">Certificaciones recientes</h2>
            </div>
            {certificaciones.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">Sin certificaciones registradas</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {certificaciones.slice(0, 5).map((cert) => (
                  <Link key={cert.id} to="/certificaciones" className="p-4 block hover:bg-slate-50">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-800 truncate">{cert.numero || "Sin numero"}</p>
                      <span className="text-xs text-slate-500">{estadoLabel[cert.estado] || cert.estado}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-1">
                      {cert.actividad?.itemCodigo} {cert.actividad?.itemNombre}
                    </p>
                    <p className="text-xs font-semibold text-slate-700 mt-1">${money(cert.monto)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
