import { PrismaClient } from "@prisma/client";
import { NotFoundError, ValidationError } from "../../../../common/errors/http-error.map";
import { AuditoriaParams, AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { AuthUser } from "../../../../common/http/context.helpers";
import { obtenerModificacionPoa } from "../queries/obtener-modificacion-poa.query";

type AuditMeta = Pick<AuditoriaParams, "rol" | "ip" | "userAgent">;

type AprobarModificacionPoaParams = {
  prisma: PrismaClient;
  auditoriaService: AuditoriaService;
  id: string;
  user: AuthUser;
  auditMeta: AuditMeta;
};

export async function aprobarModificacionPoa(params: AprobarModificacionPoaParams) {
  const { prisma, auditoriaService, id, user, auditMeta } = params;
  const mod = await prisma.modificacionPoa.findUnique({ where: { id } });
  if (!mod) throw new NotFoundError("Modificación POA", id);
  if (mod.estado !== "suscrita") throw new ValidationError("Solo se puede aprobar una modificación suscrita");
  await prisma.modificacionPoa.update({ where: { id }, data: { estado: "aprobada", analistaId: user.id } });
  await auditoriaService.registrar({
    usuarioId: user.id,
    entidad: "ModificacionPoa",
    entidadId: id,
    accion: "APROBAR",
    estadoAnterior: mod.estado,
    estadoNuevo: "aprobada",
    motivo: mod.numero || undefined,
    ...auditMeta,
    payloadAnterior: mod,
  });
  return obtenerModificacionPoa(prisma, id);
}
