import { Hono } from "hono";
import { requirePermission } from "../../../../common/guards/auth.guard";
import { DevolucionesFinancieroController } from "../controllers/devoluciones-financiero.controller";

export const devolucionesFinancieroController = new DevolucionesFinancieroController();

const app = new Hono();

app.get("/causas", requirePermission("devolucion.ver"), async (c) => devolucionesFinancieroController.listarCausas(c));
app.get("/", requirePermission("devolucion.ver"), async (c) => devolucionesFinancieroController.listar(c));
app.post("/", requirePermission("devolucion.crear"), async (c) => devolucionesFinancieroController.crear(c));
app.post("/:id/clasificar", requirePermission("devolucion.clasificar"), async (c) => devolucionesFinancieroController.clasificar(c));
app.post("/:id/reenviar", requirePermission("certificacion.crear"), async (c) => devolucionesFinancieroController.reenviar(c));

export default app;
