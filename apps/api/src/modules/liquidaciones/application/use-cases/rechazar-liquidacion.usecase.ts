import { PrismaClient } from "@prisma/client";
import { NotFoundError, ValidationError } from "../../../../common/errors/http-error.map";
import { AuditoriaParams, AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { AuthUser } from "../../../../common/http/context.helpers";
import { toLiquidacionItem } from "../../presentation/serializers/liquidacion.serializer";

type AuditMeta = Pick<AuditoriaParams, "rol" | "ip" | "userAgent">;

type RechazarLiquidacionParams = {
  prisma: PrismaClient;
  auditoriaService: AuditoriaService;
  id: string;
  user: AuthUser;
  motivoRechazo: string;
  auditMeta: AuditMeta;
};

export async function rechazarLiquidacion(params: RechazarLiquidacionParams) {
  const { prisma, auditoriaService, id, user, auditMeta } = params;
  const motivoRechazo = String(params.motivoRechazo || "").trim();
  if (!motivoRechazo) throw new ValidationError("motivoRechazo es requerido");
  const current = await prisma.liquidacionCertificacion.findUnique({ where: { id } });
  if (!current) throw new NotFoundError("Liquidación", id);
  if (current.estado !== "solicitada") throw new ValidationError("Solo se puede rechazar una liquidación solicitada");
  const liquidacion = await prisma.liquidacionCertificacion.update({
    where: { id },
    data: { estado: "rechazada", aprobadaPorId: user.id, motivoRechazo, approvedAt: new Date() },
  });
  await auditoriaService.registrar({
    usuarioId: user.id,
    entidad: "Certificacion",
    entidadId: current.certificacionId,
    accion: "RECHAZAR_LIQUIDACION",
    motivo: motivoRechazo,
    ...auditMeta,
  });
  return toLiquidacionItem(liquidacion);
}
