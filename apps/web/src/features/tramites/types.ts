export type TramiteKind =
  | "certificacion"
  | "modificacion"
  | "liquidacion"
  | "anulacion"
  | "devolucion";

export type SortKey = "numero" | "titulo" | "unidad" | "fecha" | "monto" | "estado";

export type SortDirection = "asc" | "desc";

export interface Tramite {
  id: string;
  kind: TramiteKind;
  numero: string;
  estado: string;
  titulo: string;
  detalle: string;
  unidad?: string;
  monto?: number;
  createdAt?: string;
  raw: any;
}

export interface TramitesMessage {
  type: "ok" | "error";
  text: string;
}
