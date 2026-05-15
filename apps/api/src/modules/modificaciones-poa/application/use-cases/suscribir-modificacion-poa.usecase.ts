import { PrismaClient } from "@prisma/client";
import { NotFoundError, ValidationError } from "../../../../common/errors/http-error.map";
import { AuditoriaParams, AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { AuthUser } from "../../../../common/http/context.helpers";
import { obtenerModificacionPoa } from "../queries/obtener-modificacion-poa.query";

type AuditMeta = Pick<AuditoriaParams, "rol" | "ip" | "userAgent">;

type SuscribirModificacionPoaParams = {
  prisma: PrismaClient;
  auditoriaService: AuditoriaService;
  id: string;
  user: AuthUser;
  auditMeta: AuditMeta;
};

export async function suscribirModificacionPoa(params: SuscribirModificacionPoaParams) {
  const { prisma, auditoriaService, id, user, auditMeta } = params;
  const current = await prisma.modificacionPoa.findUnique({ where: { id } });
  if (!current) throw new NotFoundError("Modificación POA", id);
  if (current.estado !== "solicitada") throw new ValidationError("Solo se puede suscribir una modificación solicitada");
  await prisma.modificacionPoa.update({ where: { id }, data: { estado: "suscrita", directorId: user.id, observaciones: null } });
  await auditoriaService.registrar({ usuarioId: user.id, entidad: "ModificacionPoa", entidadId: id, accion: "SUSCRIBIR", estadoAnterior: current.estado, estadoNuevo: "suscrita", ...auditMeta, payloadAnterior: current });
  return obtenerModificacionPoa(prisma, id);
}
