import { Decimal } from "@prisma/client/runtime/library";

export interface CedulaMefVersionEntity {
  id: string;
  periodoFiscalId: string | null;
  archivoNombre: string;
  archivoHash: string;
  corteFecha: Date;
  vigente: boolean;
  totalEntradas: number;
  totalMonto: Decimal;
  importadoPor: string;
  createdAt: Date;
}

export interface CedulaMefEntradaEntity {
  id: string;
  versionId: string;
  programaCodigo: string;
  programaNombre: string;
  actividadCodigo: string;
  actividadNombre: string;
  itemCodigo: string;
  itemNombre: string;
  fuenteCodigo: string;
  fuenteNombre: string;
  montoCodificado: Decimal;
  montoDevengado: Decimal;
  saldoDisponible: Decimal;
  createdAt: Date;
}

export interface ResultadoImportacion {
  versionId: string;
  totalFilas: number;
  filasValidas: number;
  filasIgnoradas: number;
  montoTotal: Decimal;
  hashArchivo: string;
}