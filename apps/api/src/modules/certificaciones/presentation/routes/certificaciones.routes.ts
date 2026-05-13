import { Hono } from "hono";
import { requirePermission } from "../../../../common/guards/auth.guard";
import { CertificacionesController } from "../controllers/certificaciones.controller";

export const certificacionesController = new CertificacionesController();

const app = new Hono();

app.post("/", requirePermission("certificacion.crear"), async (c) => certificacionesController.crear(c));
app.get("/", requirePermission("certificacion.ver"), async (c) => certificacionesController.listar(c));
app.post("/:id/observar", requirePermission("certificacion.observar"), async (c) => certificacionesController.observar(c));
app.post("/:id/aprobar", requirePermission("certificacion.aprobar"), async (c) => certificacionesController.aprobar(c));
app.post("/:id/suscribir", requirePermission("certificacion.suscribir"), async (c) => certificacionesController.suscribir(c));
app.post("/:id/marcar-uso", requirePermission("certificacion.marcar_uso"), async (c) => certificacionesController.marcarUso(c));
app.post("/:id/reenviar", requirePermission("certificacion.crear"), async (c) => certificacionesController.reenviar(c));
app.get("/:id/documentos/:documentoId/download", requirePermission("certificacion.ver"), async (c) => certificacionesController.descargarDocumento(c));
app.get("/:id", requirePermission("certificacion.ver"), async (c) => certificacionesController.obtener(c));

export default app;
