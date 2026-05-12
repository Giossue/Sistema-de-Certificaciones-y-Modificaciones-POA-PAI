import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { requirePermission } from "../../../../common/guards/auth.guard";
import { SaldosMotorService } from "../../../saldos/application/use-cases/saldos-motor.service";
import { ValidationError } from "../../../../common/errors/http-error.map";

const prisma = new PrismaClient();
const saldosMotor = new SaldosMotorService(prisma);
const app = new Hono();

async function resumenDireccion(periodoFiscalId: string) {
  const [saldos, certs, mods, devoluciones] = await Promise.all([
    saldosMotor.resumenPeriodo(periodoFiscalId),
    prisma.certificacion.groupBy({ by: ["estado"], _count: { _all: true } }),
    prisma.modificacionPoa.groupBy({ by: ["estado"], where: { periodoFiscalId }, _count: { _all: true } }),
    prisma.devolucionFinanciero.findMany({ include: { usuario: { select: { nombre: true, email: true } } }, orderBy: { createdAt: "desc" } }),
  ]);

  const causas = devoluciones.reduce<Record<string, number>>((acc, item) => {
    acc[item.causa] = (acc[item.causa] || 0) + 1;
    return acc;
  }, {});
  const porMes = devoluciones.reduce<Record<string, number>>((acc, item) => {
    const key = item.createdAt.toISOString().slice(0, 7);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return {
    periodoFiscalId,
    saldos,
    certificaciones: certs.map((item) => ({ estado: item.estado, total: item._count._all })),
    modificaciones: mods.map((item) => ({ estado: item.estado, total: item._count._all })),
    devoluciones: {
      total: devoluciones.length,
      causas: Object.entries(causas).map(([causa, total]) => ({ causa, total })).sort((a, b) => b.total - a.total),
      porMes: Object.entries(porMes).map(([mes, total]) => ({ mes, total })).sort((a, b) => a.mes.localeCompare(b.mes)),
      noCubiertas: devoluciones.filter((d) => !d.cubiertaPorSistema && !d.improcedente).length,
      recientes: devoluciones.slice(0, 10),
    },
  };
}

app.get("/direccion/:periodoFiscalId", requirePermission("reporte.ver"), async (c) => {
  const periodoFiscalId = c.req.param("periodoFiscalId");
  if (!periodoFiscalId) throw new ValidationError("periodoFiscalId es requerido");
  return c.json({ success: true, data: await resumenDireccion(periodoFiscalId) });
});

app.get("/direccion/:periodoFiscalId/export.csv", requirePermission("reporte.ver"), async (c) => {
  const periodoFiscalId = c.req.param("periodoFiscalId");
  if (!periodoFiscalId) throw new ValidationError("periodoFiscalId es requerido");
  const data = await resumenDireccion(periodoFiscalId);
  const rows = [
    ["Indicador", "Valor"],
    ["Actividades", data.saldos.totalActividades],
    ["Saldo disponible", data.saldos.saldoDisponible],
    ["Certificado vigente", data.saldos.certificadoVigente],
    ["Devoluciones", data.devoluciones.total],
    ["Casos no cubiertos", data.devoluciones.noCubiertas],
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  return c.text(csv, 200, {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": "attachment; filename=\"reporte-direccion.csv\"",
  });
});

app.get("/direccion/:periodoFiscalId/export.xlsx", requirePermission("reporte.ver"), async (c) => {
  const periodoFiscalId = c.req.param("periodoFiscalId");
  if (!periodoFiscalId) throw new ValidationError("periodoFiscalId es requerido");
  const data = await resumenDireccion(periodoFiscalId);
  const XLSX = require("xlsx");
  const rows = [
    ["Indicador", "Valor"],
    ["Actividades", data.saldos.totalActividades],
    ["Saldo disponible", data.saldos.saldoDisponible],
    ["Certificado vigente", data.saldos.certificadoVigente],
    ["Devoluciones", data.devoluciones.total],
    ["Casos no cubiertos", data.devoluciones.noCubiertas],
  ];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Direccion");
  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
  return c.body(buffer, 200, {
    "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition": "attachment; filename=\"reporte-direccion.xlsx\"",
  });
});

export default app;
