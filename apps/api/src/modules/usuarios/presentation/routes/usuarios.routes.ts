import { Hono } from "hono";
import { UsuariosController } from "../controllers/usuarios.controller";
import { requirePermission } from "../../../../common/guards/auth.guard";

const usuariosRoutes = new Hono();

usuariosRoutes.get("/", requirePermission("usuarios.gestionar"), UsuariosController.listar);
usuariosRoutes.post("/", requirePermission("usuarios.gestionar"), UsuariosController.crear);
usuariosRoutes.put("/:id", requirePermission("usuarios.gestionar"), UsuariosController.actualizar);
usuariosRoutes.delete("/:id", requirePermission("usuarios.gestionar"), UsuariosController.eliminar);

export { usuariosRoutes };
