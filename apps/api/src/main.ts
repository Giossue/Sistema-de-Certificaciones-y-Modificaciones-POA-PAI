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
import cedulaMefRoutes from "./modules/cedula-mef/presentation/routes/cedula-mef.routes";
import poaPublicRoutes from "./modules/poa/presentation/routes/poa-public.routes";
import poaRoutes from "./modules/poa/presentation/routes/poa.routes";
import certificacionesRoutes from "./modules/certificaciones/presentation/routes/certificaciones.routes";
import saldosRoutes from "./modules/saldos/presentation/routes/saldos.routes";
import modificacionesPoaRoutes from "./modules/modificaciones-poa/presentation/routes/modificaciones-poa.routes";
import liquidacionesRoutes from "./modules/liquidaciones/presentation/routes/liquidaciones.routes";
import anulacionesRoutes from "./modules/anulaciones/presentation/routes/anulaciones.routes";
import devolucionesFinancieroRoutes from "./modules/devoluciones-financiero/presentation/routes/devoluciones-financiero.routes";
import reportesRoutes from "./modules/reportes/presentation/routes/reportes.routes";
import tramitesRoutes from "./modules/tramites/presentation/routes/tramites.routes";

const app = new Hono();

app.use(logger());
app.use(async (c, next) => {
  const startedAt = performance.now();
  await next();
  const durationMs = Math.round(performance.now() - startedAt);
  c.header("X-Response-Time", `${durationMs}ms`);
  if (durationMs > 1000 || c.res.status >= 500) {
    console.warn("[REQUEST]", {
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs,
    });
  }
});
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
app.use("/api/v1/cedula-mef/*", authGuard);
app.route("/api/v1/cedula-mef", cedulaMefRoutes);
app.route("/api/v1/poa", poaPublicRoutes);
app.use("/api/v1/poa/*", authGuard);
app.route("/api/v1/poa", poaRoutes);
app.use("/api/v1/saldos/*", authGuard);
app.route("/api/v1/saldos", saldosRoutes);
app.use("/api/v1/certificaciones/*", authGuard);
app.route("/api/v1/certificaciones", certificacionesRoutes);
app.use("/api/v1/modificaciones-poa/*", authGuard);
app.route("/api/v1/modificaciones-poa", modificacionesPoaRoutes);
app.use("/api/v1/liquidaciones/*", authGuard);
app.route("/api/v1/liquidaciones", liquidacionesRoutes);
app.use("/api/v1/anulaciones/*", authGuard);
app.route("/api/v1/anulaciones", anulacionesRoutes);
app.use("/api/v1/devoluciones-financiero/*", authGuard);
app.route("/api/v1/devoluciones-financiero", devolucionesFinancieroRoutes);
app.use("/api/v1/reportes/*", authGuard);
app.route("/api/v1/reportes", reportesRoutes);
app.use("/api/v1/tramites/*", authGuard);
app.route("/api/v1/tramites", tramitesRoutes);

const port = parseInt(env.API_PORT, 10);
const host = env.API_HOST;

Bun.serve({
  port,
  hostname: host,
  fetch: app.fetch,
});

console.log(`🚀 API corriendo en http://${host}:${port}`);

export { app };
