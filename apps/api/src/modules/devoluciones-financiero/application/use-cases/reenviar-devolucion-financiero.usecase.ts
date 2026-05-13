import { PrismaClient } from "@prisma/client";
import { NotFoundError, ValidationError } from "../../../../common/errors/http-error.map";
import { AuditoriaParams, AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { AuthUser } from "../../../../common/http/context.helpers";

type AuditMeta = Pick<AuditoriaParams, "rol" | "ip" | "userAgent">;

type ReenviarDevolucionFinancieroParams = {
  prisma: PrismaClient;
  auditoriaService: AuditoriaService;
  id: string;
  user: AuthUser;
  auditMeta: AuditMeta;
};

export async function reenviarDevolucionFinanciero(params: ReenviarDevolucionFinancieroParams) {
  const { prisma, auditoriaService, id, user, auditMeta } = params;
  const devolucion = await prisma.devolucionFinanciero.findUnique({ where: { id } });
  if (!devolucion) throw new NotFoundError("Devolución", id);
  if (!devolucion.certificacionId) throw new ValidationError("La devolución no está asociada a una certificación");
  const data = await prisma.$transaction(async (tx) => {
    await tx.certificacion.update({
      where: { id: devolucion.certificacionId! },
      data: { estado: "solicitada", devueltaPorFinanciero: false, observaciones: null },
    });
    return tx.devolucionFinanciero.update({
      where: { id },
      data: { estadoCorreccion: "reenviada", reenviadaEn: new Date() },
    });
  });
  await auditoriaService.registrar({
    usuarioId: user.id,
    entidad: "DevolucionFinanciero",
    entidadId: id,
    accion: "REENVIAR_TRAS_DEVOLUCION",
    estadoAnterior: devolucion.estadoCorreccion,
    estadoNuevo: "reenviada",
    ...auditMeta,
  });
  return data;
}
