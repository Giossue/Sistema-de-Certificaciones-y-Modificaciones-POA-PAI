import { Button } from "@heroui/react";
import {
  ActionBarPorRol,
  ComparacionAntesDespues,
  DetalleTramitePanel,
  DocumentoList,
  EstadoBadge,
  TramiteTimeline,
} from "@/components/tramites";
import type { Tramite } from "../types";
import {
  formatDate,
  kindLabel,
  money,
  quickActions,
  timelineFor,
} from "../utils/tramites-helpers";

export function TramiteDetail({
  selected,
  userRole,
  onClose,
  postAction,
}: {
  selected: Tramite;
  userRole: string;
  onClose: () => void;
  postAction: (item: Tramite, action: string) => void;
}) {
  return (
    <DetalleTramitePanel
      title={selected.numero}
      subtitle={`${kindLabel[selected.kind]} · ${selected.titulo}`}
      onClose={onClose}
    >
      <div className="flex items-center justify-between gap-3">
        <EstadoBadge estado={selected.estado} />
        <span className="">{formatDate(selected.createdAt)}</span>
      </div>
      <TramiteTimeline steps={timelineFor(selected)} />
      <DetalleContenido item={selected} />
      <ActionBarPorRol align="center">
        {quickActions(selected, userRole).map((action) => (
          <Button
            key={action.key}
            size="sm"
            className="app-button app-button-primary"
            onPress={() => postAction(selected, action.key)}
          >
            {action.label}
          </Button>
        ))}
      </ActionBarPorRol>
    </DetalleTramitePanel>
  );
}

function DetalleContenido({ item }: { item: Tramite }) {
  if (item.kind === "modificacion") {
    const before = item.raw.anterior || {};
    const after = item.raw.nuevo || {};
    return (
      <ComparacionAntesDespues
        before={[
          {
            label: "Estructura",
            value: `${before.programaCodigo}/${before.actividadCodigo}/${before.itemCodigo}/${before.fuenteCodigo}`,
          },
          { label: "Responsable", value: before.responsableNombre || "-" },
          { label: "Monto", value: money(before.montoPlanificado) },
        ]}
        after={[
          {
            label: "Estructura",
            value: `${after.programaCodigo}/${after.actividadCodigo}/${after.itemCodigo}/${after.fuenteCodigo}`,
          },
          { label: "Responsable", value: after.responsableNombre || "-" },
          { label: "Monto", value: money(after.montoPlanificado) },
        ]}
      />
    );
  }
  if (item.kind === "certificacion") {
    return <DocumentoList documentos={item.raw.documentos || []} />;
  }
  return (
    <div className="app-detail-box p-3">
      <p className="">Detalle</p>
      <p className="mt-2">{item.detalle || "Sin detalle adicional"}</p>
    </div>
  );
}
