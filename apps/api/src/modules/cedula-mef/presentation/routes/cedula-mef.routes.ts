import { Hono } from "hono";
import { cedulaMefController } from "../controllers/cedula-mef.controller";
import { requirePermission } from "../../../../common/guards/auth.guard";

const app = new Hono();

app.post("/importar", requirePermission("cedula.importar"), async (c) => cedulaMefController.importar(c));
app.get("/vigente/:periodoFiscalId", requirePermission("cedula.ver"), async (c) => cedulaMefController.consultarVigente(c));
app.get("/versiones/:periodoFiscalId", requirePermission("cedula.ver"), async (c) => cedulaMefController.listarVersiones(c));
app.get("/entradas/:versionId", requirePermission("cedula.ver"), async (c) => cedulaMefController.listarEntradas(c));
app.get("/diff/:versionId", requirePermission("cedula.comparar"), async (c) => cedulaMefController.compararVersiones(c));
app.get("/validar", requirePermission("cedula.ver"), async (c) => cedulaMefController.validarCombinacion(c));
app.get("/:periodoFiscalId/programas", requirePermission("cedula.ver"), async (c) => cedulaMefController.listarProgramas(c));
app.get("/:periodoFiscalId/actividades", requirePermission("cedula.ver"), async (c) => cedulaMefController.listarActividades(c));
app.get("/:periodoFiscalId/items", requirePermission("cedula.ver"), async (c) => cedulaMefController.listarItems(c));
app.get("/:periodoFiscalId/fuentes", requirePermission("cedula.ver"), async (c) => cedulaMefController.listarFuentes(c));

export default app;
