import { CheckCircle, FileText } from "lucide-react";
import { AppButton, AppTable } from "@/components/app-ui";
import { EstadoBadge } from "@/components/tramites";
import { EmptyState, SectionCard } from "@/components/saas-layout";
import type { Modificacion, ModificacionAccion } from "../types";
import { money } from "./money";

const modificacionesColumns = [
  { key: "numero", label: "Trámite", width: "160px" },
  { key: "motivo", label: "Motivo", width: "160px" },
  { key: "estructura", label: "Cambio POA", width: "300px" },
  { key: "monto", label: "Monto", align: "center" as const, width: "180px" },
  { key: "responsable", label: "Responsable", width: "220px" },
  { key: "estado", label: "Estado", align: "center" as const, width: "120px" },
  {
    key: "acciones",
    label: "Acciones",
    align: "center" as const,
    width: "220px",
  },
];

export function ModificacionesBandeja({
  modificaciones,
  currentPage,
  totalPages,
  totalModificaciones,
  pageSize,
  onPageChange,
  onItemsPerPageChange,
  onDescargarInforme,
  onAccion,
  onEditar,
  accionEnCursoId,
  canResend,
  canEdit,
  canSubscribe,
  canApprove,
  canObserve,
}: {
  modificaciones: Modificacion[];
  currentPage: number;
  totalPages: number;
  totalModificaciones: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (pageSize: number) => void;
  onDescargarInforme: (id: string, numero: string) => void;
  onAccion: (id: string, tipo: ModificacionAccion) => void;
  onEditar: (modificacion: Modificacion) => void;
  accionEnCursoId?: string | null;
  canResend: boolean;
  canEdit: boolean;
  canSubscribe: boolean;
  canApprove: boolean;
  canObserve: boolean;
}) {
  return (
    <SectionCard title="Bandeja" contentClassName="p-0">
      {modificaciones.length === 0 ? (
        <EmptyState title="Sin modificaciones registradas" />
      ) : (
        <AppTable
          columns={modificacionesColumns}
          data={modificaciones}
          getRowKey={(mod) => mod.id}
          minWidth={1360}
          mobileRender={(mod) => (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="app-table-primary font-mono">{mod.numero}</p>
                  <p className="app-table-secondary">{mod.motivo || "Otro"}</p>
                </div>
                <EstadoBadge estado={mod.estado} />
              </div>
              <div className="grid gap-2 text-sm text-slate-600">
                <div>
                  <span className="font-semibold text-slate-700">Cambio POA</span>
                  <p className="font-mono">
                    {mod.anterior.programaCodigo}/{mod.anterior.actividadCodigo}/
                    {mod.anterior.itemCodigo}
                  </p>
                  <p className="font-mono">
                    {"->"} {mod.nuevo.programaCodigo}/{mod.nuevo.actividadCodigo}/
                    {mod.nuevo.itemCodigo}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-semibold text-slate-700">Monto</span>
                    <p>${money(mod.anterior.montoPlanificado)}</p>
                    <p>{"->"} ${money(mod.nuevo.montoPlanificado)}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Responsable</span>
                    <p>{mod.anterior.responsableNombre || "-"}</p>
                    <p>{"->"} {mod.nuevo.responsableNombre || "-"}</p>
                  </div>
                </div>
              </div>
              <ModificacionActions
                mod={mod}
                accionesDeshabilitadas={accionEnCursoId === mod.id}
                onDescargarInforme={onDescargarInforme}
                onAccion={onAccion}
                onEditar={onEditar}
                canResend={canResend}
                canEdit={canEdit}
                canSubscribe={canSubscribe}
                canApprove={canApprove}
                canObserve={canObserve}
              />
            </div>
          )}
          pagination={{
            currentPage,
            totalPages,
            totalItems: totalModificaciones,
            itemsPerPage: pageSize,
            onPageChange,
            onItemsPerPageChange,
          }}
        >
          {modificaciones.map((mod) => (
            <ModificacionRow
              key={mod.id}
              mod={mod}
              accionesDeshabilitadas={accionEnCursoId === mod.id}
              onDescargarInforme={onDescargarInforme}
              onAccion={onAccion}
              onEditar={onEditar}
              canResend={canResend}
              canEdit={canEdit}
              canSubscribe={canSubscribe}
              canApprove={canApprove}
              canObserve={canObserve}
            />
          ))}
        </AppTable>
      )}
    </SectionCard>
  );
}

