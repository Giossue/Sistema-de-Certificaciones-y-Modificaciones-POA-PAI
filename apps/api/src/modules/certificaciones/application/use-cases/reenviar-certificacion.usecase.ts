import { PrismaClient } from "@prisma/client";
import { NotFoundError, ValidationError } from "../../../../common/errors/http-error.map";
import { AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { estadosReenvio } from "../../domain/constants/certificacion-estados.constants";
import { obtenerCertificacion } from "../queries/obtener-certificacion.query";

type AuthUser = { id: string };

export async function reenviarCertificacion(params: {
  prisma: PrismaClient;
  auditoriaService: AuditoriaService;
  id: string;
  user: AuthUser;
  auditMeta: Record<string, unknown>;
}) {
  const { prisma, auditoriaService, id, user, auditMeta } = params;
  const cert = await prisma.certificacion.findUnique({ where: { id } });
  if (!cert) throw new NotFoundError("Certificación", id);
  if (!estadosReenvio.includes(cert.estado)) throw new ValidationError("Solo se puede reenviar una certificación observada o devuelta por financiero");

  await prisma.certificacion.update({
    where: { id },
    data: { estado: "solicitada", observaciones: null, devueltaPorFinanciero: false },
  });
  await auditoriaService.registrar({
    usuarioId: user.id,
    entidad: "Certificacion",
    entidadId: id,
    accion: "REENVIAR",
    estadoAnterior: cert.estado,
    estadoNuevo: "solicitada",
    ...auditMeta,
  });
  return obtenerCertificacion(prisma, id);
}
