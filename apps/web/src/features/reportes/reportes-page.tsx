import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { Download, Loader } from "lucide-react";
import { useAuth } from "@/features/auth/use-auth";
import {
  EmptyState,
  InlineMessage,
  PageHeader,
  SectionCard,
} from "@/components/saas-layout";
import { AppTable } from "@/components/app-ui";
import { ApiError, api } from "@/services/api-client";

interface PeriodoFiscal {
  id: string;
  anio: number;
  nombre: string;
  activo: boolean;
}
const money = (value: string | number) =>
  Number(value).toLocaleString("es-EC", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const devolucionesColumns = [
  { key: "tipo", label: "Tipo", width: "160px" },
  { key: "concepto", label: "Concepto", width: "360px" },
  { key: "total", label: "Total", align: "center" as const, width: "100px" },
];
type ApiData<T> = { data?: T; error?: string };

export function ReportesPage() {
  const { user } = useAuth();
  const [periodos, setPeriodos] = useState<PeriodoFiscal[]>([]);
  const [periodoFiscalId, setPeriodoFiscalId] = useState("");
  const [reporte, setReporte] = useState<any>(null);
  const [causas, setCausas] = useState<string[]>([]);
  const [causa, setCausa] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("poa_token");
  const canRegistrarDevolucion = ["admin", "director", "financiero"].includes(
    user?.rol || "",
  );
  const cargarReporte = async (periodoId = periodoFiscalId) => {
    if (!token || !periodoId) return;
    setLoading(true);
    try {
      const data = await api.get<ApiData<any>>(
        `/api/v1/reportes/direccion/${periodoId}`,
      );
      setReporte(data.data);
    } catch (error) {
      if (error instanceof ApiError) setMessage(error.message);
      else throw error;
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const cargar = async () => {
      if (!token) return;
      const [lista, causasData] = await Promise.all([
        api.get<PeriodoFiscal[]>("/api/v1/periodos-fiscales"),
        api
          .get<ApiData<string[]>>("/api/v1/devoluciones-financiero/causas")
          .catch((error) => {
            if (error instanceof ApiError) return null;
            throw error;
          }),
      ]);
      setPeriodos(lista || []);
      const activo = (lista || []).find((p) => p.activo) || lista?.[0];
      if (activo) {
        setPeriodoFiscalId(activo.id);
        cargarReporte(activo.id);
      }
      if (causasData) setCausas(causasData.data || []);
    };
    cargar();
  }, []);
  const registrarDevolucion = async () => {
    if (!token) return;
    try {
      await api.post("/api/v1/devoluciones-financiero", {
        causa,
        descripcion,
      });
      setMessage("Devolución registrada");
      setDescripcion("");
      await cargarReporte();
    } catch (error) {
      if (error instanceof ApiError) {
        const data = error.data as ApiData<unknown> | undefined;
        setMessage(data?.error || error.message || "No se pudo registrar");
        return;
      }
      throw error;
    }
  };
  const exportar = async (formato: "xlsx" | "pdf") => {
    if (!periodoFiscalId || !token) return;
    try {
      await api.download(
        `/api/v1/reportes/direccion/${periodoFiscalId}/export.${formato}`,
        `reporte-direccion.${formato}`,
      );
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
      setMessage("No se pudo exportar el reporte");
    }
  };
  return (
    <div className="p-6">
      <PageHeader
        title="Reportes Dirección"
        description="Indicadores operativos, devoluciones y saldos bajos"
        actions={
          <div className="flex gap-2">
            <select
              value={periodoFiscalId}
              onChange={(e) => {
                setPeriodoFiscalId(e.target.value);
                cargarReporte(e.target.value);
              }}
              className="app-field-input"
            >
              {periodos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} ({p.anio})
                </option>
              ))}
            </select>
            <Button onPress={() => exportar("xlsx")} variant="outline">
              <Download size={16} /> XLSX
            </Button>
            <Button onPress={() => exportar("pdf")} variant="outline">
              <Download size={16} /> PDF
            </Button>
          </div>
        }
      />
      {message && <InlineMessage>{message}</InlineMessage>}
      {loading ? (
        <div className="p-10 text-center">
          <Loader size={20} className="animate-spin mx-auto mb-2" /> Cargando
          reporte
        </div>
      ) : (
        reporte && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="app-metric-card">
                <p className="">Saldo disponible</p>
                <p className="">${money(reporte.saldos.saldoDisponible)}</p>
              </div>
              <div className="app-metric-card">
                <p className="">Certificado</p>
                <p className="">${money(reporte.saldos.certificadoVigente)}</p>
              </div>
              <div className="app-metric-card">
                <p className="">Saldos bajos</p>
                <p className="">
                  {reporte.saldos.actividadesBajo30 +
                    reporte.saldos.actividadesBajo10}
                </p>
              </div>
              <div className="app-metric-card">
                <p className="">Devoluciones</p>
                <p className="">{reporte.devoluciones.total}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="app-metric-card">
                <p className="">Certificaciones</p>
                <p className="">{reporte.certificaciones?.total || 0}</p>
              </div>
              <div className="app-metric-card">
                <p className="">Modificaciones</p>
                <p className="">{reporte.modificaciones?.total || 0}</p>
              </div>
              <div className="app-metric-card">
                <p className="">Promedio suscripción</p>
                <p className="">
                  {reporte.certificaciones?.promedioSuscripcionHoras || 0} h
                </p>
              </div>
            </div>
            <div
              className={`grid grid-cols-1 ${canRegistrarDevolucion ? "xl:grid-cols-[1fr_380px]" : ""} gap-6`}
            >
              <SectionCard
                title="Causas y clasificación"
                contentClassName="p-0"
              >
                {reporte.devoluciones.causas.length === 0 &&
                (reporte.devoluciones.clasificaciones || []).length === 0 ? (
                  <EmptyState title="Sin devoluciones registradas" />
                ) : (
                  <AppTable
                    columns={devolucionesColumns}
                    minWidth={620}
                    clientPagination
                  >
                    {reporte.devoluciones.causas.map((item: any) => (
                      <tr key={`causa-${item.causa}`}>
                        <td>
                          <p className="app-table-secondary">Causa</p>
                        </td>
                        <td>
                          <p className="app-table-primary">{item.causa}</p>
                        </td>
                        <td className="text-center">{item.total}</td>
                      </tr>
                    ))}
                    {(reporte.devoluciones.clasificaciones || []).map(
                      (item: any) => (
                        <tr key={`clasificacion-${item.clasificacion}`}>
                          <td>
                            <p className="app-table-secondary">Clasificación</p>
                          </td>
                          <td>
                            <p className="app-table-primary">
                              {item.clasificacion || "Sin clasificación"}
                            </p>
                          </td>
                          <td className="text-center">{item.total}</td>
                        </tr>
                      ),
                    )}
                  </AppTable>
                )}
              </SectionCard>
              {canRegistrarDevolucion && (
                <SectionCard title="Registrar devolución">
                  <div className="space-y-3">
                    <select
                      value={causa}
                      onChange={(e) => setCausa(e.target.value)}
                      className="app-field-input"
                    >
                      <option value="">Seleccione causa</option>
                      {causas.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <textarea
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Descripción"
                      className="app-field-input min-h-28"
                    />
                    <Button
                      onPress={registrarDevolucion}
                      isDisabled={!causa || !descripcion}
                      className="app-button app-button-primary w-full"
                    >
                      Registrar
                    </Button>
                  </div>
                </SectionCard>
              )}
            </div>
          </>
        )
      )}
    </div>
  );
}
