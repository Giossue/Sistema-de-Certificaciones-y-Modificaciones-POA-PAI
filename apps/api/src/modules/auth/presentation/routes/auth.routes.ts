import { Hono } from "hono";
import { AuthController } from "../controllers/auth.controller";

const authRoutes = new Hono();

authRoutes.post("/login", AuthController.login);
authRoutes.get("/me", AuthController.me);

export { authRoutes };
