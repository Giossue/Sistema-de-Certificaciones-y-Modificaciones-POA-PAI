import { Context } from "hono";
import { PrismaClient } from "@prisma/client";
import { auditoriaMeta, AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { listarAnulaciones } from "../../application/queries/listar-anulaciones.query";
import { aprobarAnulacion } from "../../application/use-cases/aprobar-anulacion.usecase";
import { crearAnulacion } from "../../application/use-cases/crear-anulacion.usecase";
import { rechazarAnulacion } from "../../application/use-cases/rechazar-anulacion.usecase";
import { userFrom } from "../../../../common/http/context.helpers";

const prisma = new PrismaClient();
const auditoriaService = new AuditoriaService(prisma);

export class AnulacionesController {
  async listar(c: Context) {
    const user = userFrom(c);
    const data = await listarAnulaciones(prisma, {
      user,
      pageQuery: c.req.query("page"),
      pageSizeQuery: c.req.query("pageSize"),
    });
    return c.json({ success: true, data });
  }

  async crear(c: Context) {
    const user = userFrom(c);
    const body = await c.req.json();
    const data = await crearAnulacion({
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
    const id = c.req.param("id") as string;
    const data = await aprobarAnulacion({
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
    const data = await rechazarAnulacion({
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
