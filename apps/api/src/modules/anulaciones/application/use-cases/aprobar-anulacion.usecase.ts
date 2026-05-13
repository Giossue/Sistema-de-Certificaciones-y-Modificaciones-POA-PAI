import { PrismaClient } from "@prisma/client";
import { NotFoundError, ValidationError } from "../../../../common/errors/http-error.map";
import { AuditoriaParams, AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { centavosToDecimal, decimalToCentavos } from "../../../saldos/domain/saldo-calculator";
import { AuthUser } from "../../../../common/http/context.helpers";
import { toAnulacionItem } from "../../presentation/serializers/anulacion.serializer";

type AuditMeta = Pick<AuditoriaParams, "rol" | "ip" | "userAgent">;

type AprobarAnulacionParams = {
  prisma: PrismaClient;
  auditoriaService: AuditoriaService;
  id: string;
  user: AuthUser;
  auditMeta: AuditMeta;
};

export async function aprobarAnulacion(params: AprobarAnulacionParams) {
  const { prisma, auditoriaService, id, user, auditMeta } = params;
  const anulacion = await prisma.anulacionCertificacion.findUnique({
    where: { id },
    include: { certificacion: { include: { actividad: true, liquidaciones: true } } },
  });
  if (!anulacion) throw new NotFoundError("Anulación", id);
  if (anulacion.estado !== "solicitada") throw new ValidationError("Solo se puede aprobar una anulación solicitada");
  const cert = anulacion.certificacion;
  if (cert.liquidaciones.some((l) => l.estado === "aprobada") || cert.estado === "en_uso") {
    throw new ValidationError("La certificación tiene uso; debe liquidarse");
  }

  const aprobada = await prisma.$transaction(async (tx) => {
    if (cert.estado === "suscrita" && cert.actividadId) {
      const saldoActual = decimalToCentavos(cert.actividad?.saldoDisponible ?? "0");
      await tx.actividadesPoa.update({
        where: { id: cert.actividadId },
        data: { saldoDisponible: centavosToDecimal(saldoActual + decimalToCentavos(anulacion.montoLiberado)) },
      });
    }
    await tx.certificacion.update({ where: { id: cert.id }, data: { estado: "anulada", observaciones: anulacion.motivo } });
    return tx.anulacionCertificacion.update({
      where: { id },
      data: { estado: "aprobada", aprobadaPorId: user.id, approvedAt: new Date() },
    });
  });

  await auditoriaService.registrar({
    usuarioId: user.id,
    entidad: "Certificacion",
    entidadId: cert.id,
    accion: "APROBAR_ANULACION",
    estadoAnterior: cert.estado,
    estadoNuevo: "anulada",
    motivo: anulacion.motivo,
    ...auditMeta,
  });
  return toAnulacionItem(aprobada);
}
