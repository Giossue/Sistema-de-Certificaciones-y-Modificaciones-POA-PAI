import { PrismaClient } from "@prisma/client";
import { NotFoundError } from "../../../../common/errors/http-error.map";
import { toModificacionPoaItem } from "../../presentation/serializers/modificacion-poa.serializer";

export async function obtenerModificacionPoa(prisma: PrismaClient, id: string) {
  const mod = await prisma.modificacionPoa.findUnique({
    where: { id },
    include: {
      solicitante: { select: { id: true, nombre: true, email: true } },
      analista: { select: { id: true, nombre: true, email: true } },
      director: { select: { id: true, nombre: true, email: true } },
    },
  });
  if (!mod) throw new NotFoundError("Modificación POA", id);
  return toModificacionPoaItem(mod);
}
