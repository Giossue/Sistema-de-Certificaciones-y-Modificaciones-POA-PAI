import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { requirePermission } from "../../../../common/guards/auth.guard";
import { ValidationError } from "../../../../common/errors/http-error.map";
import { SaldosMotorService } from "../../application/use-cases/saldos-motor.service";

const prisma = new PrismaClient();
const saldosMotor = new SaldosMotorService(prisma);
const app = new Hono();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function periodo(c: any): string {
  const periodoFiscalId = c.req.param("periodoFiscalId");
  if (!periodoFiscalId || !UUID_REGEX.test(periodoFiscalId)) {
    throw new ValidationError("periodoFiscalId debe ser un UUID válido");
  }
  return periodoFiscalId;
}

app.get("/:periodoFiscalId/actividades", requirePermission("saldos.ver"), async (c) => {
  const user = (c as any).get("user") as { id: string; rol: string };
  const data = await saldosMotor.listarPorPeriodo(periodo(c), user);
  return c.json({ success: true, data });
});

app.get("/:periodoFiscalId/resumen", requirePermission("saldos.ver"), async (c) => {
  const user = (c as any).get("user") as { id: string; rol: string };
  const data = await saldosMotor.resumenPeriodo(periodo(c), user);
  return c.json({ success: true, data });
});

app.get("/:periodoFiscalId/actividad", requirePermission("saldos.ver"), async (c) => {
  const saldo = await saldosMotor.consultarPorEstructura({
    periodoFiscalId: periodo(c),
    programaCodigo: c.req.query("programa") || "",
    actividadCodigo: c.req.query("actividad") || "",
    itemCodigo: c.req.query("item") || "",
    fuenteCodigo: c.req.query("fuente") || "",
  });
  return c.json({ success: true, data: saldo });
});

export default app;
