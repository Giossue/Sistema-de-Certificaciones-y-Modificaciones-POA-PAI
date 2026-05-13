import { PrismaClient } from "@prisma/client";
import { NotFoundError, ValidationError } from "../../../../common/errors/http-error.map";
import { AuditoriaParams, AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { AuthUser } from "../../../../common/http/context.helpers";
import { toAnulacionItem } from "../../presentation/serializers/anulacion.serializer";

type AuditMeta = Pick<AuditoriaParams, "rol" | "ip" | "userAgent">;

type CrearAnulacionParams = {
  prisma: PrismaClient;
  auditoriaService: AuditoriaService;
  user: AuthUser;
  body: any;
  auditMeta: AuditMeta;
};

export async function crearAnulacion(params: CrearAnulacionParams) {
  const { prisma, auditoriaService, user, body, auditMeta } = params;
  const certificacionId = String(body.certificacionId || "");
  const motivo = String(body.motivo || "").trim();
  if (!certificacionId) throw new ValidationError("certificacionId es requerido");
  if (!motivo) throw new ValidationError("motivo es requerido");

  const cert = await prisma.certificacion.findUnique({
    where: { id: certificacionId },
    include: { actividad: true, liquidaciones: true, anulacion: true },
  });
  if (!cert) throw new NotFoundError("Certificación", certificacionId);
  if (cert.anulacion && cert.anulacion.estado !== "rechazada") throw new ValidationError("La certificación ya tiene una anulación en trámite o aprobada");
  if (cert.liquidaciones.some((l) => l.estado === "aprobada") || cert.estado === "en_uso") {
    throw new ValidationError("La certificación tiene uso; debe liquidarse");
  }
  if (!["suscrita", "generada"].includes(cert.estado)) {
    throw new ValidationError("Solo se puede anular una certificación generada o suscrita sin uso");
  }

  const montoLiberado = cert.estado === "suscrita" ? cert.monto.toString() : "0.00";
  const anulacion = await prisma.anulacionCertificacion.create({
    data: { certificacionId: cert.id, usuarioId: user.id, motivo, montoLiberado, estado: "solicitada" },
  });

  await auditoriaService.registrar({
    usuarioId: user.id,
    entidad: "Certificacion",
    entidadId: cert.id,
    accion: "SOLICITAR_ANULACION",
    estadoAnterior: cert.estado,
    estadoNuevo: cert.estado,
    motivo,
    ...auditMeta,
    payloadNuevo: { anulacionId: anulacion.id, montoLiberado },
  });
  return toAnulacionItem(anulacion);
}
