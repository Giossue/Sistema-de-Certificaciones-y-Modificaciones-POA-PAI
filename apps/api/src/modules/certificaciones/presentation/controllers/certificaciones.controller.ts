import { Context } from "hono";
import { prisma } from "../../../../database/prisma";
import { descargarDocumentoCertificacion } from "../../application/queries/descargar-documento-certificacion.query";
import { listarCertificaciones } from "../../application/queries/listar-certificaciones.query";
import { obtenerCertificacion } from "../../application/queries/obtener-certificacion.query";
import { aprobarCertificacion } from "../../application/use-cases/aprobar-certificacion.usecase";
import { crearSolicitudCertificacion } from "../../application/use-cases/crear-solicitud-certificacion.usecase";
import { marcarUsoCertificacion } from "../../application/use-cases/marcar-uso-certificacion.usecase";
import { observarCertificacion } from "../../application/use-cases/observar-certificacion.usecase";
import { reenviarCertificacion } from "../../application/use-cases/reenviar-certificacion.usecase";
import { CrearCertificacionUseCase } from "../../application/use-cases/crear-certificacion.usecase";
import { suscribirCertificacion } from "../../application/use-cases/suscribir-certificacion.usecase";
import { CertificacionDocumentosService } from "../../infrastructure/certificacion-documentos.service";
import { userFrom, param } from "../../../../common/http/context.helpers";
import { AuditoriaService, auditoriaMeta } from "../../../auditoria/infrastructure/auditoria.service";
import { SaldosMotorService } from "../../../saldos/application/use-cases/saldos-motor.service";


const crearCertificacionUseCase = new CrearCertificacionUseCase(prisma);
const documentosService = new CertificacionDocumentosService();
const auditoriaService = new AuditoriaService(prisma);
const saldosMotor = new SaldosMotorService(prisma);

export class CertificacionesController {
  async crear(c: Context) {
    const user = userFrom(c);
    const contentType = c.req.header("content-type") || "";
    let payload: Record<string, any> = {};
    let archivos: File[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await c.req.formData();
      payload = {
        periodoFiscalId: formData.get("periodoFiscalId"),
        tipo: formData.get("tipo") || "POA",
        programaCodigo: formData.get("programaCodigo"),
        actividadCodigo: formData.get("actividadCodigo"),
        itemCodigo: formData.get("itemCodigo"),
        fuenteCodigo: formData.get("fuenteCodigo"),
        monto: formData.get("monto"),
        conIva: formData.get("conIva") === "true",
      };
      archivos = formData.getAll("documentos").filter((item): item is File => item instanceof File);
    } else {
      payload = await c.req.json();
    }

    const data = await crearSolicitudCertificacion({
      prisma,
      crearCertificacionUseCase,
      documentosService,
      auditoriaService,
      user,
      payload,
      archivos,
      auditMeta: auditoriaMeta(c, user),
    });

    return c.json({ success: true, data }, 201);
  }

  async listar(c: Context) {
    const user = userFrom(c);
    const data = await listarCertificaciones(prisma, {
      user,
      estado: c.req.query("estado"),
      solicitanteId: c.req.query("solicitante"),
      pageQuery: c.req.query("page"),
      pageSizeQuery: c.req.query("pageSize"),
    });
    return c.json({ success: true, data });
  }

  async obtener(c: Context) {
    return c.json({ success: true, data: await obtenerCertificacion(prisma, param(c, "id")) });
  }

  async observar(c: Context) {
    const user = userFrom(c);
    const id = param(c, "id");
    const body = await c.req.json();
    const data = await observarCertificacion({
      prisma,
      auditoriaService,
      id,
      user,
      observaciones: body.observaciones,
      auditMeta: auditoriaMeta(c, user),
    });
    return c.json({ success: true, data });
  }

  async aprobar(c: Context) {
    const user = userFrom(c);
    const id = param(c, "id");
    const data = await aprobarCertificacion({
      prisma,
      documentosService,
      auditoriaService,
      id,
      user,
      auditMeta: auditoriaMeta(c, user),
    });
    return c.json({ success: true, data });
  }

  async suscribir(c: Context) {
    const user = userFrom(c);
    const id = param(c, "id");
    const data = await suscribirCertificacion({
      prisma,
      saldosMotor,
      auditoriaService,
      id,
      user,
      auditMeta: auditoriaMeta(c, user),
    });
    return c.json({ success: true, data });
  }

  async marcarUso(c: Context) {
    const user = userFrom(c);
    const id = param(c, "id");
    const data = await marcarUsoCertificacion({
      prisma,
      auditoriaService,
      id,
      user,
      auditMeta: auditoriaMeta(c, user),
    });
    return c.json({ success: true, data });
  }

  async reenviar(c: Context) {
    const user = userFrom(c);
    const id = param(c, "id");
    const data = await reenviarCertificacion({
      prisma,
      auditoriaService,
      id,
      user,
      auditMeta: auditoriaMeta(c, user),
    });
    return c.json({ success: true, data });
  }

  async descargarDocumento(c: Context) {
    const id = param(c, "id");
    const documentoId = param(c, "documentoId");
    const download = await descargarDocumentoCertificacion(prisma, id, documentoId);
    return c.body(download.body, { headers: download.headers });
  }
}
