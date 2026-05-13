import { Context } from "hono";
import { PrismaClient } from "@prisma/client";
import { ValidationError } from "../../../../common/errors/http-error.map";
import { SaldosMotorService } from "../../application/use-cases/saldos-motor.service";

const prisma = new PrismaClient();
const saldosMotor = new SaldosMotorService(prisma);

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function periodo(c: Context): string {
  const periodoFiscalId = c.req.param("periodoFiscalId");
  if (!periodoFiscalId || !UUID_REGEX.test(periodoFiscalId)) {
    throw new ValidationError("periodoFiscalId debe ser un UUID válido");
  }
  return periodoFiscalId;
}

export class SaldosController {
  async listarActividades(c: Context) {
    const user = (c as any).get("user") as { id: string; rol: string };
    const hasPaging = c.req.query("page") || c.req.query("pageSize") || c.req.query("texto") || c.req.query("programa") || c.req.query("actividad") || c.req.query("item") || c.req.query("fuente") || c.req.query("soloConSaldo") || c.req.query("sortKey");
    const data = hasPaging
      ? await saldosMotor.listarPorPeriodoPaginado(periodo(c), {
          page: Number(c.req.query("page") || 1),
          pageSize: Number(c.req.query("pageSize") || 10),
          texto: c.req.query("texto") || "",
          programaCodigo: c.req.query("programa") || "",
          actividadCodigo: c.req.query("actividad") || "",
          itemCodigo: c.req.query("item") || "",
          fuenteCodigo: c.req.query("fuente") || "",
          soloConSaldo: c.req.query("soloConSaldo") === "true",
          sortKey: c.req.query("sortKey") || "programa",
          sortDirection: c.req.query("sortDirection") === "desc" ? "desc" : "asc",
        }, user)
      : await saldosMotor.listarPorPeriodo(periodo(c), user);
    return c.json({ success: true, data });
  }

  async resumen(c: Context) {
    const user = (c as any).get("user") as { id: string; rol: string };
    const data = await saldosMotor.resumenPeriodo(periodo(c), user);
    return c.json({ success: true, data });
  }

  async consultarActividad(c: Context) {
    const saldo = await saldosMotor.consultarPorEstructura({
      periodoFiscalId: periodo(c),
      programaCodigo: c.req.query("programa") || "",
      actividadCodigo: c.req.query("actividad") || "",
      itemCodigo: c.req.query("item") || "",
      fuenteCodigo: c.req.query("fuente") || "",
    });
    return c.json({ success: true, data: saldo });
  }
}
