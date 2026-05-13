export interface Certificacion {
  id: string;
  numero: string | null;
  estado: string;
  monto: number;
  actividad?: { itemCodigo: string; itemNombre: string } | null;
}

export interface Liquidacion {
  id: string;
  tipo: string;
  modo: string;
  monto: string | number;
  estado?: string;
  certificacion?: { numero?: string | null } | null;
}

export interface CrearLiquidacionPayload {
  certificacionId: string;
  tipo: string;
  modo: string;
  monto: string;
  motivo: string;
}
