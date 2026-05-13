import { PrismaClient } from "@prisma/client";
import { AuditoriaParams, AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { SaldosMotorService } from "../../../saldos/application/use-cases/saldos-motor.service";
import { estadosActivos } from "../../domain/constants/certificacion-estados.constants";
import { NotFoundError, ValidationError } from "../../../../common/errors/http-error.map";
import { obtenerCertificacion } from "../queries/obtener-certificacion.query";

type AuthUser = { id: string };
type AuditMeta = Pick<AuditoriaParams, "rol" | "ip" | "userAgent">;

export async function suscribirCertificacion(params: {
  prisma: PrismaClient;
  saldosMotor: SaldosMotorService;
  auditoriaService: AuditoriaService;
  id: string;
  user: AuthUser;
  auditMeta: AuditMeta;
}) {
  const { prisma, saldosMotor, auditoriaService, id, user, auditMeta } = params;
  const cert = await prisma.certificacion.findUnique({
    where: { id },
    include: {
      actividad: { include: { poaVersion: { include: { periodoFiscal: true } } } },
      solicitante: true,
    },
  });
  if (!cert) throw new NotFoundError("Certificación", id);
  if (cert.estado !== "generada") {
    throw new ValidationError("Solo se puede suscribir una certificación generada por analista");
  }
  if (!cert.actividad) throw new ValidationError("La certificación no tiene actividad POA asociada");

  await prisma.$transaction(async (tx) => {
    const duplicada = await tx.certificacion.findFirst({
      where: {
        id: { not: id },
        actividadId: cert.actividadId,
        estado: { in: estadosActivos },
      },
    });
    if (duplicada) throw new ValidationError("Ya existe otra certificación vigente para esta actividad");

    await tx.certificacion.update({
      where: { id },
      data: {
        estado: "suscrita",
        directorId: user.id,
        fechaSuscripcion: new Date(),
      },
    });

    await saldosMotor.descontar(cert.actividadId, cert.monto.toString(), tx);
  });

  await auditoriaService.registrar({
    usuarioId: user.id,
    entidad: "Certificacion",
    entidadId: id,
    accion: "SUSCRIBIR",
    estadoAnterior: cert.estado,
    estadoNuevo: "suscrita",
    motivo: cert.numero || undefined,
    ...auditMeta,
    payloadAnterior: { estado: cert.estado },
    payloadNuevo: { estado: "suscrita", fechaSuscripcion: new Date().toISOString() },
  });

  return obtenerCertificacion(prisma, id);
}
