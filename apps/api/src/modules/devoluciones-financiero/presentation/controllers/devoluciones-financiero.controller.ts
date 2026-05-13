import { Context } from "hono";
import { PrismaClient } from "@prisma/client";
import { auditoriaMeta, AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { listarCausasDevolucion } from "../../application/queries/listar-causas-devolucion.query";
import { listarDevolucionesFinanciero } from "../../application/queries/listar-devoluciones-financiero.query";
import { clasificarDevolucionFinanciero } from "../../application/use-cases/clasificar-devolucion-financiero.usecase";
import { crearDevolucionFinanciero } from "../../application/use-cases/crear-devolucion-financiero.usecase";
import { reenviarDevolucionFinanciero } from "../../application/use-cases/reenviar-devolucion-financiero.usecase";
import { param, userFrom } from "../../../../common/http/context.helpers";

const prisma = new PrismaClient();
const auditoriaService = new AuditoriaService(prisma);

export class DevolucionesFinancieroController {
  async listarCausas(c: Context) {
    return c.json({ success: true, data: listarCausasDevolucion() });
  }

  async listar(c: Context) {
    const user = userFrom(c);
    const data = await listarDevolucionesFinanciero(prisma, {
      user,
      pageQuery: c.req.query("page"),
      pageSizeQuery: c.req.query("pageSize"),
    });
    return c.json({ success: true, data });
  }

  async crear(c: Context) {
    const user = userFrom(c);
    const body = await c.req.json();
    const data = await crearDevolucionFinanciero({
      prisma,
      auditoriaService,
      user,
      body,
      auditMeta: auditoriaMeta(c, user),
    });
    return c.json({ success: true, data }, 201);
  }

  async clasificar(c: Context) {
    const user = userFrom(c);
    const id = param(c, "id");
    const body = await c.req.json();
    const data = await clasificarDevolucionFinanciero({
      prisma,
      auditoriaService,
      id,
      user,
      body,
      auditMeta: auditoriaMeta(c, user),
    });
    return c.json({ success: true, data });
  }

  async reenviar(c: Context) {
    const user = userFrom(c);
    const id = param(c, "id");
    const data = await reenviarDevolucionFinanciero({
      prisma,
      auditoriaService,
      id,
      user,
      auditMeta: auditoriaMeta(c, user),
    });
    return c.json({ success: true, data });
  }
}
