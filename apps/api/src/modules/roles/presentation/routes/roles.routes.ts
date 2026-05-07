import { Hono } from "hono";

const rolesRoutes = new Hono();

rolesRoutes.get("/", (c) => {
  return c.json([
    { value: "admin", label: "Administrador" },
    { value: "director", label: "Director" },
    { value: "analista", label: "Analista" },
    { value: "unidad", label: "Unidad Requirente" },
  ]);
});

export { rolesRoutes };
