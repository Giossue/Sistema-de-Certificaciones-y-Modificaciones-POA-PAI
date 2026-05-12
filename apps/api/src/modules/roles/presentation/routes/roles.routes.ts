import { Hono } from "hono";
import { requirePermission } from "../../../../common/guards/auth.guard";

const rolesRoutes = new Hono();

rolesRoutes.get("/", requirePermission("roles.ver"), (c) => {
  return c.json([
    { value: "admin", label: "Administrador" },
    { value: "director", label: "Director" },
    { value: "analista", label: "Analista" },
    { value: "unidad", label: "Unidad Requirente" },
  ]);
});

export { rolesRoutes };
