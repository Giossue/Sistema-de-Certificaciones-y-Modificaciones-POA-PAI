import { PrismaClient } from "@prisma/client";
import { NotFoundError, ValidationError } from "../../../../common/errors/http-error.map";
import { AuditoriaParams, AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { AuthUser } from "../../../../common/http/context.helpers";
import { obtenerModificacionPoa } from "../queries/obtener-modificacion-poa.query";

type AuditMeta = Pick<AuditoriaParams, "rol" | "ip" | "userAgent">;

type ReenviarModificacionPoaParams = {
  prisma: PrismaClient;
  auditoriaService: AuditoriaService;
  id: string;
  user: AuthUser;
  observaciones: string;
  auditMeta: AuditMeta;
};

export async function reenviarModificacionPoa(params: ReenviarModificacionPoaParams) {
  const { prisma, auditoriaService, id, user, auditMeta } = params;
  const observaciones = String(params.observaciones || "").trim();
  if (!observaciones) throw new ValidationError("observaciones es requerido");

  const current = await prisma.modificacionPoa.findUnique({ where: { id } });
  if (!current) throw new NotFoundError("Modificación POA", id);
  if (current.estado !== "observada") {
    throw new ValidationError("Solo se puede reenviar una modificación observada");
  }

  await prisma.modificacionPoa.update({
    where: { id },
    data: {
      estado: "solicitada",
      observaciones: null,
    },
  });

  await auditoriaService.registrar({
    usuarioId: user.id,
    entidad: "ModificacionPoa",
    entidadId: id,
    accion: "REENVIAR",
    estadoAnterior: current.estado,
    estadoNuevo: "solicitada",
    motivo: observaciones,
    ...auditMeta,
    payloadAnterior: {
      estado: current.estado,
      observaciones: current.observaciones,
    },
    payloadNuevo: {
      estado: "solicitada",
      observaciones,
    },
  });

  return obtenerModificacionPoa(prisma, id);
}
