import { Hono } from "hono";
import { PeriodosFiscalesController } from "../controllers/periodos-fiscales.controller";
import { requirePermission } from "../../../../common/guards/auth.guard";

const periodosFiscalesRoutes = new Hono();

periodosFiscalesRoutes.get("/", requirePermission("periodos.ver"), PeriodosFiscalesController.listar);
periodosFiscalesRoutes.post("/", requirePermission("periodos.gestionar"), PeriodosFiscalesController.crear);

export { periodosFiscalesRoutes };
