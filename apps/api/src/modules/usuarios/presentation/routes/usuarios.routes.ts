import { Hono } from "hono";
import { UsuariosController } from "../controllers/usuarios.controller";

const usuariosRoutes = new Hono();

usuariosRoutes.get("/", UsuariosController.listar);
usuariosRoutes.post("/", UsuariosController.crear);

export { usuariosRoutes };
