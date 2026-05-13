import type { ReactNode } from "react";

export interface ImportResult {
  versionId: string;
  totalFilas: number;
  filasValidas: number;
  filasIgnoradas: number;
  montoTotal: number;
  hashArchivo: string;
}

export interface VersionCedula {
  id: string;
  archivoNombre: string;
  archivoHash: string;
  corteFecha: string;
  vigente: boolean;
  importadoPor: string;
  createdAt: string;
  totalEntradas: number;
}

export interface DiffResult {
  versionAnteriorId: string | null;
  versionNuevaId: string;
  agregadas: DiffEntrada[];
  modificadas: DiffEntrada[];
  retiradas: DiffEntrada[];
  totalAgregadas: number;
  totalModificadas: number;
  totalRetiradas: number;
}

export interface DiffEntrada {
  tipo: "agregada" | "modificada" | "retirada";
  clave: string;
  datosAnteriores?: Record<string, string>;
  datosNuevos?: Record<string, string>;
}

export interface Programa {
  codigo: string;
  nombre: string;
}

export interface Actividad {
  codigo: string;
  nombre: string;
  programaCodigo: string;
}

export interface Item {
  codigo: string;
  nombre: string;
  programaCodigo: string;
  actividadCodigo: string;
}

export interface Fuente {
  codigo: string;
  nombre: string;
  itemCodigo: string;
}

export interface PeriodoFiscal {
  id: string;
  anio: number;
  nombre: string;
  activo: boolean;
}

export interface CatalogosCedula {
  programas: Programa[];
  actividades: Actividad[];
  items: Item[];
  fuentes: Fuente[];
}

export interface CatalogoFiltro {
  programa: string;
  actividad: string;
  item: string;
}

export type CedulaSection = "carga" | "historial" | "diferencias" | "catalogos";

export type DiffTab = "agregadas" | "modificadas" | "retiradas";

export interface DiffOption {
  key: DiffTab;
  label: string;
  total: number;
  icon: ReactNode;
  tone: "success" | "warning" | "danger";
  entries: DiffEntrada[];
  valueKey: "datosNuevos" | "datosAnteriores";
}
