export interface Certificacion {
  id: string;
  numero: string | null;
  estado: string;
  monto: number;
}

export interface Anulacion {
  id: string;
  motivo: string;
  montoLiberado: string | number;
  estado?: string;
  certificacion?: { numero?: string | null } | null;
}

export interface CrearAnulacionPayload {
  certificacionId: string;
  motivo: string;
}
