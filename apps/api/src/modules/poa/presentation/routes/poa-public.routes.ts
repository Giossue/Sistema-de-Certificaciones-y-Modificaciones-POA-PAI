import { Hono } from "hono";
import { generarPlantillaPoaDefinitiva } from "../../infrastructure/exporters/poa-plantilla.exporter";

const app = new Hono();

app.get("/plantilla", async (c) => {
  const buf = generarPlantillaPoaDefinitiva();
  return c.body(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=\"plantilla-poa-definitivo.xlsx\"",
    },
  });
});

export default app;
