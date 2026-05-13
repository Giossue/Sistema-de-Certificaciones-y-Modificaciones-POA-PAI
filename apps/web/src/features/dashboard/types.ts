import type { LucideIcon } from "lucide-react";

export interface PeriodoFiscal {
  id: string;
  anio: number;
  nombre: string;
  activo: boolean;
}

export interface SaldoAlerta {
  actividadId: string;
  programaCodigo: string;
  actividadCodigo: string;
  itemCodigo: string;
  itemNombre: string;
  fuenteCodigo: string;
  saldoDisponible: string;
  montoPlanificado: string;
  porcentajeDisponible: number;
  estado: "ok" | "bajo" | "critico" | "agotado";
}

export interface SaldosResumen {
  totalActividades: number;
  actividadesConSaldo: number;
  actividadesBajo30: number;
  actividadesBajo10: number;
  montoPlanificado: string;
  saldoDisponible: string;
  certificadoVigente: string;
  bloqueadoSolicitudes: string;
  alertas: SaldoAlerta[];
}

export interface Certificacion {
  id: string;
  numero: string | null;
  tipo?: string;
  estado: string;
  monto: number;
  createdAt: string;
  actividad?: {
    actividadCodigo?: string;
    actividadNombre?: string;
    itemCodigo: string;
    itemNombre: string;
    fuenteCodigo?: string;
  } | null;
  solicitante?: { nombre: string } | null;
}

export interface DashboardAction {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

export interface FiscalStat {
  label: string;
  value: string;
}
