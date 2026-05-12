import { CertificacionEntity, CertificacionEstado } from "../entities/certificacion.entity";

export interface CrearCertificacionDto {
  actividadId: string;
  solicitanteId: string;
  monto: number;
  conIva: boolean;
  cedulaVersionId?: string;
}

export interface CertificacionRepository {
  crear(dto: CrearCertificacionDto): Promise<CertificacionEntity>;
  buscarPorId(id: string): Promise<CertificacionEntity | null>;
  buscarVigentePorActividad(actividadId: string, excludeEstado?: CertificacionEstado[]): Promise<CertificacionEntity | null>;
  actualizarEstado(id: string, estado: CertificacionEstado, usuarioId: string, observaciones?: string): Promise<CertificacionEntity>;
  asignarNumero(id: string, numero: string): Promise<CertificacionEntity>;
  listarPorSolicitante(solicitanteId: string): Promise<CertificacionEntity[]>;
  listarPorEstado(estado: CertificacionEstado): Promise<CertificacionEntity[]>;
}