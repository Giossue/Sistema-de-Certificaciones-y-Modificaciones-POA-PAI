import { Hono } from "hono";
import { AuthController } from "../controllers/auth.controller";
import { authGuard } from "../../../../common/guards/auth.guard";

const authRoutes = new Hono();

authRoutes.post("/login", AuthController.login);
authRoutes.get("/me", authGuard, AuthController.me);

export { authRoutes };
