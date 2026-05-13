import { PrismaClient } from "@prisma/client";
import { AuthUser } from "../../../../common/http/context.helpers";
import { parsePagination, totalPages } from "../../../../common/pagination/pagination.helpers";
import { toAnulacionItem } from "../../presentation/serializers/anulacion.serializer";

type ListarAnulacionesParams = {
  user: AuthUser;
  pageQuery?: string;
  pageSizeQuery?: string;
};

export async function listarAnulaciones(prisma: PrismaClient, params: ListarAnulacionesParams) {
  const { user, pageQuery, pageSizeQuery } = params;
  const where: any = {};
  if (user.rol === "unidad") where.certificacion = { solicitanteId: user.id };
  const { page, pageSize, skip, take } = parsePagination({ pageQuery, pageSizeQuery });
  const include = { certificacion: { include: { actividad: true } }, usuario: { select: { id: true, nombre: true, email: true } } };
  if (pageQuery || pageSizeQuery) {
    const [totalItems, data] = await Promise.all([
      prisma.anulacionCertificacion.count({ where }),
      prisma.anulacionCertificacion.findMany({
        where,
        include,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
    ]);
    return { items: data.map(toAnulacionItem), totalItems, page, pageSize, totalPages: totalPages(totalItems, pageSize) };
  }
  const data = await prisma.anulacionCertificacion.findMany({
    where,
    include,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return data.map(toAnulacionItem);
}
