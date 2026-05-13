export interface ActividadPoa {
  id: string;
  programaCodigo: string;
  programaNombre: string;
  actividadCodigo: string;
  actividadNombre: string;
  itemCodigo: string;
  itemNombre: string;
  fuenteCodigo: string;
  fuenteNombre: string;
  montoPlanificado: number;
  saldoDisponible: number;
  certificadoVigente?: number;
  bloqueadoSolicitudes?: number;
  porcentajeDisponible?: number;
  estado?: "ok" | "bajo" | "critico" | "agotado";
}

export interface PoaInfo {
  id: string;
  numeroVersion: number;
  totalActividades: number;
  montoTotal: number;
  actividadesConSaldo: number;
}

export interface PeriodoFiscal {
  id: string;
  anio: number;
  nombre: string;
  activo: boolean;
}

export type Filtro = {
  texto: string;
  programa: string;
  actividad: string;
  item: string;
  fuente: string;
  verSoloConSaldo: boolean;
};

export type FilterOption = { codigo: string; nombre: string };

export interface CatalogosPoa {
  programas: FilterOption[];
  actividades: FilterOption[];
  items: FilterOption[];
  fuentes: FilterOption[];
}

export type SortKey =
  | "programa"
  | "actividad"
  | "item"
  | "fuente"
  | "planificado"
  | "certificado"
  | "bloqueado"
  | "saldo"
  | "estado";

export type SortDirection = "asc" | "desc";

export interface PoaImportResult {
  totalActividades?: number;
  [key: string]: unknown;
}
