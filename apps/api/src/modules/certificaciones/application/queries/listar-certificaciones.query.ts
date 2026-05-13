import { PrismaClient } from "@prisma/client";
import { parsePagination, totalPages } from "../../../../common/pagination/pagination.helpers";
import { toListItem } from "../../presentation/serializers/certificacion.serializer";

type AuthUser = { id: string; rol: string };

export async function listarCertificaciones(
  prisma: PrismaClient,
  params: {
    user: AuthUser;
    estado?: string;
    solicitanteId?: string;
    pageQuery?: string;
    pageSizeQuery?: string;
  }
) {
  const { user, estado, solicitanteId, pageQuery, pageSizeQuery } = params;
  const { page, pageSize, skip, take } = parsePagination({ pageQuery, pageSizeQuery });

  const where: any = {};
  if (estado) where.estado = estado;
  if (solicitanteId) where.solicitanteId = solicitanteId;
  if (user.rol === "unidad") where.solicitanteId = user.id;

  const include = {
    actividad: { include: { poaVersion: { include: { periodoFiscal: true } } } },
    solicitante: { select: { id: true, nombre: true, email: true } },
    analista: { select: { id: true, nombre: true, email: true } },
    director: { select: { id: true, nombre: true, email: true } },
    documentos: true,
  };

  if (pageQuery || pageSizeQuery) {
    const [totalItems, certs] = await Promise.all([
      prisma.certificacion.count({ where }),
      prisma.certificacion.findMany({
        where,
        include,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
    ]);
    return { items: certs.map(toListItem), totalItems, page, pageSize, totalPages: totalPages(totalItems, pageSize) };
  }

  const certs = await prisma.certificacion.findMany({ where, include, orderBy: { createdAt: "desc" } });
  return certs.map(toListItem);
}
