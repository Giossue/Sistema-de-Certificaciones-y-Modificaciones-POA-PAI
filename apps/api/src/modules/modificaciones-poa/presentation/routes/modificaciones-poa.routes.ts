import { Hono } from "hono";
import { requirePermission } from "../../../../common/guards/auth.guard";
import { ModificacionesPoaController } from "../controllers/modificaciones-poa.controller";

export const modificacionesPoaController = new ModificacionesPoaController();

const app = new Hono();

app.get("/motivos", requirePermission("modificacion.ver"), async (c) => modificacionesPoaController.listarMotivos(c));
app.get("/", requirePermission("modificacion.ver"), async (c) => modificacionesPoaController.listar(c));
app.post("/", requirePermission("modificacion.crear"), async (c) => modificacionesPoaController.crear(c));
app.post("/:id/observar", requirePermission("modificacion.observar"), async (c) => modificacionesPoaController.observar(c));
app.post("/:id/suscribir", requirePermission("modificacion.suscribir"), async (c) => modificacionesPoaController.suscribir(c));
app.post("/:id/aprobar", requirePermission("modificacion.aprobar"), async (c) => modificacionesPoaController.aprobar(c));
app.post("/:id/aplicar", requirePermission("modificacion.aprobar"), async (c) => modificacionesPoaController.aplicar(c));
app.get("/:id/informe", requirePermission("modificacion.ver"), async (c) => modificacionesPoaController.descargarInforme(c));
app.get("/:id", requirePermission("modificacion.ver"), async (c) => modificacionesPoaController.obtener(c));

export default app;
