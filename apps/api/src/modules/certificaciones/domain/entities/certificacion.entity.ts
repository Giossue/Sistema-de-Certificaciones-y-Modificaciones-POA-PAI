export type CertificacionEstado =
  | "borrador"
  | "solicitada"
  | "observada"
  | "generada"
  | "suscrita"
  | "en_uso"
  | "liquidada_a"
  | "liquidada_b"
  | "anulada"
  | "cancelada"
  | "rechazada";

export interface CertificacionEntity {
  id: string;
  numero: string | null;
  actividadId: string;
  solicitanteId: string;
  analistaId: string | null;
  directorId: string | null;
  monto: number;
  conIva: boolean;
  estado: CertificacionEstado;
  observaciones: string | null;
  cedulaVersionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentoHabilitanteEntity {
  id: string;
  certificacionId: string;
  tipo: string;
  ruta: string;
  nombreOriginal: string;
  tamano: number;
  mimeType: string;
  createdAt: Date;
}
