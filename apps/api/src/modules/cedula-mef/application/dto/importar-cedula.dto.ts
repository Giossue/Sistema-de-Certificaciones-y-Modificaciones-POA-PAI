import { PrismaClient } from "@prisma/client";
import { AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";

export interface ImportarCedulaDto {
  archivoBuffer: Buffer;
  archivoNombre: string;
  periodoFiscalId: string;
  importadoPor: string;
}

export interface ParseResult {
  filas: ParsedRow[];
  errores: ParseError[];
}

export interface ParsedRow {
  programaCodigo: string;
  programaNombre: string;
  actividadCodigo: string;
  actividadNombre: string;
  itemCodigo: string;
  itemNombre: string;
  fuenteCodigo: string;
  fuenteNombre: string;
  montoCodificado: string;
  montoDevengado: string;
  saldoDisponible: string;
}

export interface ParseError {
  fila: number;
  columna: string;
  mensaje: string;
}

export const COLUMNAS_REQUERIDAS = [
  "PROGRAMA",
  "PROGRAMA_NOMBRE",
  "ACTIVIDAD",
  "ACTIVIDAD_NOMBRE",
  "ITEM",
  "ITEM_NOMBRE",
  "FUENTE",
  "FUENTE_NOMBRE",
  "MONTO_CODIFICADO",
  "SALDO_DISPONIBLE",
] as const;

export type ColumnaRequerida = (typeof COLUMNAS_REQUERIDAS)[number];