function ModificacionRow({
  mod,
  accionesDeshabilitadas,
  onDescargarInforme,
  onAccion,
  onEditar,
  canResend,
  canEdit,
  canSubscribe,
  canApprove,
  canObserve,
}: {
  mod: Modificacion;
  accionesDeshabilitadas: boolean;
  onDescargarInforme: (id: string, numero: string) => void;
  onAccion: (id: string, tipo: ModificacionAccion) => void;
  onEditar: (modificacion: Modificacion) => void;
  canResend: boolean;
  canEdit: boolean;
  canSubscribe: boolean;
  canApprove: boolean;
  canObserve: boolean;
}) {
  return (
    <tr>
      <td>
        <p className="app-table-primary font-mono">{mod.numero}</p>
      </td>
      <td>
        <p className="app-table-primary">{mod.motivo || "Otro"}</p>
      </td>
      <td>
        <p className="app-table-primary font-mono">
          {mod.anterior.programaCodigo}/{mod.anterior.actividadCodigo}/
          {mod.anterior.itemCodigo}
        </p>
        <p className="app-table-secondary font-mono">
          {"->"} {mod.nuevo.programaCodigo}/{mod.nuevo.actividadCodigo}/
          {mod.nuevo.itemCodigo}
        </p>
      </td>
      <td className="text-center">
        <p className="app-table-primary">
          ${money(mod.anterior.montoPlanificado)}
        </p>
        <p className="app-table-secondary">
          {"->"} ${money(mod.nuevo.montoPlanificado)}
        </p>
      </td>
      <td>
        <p className="app-table-primary">
          {mod.anterior.responsableNombre || "-"}
        </p>
        <p className="app-table-secondary">
          {"->"} {mod.nuevo.responsableNombre || "-"}
        </p>
      </td>
      <td className="text-center">
        <EstadoBadge estado={mod.estado} />
      </td>
      <td>
        <ModificacionActions
          mod={mod}
          accionesDeshabilitadas={accionesDeshabilitadas}
          onDescargarInforme={onDescargarInforme}
          onAccion={onAccion}
          onEditar={onEditar}
          canResend={canResend}
          canEdit={canEdit}
          canSubscribe={canSubscribe}
          canApprove={canApprove}
          canObserve={canObserve}
        />
      </td>
    </tr>
  );
}

function ModificacionActions({
  mod,
  accionesDeshabilitadas,
  onDescargarInforme,
  onAccion,
  onEditar,
  canResend,
  canEdit,
  canSubscribe,
  canApprove,
  canObserve,
}: {
  mod: Modificacion;
  accionesDeshabilitadas: boolean;
  onDescargarInforme: (id: string, numero: string) => void;
  onAccion: (id: string, tipo: ModificacionAccion) => void;
  onEditar: (modificacion: Modificacion) => void;
  canResend: boolean;
  canEdit: boolean;
  canSubscribe: boolean;
  canApprove: boolean;
  canObserve: boolean;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <AppButton
        type="button"
        size="sm"
        variant="secondary"
        disabled={accionesDeshabilitadas}
        onClick={() => onDescargarInforme(mod.id, mod.numero)}
      >
        <FileText size={14} /> Informe
      </AppButton>
      {mod.estado === "solicitada" && canSubscribe && (
        <AppButton
          type="button"
          size="sm"
          variant="primary"
          disabled={accionesDeshabilitadas}
          onClick={() => onAccion(mod.id, "suscribir")}
        >
          Suscribir
        </AppButton>
      )}
      {mod.estado === "observada" && canEdit && (
        <AppButton
          type="button"
          size="sm"
          variant="secondary"
          disabled={accionesDeshabilitadas}
          onClick={() => onEditar(mod)}
        >
          Editar
        </AppButton>
      )}
      {mod.estado === "observada" && canResend && (
        <AppButton
          type="button"
          size="sm"
          variant="primary"
          disabled={accionesDeshabilitadas}
          onClick={() => onAccion(mod.id, "reenviar")}
        >
          Reenviar
        </AppButton>
      )}
      {mod.estado === "suscrita" && canApprove && (
        <AppButton
          type="button"
          size="sm"
          variant="primary"
          disabled={accionesDeshabilitadas}
          onClick={() => onAccion(mod.id, "aprobar")}
        >
          <CheckCircle size={14} /> Aprobar
        </AppButton>
      )}
      {mod.estado === "aprobada" && canApprove && (
        <AppButton
          type="button"
          size="sm"
          variant="primary"
          disabled={accionesDeshabilitadas}
          onClick={() => onAccion(mod.id, "aplicar")}
        >
          <CheckCircle size={14} /> Aplicar
        </AppButton>
      )}
      {mod.estado === "solicitada" && canObserve && (
        <AppButton
          type="button"
          size="sm"
          variant="secondary"
          disabled={accionesDeshabilitadas}
          onClick={() => onAccion(mod.id, "observar")}
        >
          Observar
        </AppButton>
      )}
    </div>
  );
}
