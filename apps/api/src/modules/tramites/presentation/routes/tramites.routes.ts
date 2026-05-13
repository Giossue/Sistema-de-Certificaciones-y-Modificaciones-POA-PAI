import { Hono } from "hono";
import { requirePermission } from "../../../../common/guards/auth.guard";
import { TramitesController } from "../controllers/tramites.controller";

export const tramitesController = new TramitesController();

const app = new Hono();

app.get("/", requirePermission("certificacion.ver"), async (c) => tramitesController.listar(c));

export default app;
