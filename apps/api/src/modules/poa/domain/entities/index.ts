export interface PoaVersionEntity {
  id: string;
  periodoFiscalId: string;
  numeroVersion: number;
  estado: string;
  origenModificacionId: string | null;
  vigente: boolean;
  createdAt: Date;
  createdBy: string;
  actividades?: ActividadPoaEntity[];
}

export interface ActividadPoaEntity {
  id: string;
  poaVersionId: string;
  unidadId: string | null;
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
  createdAt: Date;
}

export interface CrearPoaVersionDto {
  periodoFiscalId: string;
  createdBy: string;
  actividades?: CrearActividadDto[];
}

export interface CrearActividadDto {
  unidadId?: string;
  programaCodigo: string;
  programaNombre: string;
  actividadCodigo: string;
  actividadNombre: string;
  itemCodigo: string;
  itemNombre: string;
  fuenteCodigo: string;
  fuenteNombre: string;
  montoPlanificado: number;
}