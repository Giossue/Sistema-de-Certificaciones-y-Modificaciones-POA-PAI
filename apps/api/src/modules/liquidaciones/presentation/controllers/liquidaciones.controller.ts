import { Context } from "hono";
import { PrismaClient } from "@prisma/client";
import { auditoriaMeta, AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { listarLiquidaciones } from "../../application/queries/listar-liquidaciones.query";
import { aprobarLiquidacion } from "../../application/use-cases/aprobar-liquidacion.usecase";
import { crearLiquidacion } from "../../application/use-cases/crear-liquidacion.usecase";
import { rechazarLiquidacion } from "../../application/use-cases/rechazar-liquidacion.usecase";
import { userFrom } from "../../../../common/http/context.helpers";
import { ValidationError } from "../../../../common/errors/http-error.map";

const prisma = new PrismaClient();
const auditoriaService = new AuditoriaService(prisma);

export class LiquidacionesController {
  async listar(c: Context) {
    const user = userFrom(c);
    const data = await listarLiquidaciones(prisma, {
      user,
      pageQuery: c.req.query("page"),
      pageSizeQuery: c.req.query("pageSize"),
    });
    return c.json({ success: true, data });
  }

  async crear(c: Context) {
    const user = userFrom(c);
    const body = await c.req.json();
    const data = await crearLiquidacion({
      prisma,
      auditoriaService,
      user,
      body,
      auditMeta: auditoriaMeta(c, user),
    });
    return c.json({ success: true, data }, 201);
  }

  async aprobar(c: Context) {
    const user = userFrom(c);
    const id = c.req.param("id");
    if (!id) throw new ValidationError("id es requerido");
    const data = await aprobarLiquidacion({
      prisma,
      auditoriaService,
      id,
      user,
      auditMeta: auditoriaMeta(c, user),
    });
    return c.json({ success: true, data });
  }

  async rechazar(c: Context) {
    const user = userFrom(c);
    const id = c.req.param("id") as string;
    const body = await c.req.json();
    const data = await rechazarLiquidacion({
      prisma,
      auditoriaService,
      id,
      user,
      motivoRechazo: body.motivoRechazo || body.motivo,
      auditMeta: auditoriaMeta(c, user),
    });
    return c.json({ success: true, data });
  }
}
