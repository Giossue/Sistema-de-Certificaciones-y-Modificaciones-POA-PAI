import { Hono } from "hono";
import { requirePermission } from "../../../../common/guards/auth.guard";
import { LiquidacionesController } from "../controllers/liquidaciones.controller";

export const liquidacionesController = new LiquidacionesController();

const app = new Hono();

app.get("/", requirePermission("liquidacion.ver"), async (c) => liquidacionesController.listar(c));
app.post("/", requirePermission("liquidacion.crear"), async (c) => liquidacionesController.crear(c));
app.post("/:id/aprobar", requirePermission("liquidacion.aprobar"), async (c) => liquidacionesController.aprobar(c));
app.post("/:id/rechazar", requirePermission("liquidacion.aprobar"), async (c) => liquidacionesController.rechazar(c));

export default app;
