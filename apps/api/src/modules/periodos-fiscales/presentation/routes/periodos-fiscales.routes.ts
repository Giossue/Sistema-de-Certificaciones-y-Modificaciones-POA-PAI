import { Hono } from "hono";
import { PeriodosFiscalesController } from "../controllers/periodos-fiscales.controller";

const periodosFiscalesRoutes = new Hono();

periodosFiscalesRoutes.get("/", PeriodosFiscalesController.listar);
periodosFiscalesRoutes.post("/", PeriodosFiscalesController.crear);

export { periodosFiscalesRoutes };
