import { Hono } from "hono";
import { CatalogosController } from "../controllers/catalogos.controller";
import { requirePermission } from "../../../../common/guards/auth.guard";

const catalogosRoutes = new Hono();

catalogosRoutes.get("/", requirePermission("catalogos.ver"), CatalogosController.listar);
catalogosRoutes.get("/programas", requirePermission("catalogos.ver"), CatalogosController.listarProgramas);
catalogosRoutes.get("/actividades", requirePermission("catalogos.ver"), CatalogosController.listarActividades);
catalogosRoutes.get("/items", requirePermission("catalogos.ver"), CatalogosController.listarItems);
catalogosRoutes.get("/fuentes", requirePermission("catalogos.ver"), CatalogosController.listarFuentes);

export { catalogosRoutes };
