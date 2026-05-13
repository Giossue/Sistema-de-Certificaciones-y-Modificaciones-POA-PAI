import { PrismaClient } from "@prisma/client";
import { NotFoundError } from "../../../../common/errors/http-error.map";
import { toListItem } from "../../presentation/serializers/certificacion.serializer";

export async function obtenerCertificacion(prisma: PrismaClient, id: string) {
  const cert = await prisma.certificacion.findUnique({
    where: { id },
    include: {
      actividad: { include: { poaVersion: { include: { periodoFiscal: true } } } },
      solicitante: { select: { id: true, nombre: true, email: true } },
      analista: { select: { id: true, nombre: true, email: true } },
      director: { select: { id: true, nombre: true, email: true } },
      documentos: true,
    },
  });
  if (!cert) throw new NotFoundError("Certificación", id);
  return toListItem(cert);
}
