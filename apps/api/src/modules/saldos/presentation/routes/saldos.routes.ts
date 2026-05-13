import { Hono } from "hono";
import { requirePermission } from "../../../../common/guards/auth.guard";
import { SaldosController } from "../controllers/saldos.controller";

export const saldosController = new SaldosController();

const app = new Hono();

app.get("/:periodoFiscalId/actividades", requirePermission("saldos.ver"), async (c) => saldosController.listarActividades(c));
app.get("/:periodoFiscalId/resumen", requirePermission("saldos.ver"), async (c) => saldosController.resumen(c));
app.get("/:periodoFiscalId/actividad", requirePermission("saldos.ver"), async (c) => saldosController.consultarActividad(c));

export default app;
