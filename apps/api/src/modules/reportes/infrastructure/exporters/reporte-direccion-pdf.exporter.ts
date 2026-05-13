import { crearPdf, money } from "../../application/services/reporte-direccion-helpers.service";

type ReporteDireccionData = any;

export function exportarReporteDireccionPdf(data: ReporteDireccionData, periodoFiscalId: string) {
  const lines = [
    "Reporte de Direccion POA/PAI",
    `Periodo fiscal: ${periodoFiscalId}`,
    `Fecha de emision: ${new Date().toLocaleDateString("es-EC")}`,
    `Actividades vigentes: ${data.saldos.totalActividades}`,
    `Monto planificado: $${money(data.saldos.montoPlanificado)}`,
    `Saldo disponible: $${money(data.saldos.saldoDisponible)}`,
    `Certificado vigente: $${money(data.saldos.certificadoVigente)}`,
    `Bloqueado en tramite: $${money(data.saldos.bloqueadoSolicitudes)}`,
    `Actividades bajo 30%: ${data.saldos.actividadesBajo30}`,
    `Actividades bajo 10%: ${data.saldos.actividadesBajo10}`,
    `Certificaciones: ${data.certificaciones.total}`,
    `Tiempo promedio de suscripcion: ${data.certificaciones.promedioSuscripcionHoras} horas`,
    `Modificaciones: ${data.modificaciones.total}`,
    `Devoluciones registradas: ${data.devoluciones.total}`,
    `Casos no cubiertos: ${data.devoluciones.noCubiertas}`,
    "Causas principales:",
    ...(data.devoluciones.causas.length
      ? data.devoluciones.causas.slice(0, 8).map((item: any) => `- ${item.causa}: ${item.total}`)
      : ["- Sin devoluciones registradas"]),
  ];
  return {
    body: crearPdf(lines),
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=\"reporte-direccion.pdf\"",
    },
  };
}
