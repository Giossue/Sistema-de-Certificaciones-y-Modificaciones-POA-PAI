import { Context } from "hono";
import { PrismaClient } from "@prisma/client";
import { auditoriaMeta, AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { ModificacionDocumentosService } from "../../infrastructure/modificacion-documentos.service";
import { descargarInformeModificacion } from "../../application/queries/descargar-informe-modificacion.query";
import { listarModificacionesPoa } from "../../application/queries/listar-modificaciones-poa.query";
import { listarMotivosModificacion } from "../../application/queries/listar-motivos-modificacion.query";
import { obtenerModificacionPoa } from "../../application/queries/obtener-modificacion-poa.query";
import { aplicarModificacionPoa } from "../../application/use-cases/aplicar-modificacion-poa.usecase";
import { aprobarModificacionPoa } from "../../application/use-cases/aprobar-modificacion-poa.usecase";
import { crearModificacionPoa } from "../../application/use-cases/crear-modificacion-poa.usecase";
import { observarModificacionPoa } from "../../application/use-cases/observar-modificacion-poa.usecase";
import { suscribirModificacionPoa } from "../../application/use-cases/suscribir-modificacion-poa.usecase";
import { param, userFrom } from "../../../../common/http/context.helpers";

const prisma = new PrismaClient();
const auditoriaService = new AuditoriaService(prisma);
const documentosService = new ModificacionDocumentosService();

export class ModificacionesPoaController {
  async listarMotivos(c: Context) {
    return c.json({ success: true, data: listarMotivosModificacion() });
  }

  async listar(c: Context) {
    const user = userFrom(c);
    const data = await listarModificacionesPoa(prisma, {
      user,
      pageQuery: c.req.query("page"),
      pageSizeQuery: c.req.query("pageSize"),
    });
    return c.json({ success: true, data });
  }

  async crear(c: Context) {
    const user = userFrom(c);
    const body = await c.req.json();
    const data = await crearModificacionPoa({
      prisma,
      documentosService,
      auditoriaService,
      user,
      body,
      auditMeta: auditoriaMeta(c, user),
    });
    return c.json({ success: true, data }, 201);
  }

  async observar(c: Context) {
    const user = userFrom(c);
    const id = param(c, "id");
    const body = await c.req.json();
    const data = await observarModificacionPoa({
      prisma,
      auditoriaService,
      id,
      user,
      observaciones: body.observaciones,
      auditMeta: auditoriaMeta(c, user),
    });
    return c.json({ success: true, data });
  }

  async suscribir(c: Context) {
    const user = userFrom(c);
    const id = param(c, "id");
    const data = await suscribirModificacionPoa({
      prisma,
      auditoriaService,
      id,
      user,
      auditMeta: auditoriaMeta(c, user),
    });
    return c.json({ success: true, data });
  }

  async aprobar(c: Context) {
    const user = userFrom(c);
    const id = param(c, "id");
    const data = await aprobarModificacionPoa({
      prisma,
      auditoriaService,
      id,
      user,
      auditMeta: auditoriaMeta(c, user),
    });
    return c.json({ success: true, data });
  }

  async aplicar(c: Context) {
    const user = userFrom(c);
    const id = param(c, "id");
    const data = await aplicarModificacionPoa({
      prisma,
      auditoriaService,
      id,
      user,
      auditMeta: auditoriaMeta(c, user),
    });
    return c.json({ success: true, data });
  }

  async descargarInforme(c: Context) {
    const id = param(c, "id");
    const download = await descargarInformeModificacion(prisma, id);
    return c.body(download.body, { headers: download.headers });
  }

  async obtener(c: Context) {
    return c.json({ success: true, data: await obtenerModificacionPoa(prisma, param(c, "id")) });
  }
}
