import { Hono } from "hono";
import { requirePermission } from "../../../../common/guards/auth.guard";
import { PoaController } from "../controllers/poa.controller";

export const poaController = new PoaController();

const app = new Hono();

app.post("/", requirePermission("poa.versionar"), async (c) => poaController.crear(c));
app.get("/vigente/:periodoFiscalId", requirePermission("poa.ver"), async (c) => poaController.consultarVigente(c));
app.post("/importar-desde-cedula", requirePermission("poa.versionar"), async (c) => poaController.importarDesdeCedula(c));
app.post("/importar-poa-base", requirePermission("poa.versionar"), async (c) => poaController.importarPoaBase(c));
app.get("/:periodoFiscalId/programas", requirePermission("poa.actividad.ver"), async (c) => poaController.listarProgramas(c));
app.get("/:periodoFiscalId/actividades", requirePermission("poa.actividad.ver"), async (c) => poaController.listarActividadesPoa(c));
app.get("/:periodoFiscalId/items", requirePermission("poa.actividad.ver"), async (c) => poaController.listarItemsPoa(c));
app.get("/:periodoFiscalId/fuentes", requirePermission("poa.actividad.ver"), async (c) => poaController.listarFuentesPoa(c));
app.get("/:periodoFiscalId/saldo", requirePermission("poa.actividad.ver"), async (c) => poaController.consultarSaldo(c));
app.get("/:id/actividades", requirePermission("poa.actividad.ver"), async (c) => poaController.listarActividades(c));
app.get("/:id", requirePermission("poa.ver"), async (c) => poaController.getById(c));

export default app;
