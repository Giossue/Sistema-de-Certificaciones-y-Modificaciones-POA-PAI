import {
  Clock3,
  FileSpreadsheet,
  Gauge,
  Inbox,
  Plus,
  Users,
} from "lucide-react";
import { formatMoney } from "@/services/money";
import type { DashboardAction, FiscalStat, SaldosResumen } from "../types";

export const money = formatMoney;

export const roleTitle: Record<string, string> = {
  admin: "Inicio institucional",
  director: "Inicio Dirección",
  analista: "Inicio de revisión",
  unidad: "Inicio de unidad",
  financiero: "Inicio financiero",
  bienes: "Inicio bienes",
};

export const roleDescription: Record<string, string> = {
  admin: "Vista operativa del periodo fiscal y trámites abiertos",
  director: "Suscripciones, aprobaciones y alertas que requieren decisión",
  analista: "Solicitudes por revisar, observaciones y saldos del periodo",
  unidad: "Solicitudes, observaciones y saldos disponibles para requerimientos",
  financiero: "Certificaciones emitidas, uso financiero y devoluciones",
  bienes: "Discrepancias y modificaciones POA asociadas a bienes",
};

export function pendingStatesFor(role: string) {
  if (role === "director") return ["generada", "suscrita"];
  if (role === "analista") return ["solicitada", "observada"];
  if (role === "financiero") return ["suscrita", "devuelta_financiero"];
  if (role === "unidad")
    return ["observada", "devuelta_financiero", "solicitada"];
  return [
    "solicitada",
    "observada",
    "generada",
    "suscrita",
    "devuelta_financiero",
  ];
}

export function pendingCopyFor(role: string) {
  if (role === "director")
    return "Trámites listos para suscripción, aprobación o decisión.";
  if (role === "analista") return "Solicitudes que requieren revisión técnica.";
  if (role === "financiero")
    return "Certificaciones listas para uso financiero o devolución.";
  if (role === "unidad")
    return "Solicitudes propias con observaciones o seguimiento.";
  return "Trámites abiertos del periodo fiscal.";
}

export function fiscalStatsFor(resumen: SaldosResumen | null): FiscalStat[] {
  if (!resumen) return [];
  return [
    { label: "Planificado", value: `$${money(resumen.montoPlanificado)}` },
    { label: "Disponible", value: `$${money(resumen.saldoDisponible)}` },
    {
      label: "Certificado vigente",
      value: `$${money(resumen.certificadoVigente)}`,
    },
    {
      label: "Bloqueado en trámite",
      value: `$${money(resumen.bloqueadoSolicitudes)}`,
    },
    {
      label: "Actividades vigentes",
      value: resumen.totalActividades.toLocaleString("es-EC"),
    },
    {
      label: "Saldos bajo 30%",
      value: (
        resumen.actividadesBajo30 + resumen.actividadesBajo10
      ).toLocaleString("es-EC"),
    },
  ];
}

export function actionsFor(role: string): DashboardAction[] {
  const base = [
    {
      label: "Bandeja de trámites",
      description: "Revisar estados y acciones",
      href: "/tramites",
      icon: Inbox,
    },
    {
      label: "Consultar POA",
      description: "Saldos y estructura vigente",
      href: "/poa",
      icon: Gauge,
    },
  ];
  if (role === "unidad") {
    return [
      {
        label: "Nueva certificación",
        description: "Solicitar POA/PAI",
        href: "/certificaciones",
        icon: Plus,
      },
      ...base,
    ];
  }
  if (role === "admin") {
    return [
      ...base,
      {
        label: "Cédula MEF",
        description: "Importar versión vigente",
        href: "/cedula-mef",
        icon: FileSpreadsheet,
      },
      {
        label: "Usuarios",
        description: "Roles y accesos",
        href: "/usuarios",
        icon: Users,
      },
    ];
  }
  if (role === "analista") {
    return [
      ...base,
      {
        label: "Cédula MEF",
        description: "Validar versión vigente",
        href: "/cedula-mef",
        icon: FileSpreadsheet,
      },
    ];
  }
  if (role === "director") {
    return [
      {
        label: "Bandeja de trámites",
        description: "Suscribir y aprobar",
        href: "/tramites",
        icon: Inbox,
      },
      {
        label: "Reportes",
        description: "Indicadores de dirección",
        href: "/reportes",
        icon: Clock3,
      },
      {
        label: "Consultar POA",
        description: "Saldos y estructura vigente",
        href: "/poa",
        icon: Gauge,
      },
    ];
  }
  return base;
}
