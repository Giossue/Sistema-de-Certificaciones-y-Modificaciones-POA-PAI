import { Hono } from "hono";
import { requirePermission } from "../../../../common/guards/auth.guard";
import { AnulacionesController } from "../controllers/anulaciones.controller";

export const anulacionesController = new AnulacionesController();

const app = new Hono();

app.get("/", requirePermission("anulacion.ver"), async (c) => anulacionesController.listar(c));
app.post("/", requirePermission("anulacion.crear"), async (c) => anulacionesController.crear(c));
app.post("/:id/aprobar", requirePermission("anulacion.aprobar"), async (c) => anulacionesController.aprobar(c));
app.post("/:id/rechazar", requirePermission("anulacion.aprobar"), async (c) => anulacionesController.rechazar(c));

export default app;
