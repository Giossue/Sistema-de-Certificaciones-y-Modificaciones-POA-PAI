import { PrismaClient } from "@prisma/client";
import { ValidationError } from "../../../../common/errors/http-error.map";
import { AuditoriaParams, AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { causas } from "../../domain/constants/devolucion-causas.constants";
import { AuthUser } from "../../../../common/http/context.helpers";

type AuditMeta = Pick<AuditoriaParams, "rol" | "ip" | "userAgent">;

type CrearDevolucionFinancieroParams = {
  prisma: PrismaClient;
  auditoriaService: AuditoriaService;
  user: AuthUser;
  body: any;
  auditMeta: AuditMeta;
};

export async function crearDevolucionFinanciero(params: CrearDevolucionFinancieroParams) {
  const { prisma, auditoriaService, user, body, auditMeta } = params;
  const causa = String(body.causa || "").trim();
  const descripcion = String(body.descripcion || "").trim();
  if (!causa || !causas.includes(causa)) throw new ValidationError("causa es requerida y debe venir del catálogo");
  if (!descripcion) throw new ValidationError("descripcion es requerida");
  const certificacionId = body.certificacionId || null;
  const data = await prisma.$transaction(async (tx) => {
    const devolucion = await tx.devolucionFinanciero.create({
      data: {
        usuarioId: user.id,
        certificacionId,
        causa,
        descripcion,
        clasificacion: body.clasificacion || causa,
        reglaAsociada: body.reglaAsociada || null,
        estadoCorreccion: "pendiente",
        cubiertaPorSistema: Boolean(body.cubiertaPorSistema),
        improcedente: Boolean(body.improcedente),
      },
    });
    if (certificacionId) {
      await tx.certificacion.update({
        where: { id: certificacionId },
        data: { estado: "devuelta_financiero", devueltaPorFinanciero: true, observaciones: descripcion },
      });
    }
    return devolucion;
  });
  await auditoriaService.registrar({
    usuarioId: user.id,
    entidad: "DevolucionFinanciero",
    entidadId: data.id,
    accion: "REGISTRAR_DEVOLUCION",
    motivo: causa,
    ...auditMeta,
    payloadNuevo: { certificacionId, causa, descripcion, clasificacion: data.clasificacion },
  });
  return data;
}
