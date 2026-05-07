import { Hono } from "hono";
import { CatalogosController } from "../controllers/catalogos.controller";

const catalogosRoutes = new Hono();

catalogosRoutes.get("/", CatalogosController.listar);
catalogosRoutes.get("/programas", CatalogosController.listarProgramas);
catalogosRoutes.get("/actividades", CatalogosController.listarActividades);
catalogosRoutes.get("/items", CatalogosController.listarItems);
catalogosRoutes.get("/fuentes", CatalogosController.listarFuentes);

export { catalogosRoutes };
