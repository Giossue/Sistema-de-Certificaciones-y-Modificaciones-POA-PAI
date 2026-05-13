import { Hono } from "hono";
import { requirePermission } from "../../../../common/guards/auth.guard";
import { ReportesController } from "../controllers/reportes.controller";

export const reportesController = new ReportesController();

const app = new Hono();

app.get("/direccion/:periodoFiscalId", requirePermission("reporte.ver"), async (c) => reportesController.resumenDireccion(c));
app.get("/direccion/:periodoFiscalId/export.csv", requirePermission("reporte.ver"), async (c) => reportesController.exportarDireccionCsv(c));
app.get("/direccion/:periodoFiscalId/export.xlsx", requirePermission("reporte.ver"), async (c) => reportesController.exportarDireccionXlsx(c));
app.get("/direccion/:periodoFiscalId/export.pdf", requirePermission("reporte.ver"), async (c) => reportesController.exportarDireccionPdf(c));

export default app;
