import { PrismaClient } from "@prisma/client";
import { SaldosMotorService } from "../../../saldos/application/use-cases/saldos-motor.service";
import { contar, objectEntries } from "../services/reporte-direccion-helpers.service";

export async function obtenerResumenDireccion(prisma: PrismaClient, saldosMotor: SaldosMotorService, periodoFiscalId: string) {
  const [saldos, certs, mods, devoluciones] = await Promise.all([
    saldosMotor.resumenPeriodo(periodoFiscalId),
    prisma.certificacion.findMany({
      where: { actividad: { poaVersion: { periodoFiscalId } } },
      include: {
        actividad: { select: { unidadId: true, programaCodigo: true, actividadCodigo: true, itemCodigo: true, saldoDisponible: true } },
        solicitante: { select: { nombre: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.modificacionPoa.findMany({ where: { periodoFiscalId }, orderBy: { createdAt: "desc" } }),
    prisma.devolucionFinanciero.findMany({
      where: { OR: [{ certificacion: { actividad: { poaVersion: { periodoFiscalId } } } }, { certificacionId: null }] },
      include: { usuario: { select: { nombre: true, email: true } }, certificacion: { select: { numero: true, tipo: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const certPorEstado = contar(certs, (item) => item.estado);
  const certPorTipo = contar(certs, (item) => item.tipo || "POA");
  const certPorMes = contar(certs, (item) => item.fechaSolicitud.toISOString().slice(0, 7));
  const certPorUnidad = contar(certs, (item) => item.solicitante?.nombre || item.actividad?.unidadId || "Sin unidad");
  const modsPorEstado = contar(mods, (item) => item.estado);
  const modsPorMes = contar(mods, (item) => item.createdAt.toISOString().slice(0, 7));
  const causas = devoluciones.reduce<Record<string, number>>((acc, item) => {
    acc[item.causa] = (acc[item.causa] || 0) + 1;
    return acc;
  }, {});
  const clasificaciones = contar(devoluciones, (item) => item.clasificacion || "Sin clasificación");
  const porMes = devoluciones.reduce<Record<string, number>>((acc, item) => {
    const key = item.createdAt.toISOString().slice(0, 7);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const certsConSuscripcion = certs.filter((item) => item.fechaSuscripcion);
  const promedioSuscripcionHoras = certsConSuscripcion.length
    ? certsConSuscripcion.reduce((acc, item) => acc + (item.fechaSuscripcion!.getTime() - item.fechaSolicitud.getTime()) / 36e5, 0) / certsConSuscripcion.length
    : 0;

  return {
    periodoFiscalId,
    saldos,
    certificaciones: {
      total: certs.length,
      porEstado: objectEntries(certPorEstado, "estado"),
      porTipo: objectEntries(certPorTipo, "tipo"),
      porMes: objectEntries(certPorMes, "mes").sort((a, b) => String(a.mes).localeCompare(String(b.mes))),
      porUnidad: objectEntries(certPorUnidad, "unidad").sort((a, b) => b.total - a.total).slice(0, 15),
      promedioSuscripcionHoras: Number(promedioSuscripcionHoras.toFixed(2)),
    },
    modificaciones: {
      total: mods.length,
      porEstado: objectEntries(modsPorEstado, "estado"),
      porMes: objectEntries(modsPorMes, "mes").sort((a, b) => String(a.mes).localeCompare(String(b.mes))),
    },
    devoluciones: {
      total: devoluciones.length,
      causas: Object.entries(causas).map(([causa, total]) => ({ causa, total })).sort((a, b) => b.total - a.total),
      clasificaciones: objectEntries(clasificaciones, "clasificacion").sort((a, b) => b.total - a.total),
      porMes: Object.entries(porMes).map(([mes, total]) => ({ mes, total })).sort((a, b) => a.mes.localeCompare(b.mes)),
      noCubiertas: devoluciones.filter((d) => !d.cubiertaPorSistema && !d.improcedente).length,
      recientes: devoluciones.slice(0, 10),
    },
  };
}
