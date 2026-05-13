export interface PeriodoFiscal {
  id: string;
  anio: number;
  nombre: string;
  activo: boolean;
}

export interface ActividadSaldo {
  actividadId: string;
  programaCodigo: string;
  programaNombre: string;
  actividadCodigo: string;
  actividadNombre: string;
  itemCodigo: string;
  itemNombre: string;
  fuenteCodigo: string;
  fuenteNombre: string;
  montoPlanificado: string;
  saldoDisponible: string;
}

export interface Modificacion {
  id: string;
  numero: string;
  estado: string;
  motivo: string;
  anterior: {
    programaCodigo: string;
    actividadCodigo: string;
    itemCodigo: string;
    fuenteCodigo: string;
    responsableNombre?: string | null;
    montoPlanificado: number;
  };
  nuevo: {
    programaCodigo: string;
    actividadCodigo: string;
    itemCodigo: string;
    fuenteCodigo: string;
    responsableNombre?: string | null;
    montoPlanificado: number;
  };
}

export type ModificacionAccion =
  | "suscribir"
  | "aprobar"
  | "aplicar"
  | "observar";

export interface CrearModificacionPayload {
  actividadId: string;
  motivo: string;
  programaCodigo: string;
  actividadCodigo: string;
  itemCodigo: string;
  fuenteCodigo: string;
  responsableNuevoNombre: string;
  observacionBienes: string;
  tipoDiscrepancia: string;
  montoPlanificadoNuevo: string;
}
