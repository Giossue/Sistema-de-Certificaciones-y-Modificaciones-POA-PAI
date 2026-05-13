import { PrismaClient } from "@prisma/client";
import { NotFoundError, ValidationError } from "../../../../common/errors/http-error.map";
import { AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { obtenerCertificacion } from "../queries/obtener-certificacion.query";

type AuthUser = { id: string };

export async function marcarUsoCertificacion(params: {
  prisma: PrismaClient;
  auditoriaService: AuditoriaService;
  id: string;
  user: AuthUser;
  auditMeta: Record<string, unknown>;
}) {
  const { prisma, auditoriaService, id, user, auditMeta } = params;
  const cert = await prisma.certificacion.findUnique({ where: { id } });
  if (!cert) throw new NotFoundError("Certificación", id);
  if (cert.estado !== "suscrita") throw new ValidationError("Solo se puede marcar uso de una certificación suscrita");

  await prisma.certificacion.update({
    where: { id },
    data: { estado: "en_uso", fechaUso: new Date(), devueltaPorFinanciero: false },
  });
  await auditoriaService.registrar({
    usuarioId: user.id,
    entidad: "Certificacion",
    entidadId: id,
    accion: "MARCAR_USO_FINANCIERO",
    estadoAnterior: cert.estado,
    estadoNuevo: "en_uso",
    motivo: cert.numero || undefined,
    ...auditMeta,
  });
  return obtenerCertificacion(prisma, id);
}
