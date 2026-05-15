import { Context } from "hono";
import { prisma } from "../../../../database/prisma";
import { SaldosMotorService } from "../../../saldos/application/use-cases/saldos-motor.service";
import { obtenerResumenDireccion } from "../../application/queries/obtener-resumen-direccion.query";
import { exportarReporteDireccionCsv } from "../../infrastructure/exporters/reporte-direccion-csv.exporter";
import { exportarReporteDireccionPdf } from "../../infrastructure/exporters/reporte-direccion-pdf.exporter";
import { exportarReporteDireccionXlsx } from "../../infrastructure/exporters/reporte-direccion-xlsx.exporter";
import { param } from "../../../../common/http/context.helpers";


const saldosMotor = new SaldosMotorService(prisma);

export class ReportesController {
  async resumenDireccion(c: Context) {
    const periodoFiscalId = param(c, "periodoFiscalId");
    return c.json({ success: true, data: await obtenerResumenDireccion(prisma, saldosMotor, periodoFiscalId) });
  }

  async exportarDireccionCsv(c: Context) {
    const periodoFiscalId = param(c, "periodoFiscalId");
    const data = await obtenerResumenDireccion(prisma, saldosMotor, periodoFiscalId);
    const csv = exportarReporteDireccionCsv(data);
    return c.text(csv.body, 200, csv.headers);
  }

  async exportarDireccionXlsx(c: Context) {
    const periodoFiscalId = param(c, "periodoFiscalId");
    const data = await obtenerResumenDireccion(prisma, saldosMotor, periodoFiscalId);
    const xlsx = exportarReporteDireccionXlsx(data);
    return c.body(xlsx.body, 200, xlsx.headers);
  }

  async exportarDireccionPdf(c: Context) {
    const periodoFiscalId = param(c, "periodoFiscalId");
    const data = await obtenerResumenDireccion(prisma, saldosMotor, periodoFiscalId);
    const pdf = exportarReporteDireccionPdf(data, periodoFiscalId);
    return c.body(pdf.body, 200, pdf.headers);
  }
}
