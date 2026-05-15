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

export interface ImportarDesdeCedulaDto {
  poaVersionId: string;
  cedulaVersionId: string;
}

export interface PoaRepository {
  crearVersion(dto: CrearPoaVersionDto): Promise<PoaVersionEntity>;
  consultarVigente(periodoFiscalId: string): Promise<PoaVersionEntity | null>;
  getById(id: string): Promise<PoaVersionEntity | null>;
  marcarNoVigente(periodoFiscalId: string): Promise<void>;
  agregarActividades(versionId: string, actividades: CrearActividadDto[]): Promise<ActividadPoaEntity[]>;
  getActividades(versionId: string): Promise<ActividadPoaEntity[]>;
}

export const POA_REPOSITORY = Symbol("PoaRepository");
