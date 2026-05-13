import { PrismaClient } from "@prisma/client";
import { NotFoundError, ValidationError } from "../../../../common/errors/http-error.map";
import { AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { obtenerCertificacion } from "../queries/obtener-certificacion.query";

type AuthUser = { id: string; rol: string };

export async function observarCertificacion(params: {
  prisma: PrismaClient;
  auditoriaService: AuditoriaService;
  id: string;
  user: AuthUser;
  observaciones: unknown;
  auditMeta: Record<string, unknown>;
}) {
  const { prisma, auditoriaService, id, user, auditMeta } = params;
  const observaciones = String(params.observaciones || "").trim();
  if (!observaciones) throw new ValidationError("observaciones es requerido");

  const cert = await prisma.certificacion.findUnique({ where: { id } });
  if (!cert) throw new NotFoundError("Certificación", id);
  if (!["solicitada", "generada"].includes(cert.estado)) {
    throw new ValidationError("Solo se puede observar una certificación solicitada o generada");
  }

  await prisma.certificacion.update({
    where: { id },
    data: {
      estado: "observada",
      observaciones,
      ...(user.rol === "director" ? { directorId: user.id } : { analistaId: user.id }),
    },
  });
  await auditoriaService.registrar({
    usuarioId: user.id,
    entidad: "Certificacion",
    entidadId: id,
    accion: "OBSERVAR",
    estadoAnterior: cert.estado,
    estadoNuevo: "observada",
    motivo: observaciones,
    ...auditMeta,
    payloadAnterior: { estado: cert.estado, observaciones: cert.observaciones },
    payloadNuevo: { estado: "observada", observaciones },
  });

  return obtenerCertificacion(prisma, id);
}
