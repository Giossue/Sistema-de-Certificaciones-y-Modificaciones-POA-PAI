export interface PeriodoFiscal {
  id: string;
  anio: number;
  nombre: string;
  activo: boolean;
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

export interface ItemPoa {
  codigo: string;
  nombre: string;
  programaCodigo: string;
  actividadCodigo: string;
}

export interface FuentePoa {
  codigo: string;
  nombre: string;
  itemCodigo: string;
}

export interface SaldoInfo {
  saldoDisponible: number;
  montoPlanificado: number;
}

export interface Certificacion {
  id: string;
  numero: string | null;
  tipo: "POA" | "PAI";
  estado: string;
  monto: number;
  conIva: boolean;
  observaciones: string | null;
  createdAt: string;
  actividad: {
    programaCodigo: string;
    programaNombre: string;
    actividadCodigo: string;
    actividadNombre: string;
    itemCodigo: string;
    itemNombre: string;
    fuenteCodigo: string;
    fuenteNombre: string;
    saldoDisponible: number;
  } | null;
  solicitante: { nombre: string; email: string };
  documentos: Array<{
    id: string;
    tipo: string;
    nombreOriginal: string;
    mimeType: string;
    plantilla?: string | null;
    versionPlantilla?: string | null;
    hashDocumento?: string | null;
  }>;
}

export type CertificacionTab = "nueva" | "bandeja";

export type TipoCertificacion = "POA" | "PAI";

export type CertificacionAccion =
  | "aprobar"
  | "suscribir"
  | "observar"
  | "marcar-uso"
  | "reenviar";
