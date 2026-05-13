import { CheckCircle, RotateCcw, Send } from "lucide-react";
import type { Tramite, TramiteKind } from "../types";

export const money = (value?: number) =>
  value === undefined
    ? "-"
    : `$${Number(value).toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const kindLabel: Record<TramiteKind, string> = {
  certificacion: "Certificación",
  modificacion: "Modificación POA",
  liquidacion: "Liquidación",
  anulacion: "Anulación",
  devolucion: "Devolución financiero",
};

export const estadoLabels: Record<string, string> = {
  todos: "Todos los estados",
  solicitada: "Por revisar",
  observada: "Observadas",
  aprobada: "Aprobación",
  devuelta_financiero: "Devueltas",
  generada: "Generadas",
  suscrita: "Suscritas",
  aplicada: "Aplicadas",
  en_uso: "En uso",
  liquidada_a: "Liquidadas A",
  liquidada_b: "Liquidadas B",
  anulada: "Anuladas",
  rechazada: "Rechazadas",
  pendiente: "Pendientes",
  reenviada: "Reenviadas",
};

export const preferredFilterOrder = [
  { value: "todos", label: "Todos" },
  { value: "solicitada", label: estadoLabels.solicitada },
  { value: "observada", label: estadoLabels.observada },
  { value: "aprobada", label: estadoLabels.aprobada },
  { value: "devuelta_financiero", label: estadoLabels.devuelta_financiero },
  { value: "generada", label: estadoLabels.generada },
  { value: "suscrita", label: estadoLabels.suscrita },
  { value: "aplicada", label: estadoLabels.aplicada },
  { value: "liquidada_a", label: estadoLabels.liquidada_a },
  { value: "anulada", label: estadoLabels.anulada },
  { value: "pendiente", label: estadoLabels.pendiente },
  { value: "reenviada", label: estadoLabels.reenviada },
];

export const bandejaColumns = [
  { key: "numero", label: "Trámite", sortable: true },
  { key: "titulo", label: "Detalle", sortable: true },
  { key: "unidad", label: "Unidad", sortable: true },
  { key: "fecha", label: "Fecha", sortable: true },
  { key: "monto", label: "Monto", sortable: true },
  { key: "estado", label: "Estado", sortable: true },
  { key: "acciones", label: "Acciones" },
];

export function quickActions(item: Tramite, rol: string) {
  const director = ["admin", "director"].includes(rol);
  const analista = ["admin", "analista"].includes(rol);
  const financiero = ["admin", "financiero"].includes(rol);
  const unidad = ["admin", "unidad"].includes(rol);
  if (item.kind === "certificacion") {
    if (item.estado === "solicitada" && analista)
      return [
        { key: "aprobar", label: "Aprobar", icon: <CheckCircle size={14} /> },
      ];
    if (item.estado === "generada" && director)
      return [
        {
          key: "suscribir",
          label: "Suscribir",
          icon: <CheckCircle size={14} />,
        },
      ];
    if (item.estado === "suscrita" && financiero)
      return [
        { key: "marcar-uso", label: "Uso", icon: <CheckCircle size={14} /> },
      ];
    if (item.estado === "devuelta_financiero" && unidad)
      return [{ key: "reenviar", label: "Reenviar", icon: <Send size={14} /> }];
  }
  if (item.kind === "modificacion") {
    if (["solicitada", "observada"].includes(item.estado) && director)
      return [
        {
          key: "suscribir",
          label: "Suscribir",
          icon: <CheckCircle size={14} />,
        },
      ];
    if (item.estado === "suscrita" && analista)
      return [
        { key: "aprobar", label: "Aprobar", icon: <CheckCircle size={14} /> },
      ];
    if (item.estado === "aprobada" && analista)
      return [
        { key: "aplicar", label: "Aplicar", icon: <RotateCcw size={14} /> },
      ];
  }
  if (item.kind === "liquidacion" && item.estado === "solicitada" && director)
    return [
      { key: "aprobar", label: "Aprobar", icon: <CheckCircle size={14} /> },
    ];
  if (item.kind === "anulacion" && item.estado === "solicitada" && director)
    return [
      { key: "aprobar", label: "Aprobar", icon: <CheckCircle size={14} /> },
    ];
  return [];
}

export function actionUrl(item: Tramite, action: string) {
  if (item.kind === "certificacion")
    return `/api/v1/certificaciones/${item.id}/${action}`;
  if (item.kind === "modificacion")
    return `/api/v1/modificaciones-poa/${item.id}/${action}`;
  if (item.kind === "liquidacion")
    return `/api/v1/liquidaciones/${item.id}/${action}`;
  if (item.kind === "anulacion")
    return `/api/v1/anulaciones/${item.id}/${action}`;
  if (item.kind === "devolucion")
    return `/api/v1/devoluciones-financiero/${item.id}/${action}`;
  return "";
}

export function timelineFor(item: Tramite) {
  const states =
    item.kind === "modificacion"
      ? ["solicitada", "suscrita", "aprobada", "aplicada"]
      : item.kind === "liquidacion" || item.kind === "anulacion"
        ? ["solicitada", "aprobada"]
        : ["solicitada", "generada", "suscrita", "en_uso"];
  const index = states.indexOf(item.estado);
  return states.map((state, position) => ({
    key: state,
    label: state.replace(/_/g, ""),
    done: index >= 0 && position < index,
    current: state === item.estado,
  }));
}

export function formatDate(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("es-EC", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function formatTime(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("es-EC", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
