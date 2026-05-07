import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "./config/env";
import { mapDomainErrorToHttp } from "./common/errors/http-error.map";
import { authGuard } from "./common/guards/auth.guard";

import { authRoutes } from "./modules/auth/presentation/routes/auth.routes";
import { usuariosRoutes } from "./modules/usuarios/presentation/routes/usuarios.routes";
import { rolesRoutes } from "./modules/roles/presentation/routes/roles.routes";
import { catalogosRoutes } from "./modules/catalogos/presentation/routes/catalogos.routes";
import { periodosFiscalesRoutes } from "./modules/periodos-fiscales/presentation/routes/periodos-fiscales.routes";

const app = new Hono();

app.use(logger());
app.use(cors({ origin: "*" }));

app.onError((err, c) => {
  const httpError = mapDomainErrorToHttp(err);
  console.error("[ERROR]", err);
  return c.json(
    {
      error: httpError.message,
      status: httpError.status,
    },
    httpError.status
  );
});

app.get("/api/v1/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

app.route("/api/v1/auth", authRoutes);
app.use("/api/v1/usuarios/*", authGuard);
app.route("/api/v1/usuarios", usuariosRoutes);
app.use("/api/v1/roles/*", authGuard);
app.route("/api/v1/roles", rolesRoutes);
app.use("/api/v1/catalogos/*", authGuard);
app.route("/api/v1/catalogos", catalogosRoutes);
app.use("/api/v1/periodos-fiscales/*", authGuard);
app.route("/api/v1/periodos-fiscales", periodosFiscalesRoutes);

const port = parseInt(env.API_PORT, 10);
const host = env.API_HOST;

console.log(`🚀 API corriendo en http://${host}:${port}`);

export default {
  port,
  hostname: host,
  fetch: app.fetch,
};
