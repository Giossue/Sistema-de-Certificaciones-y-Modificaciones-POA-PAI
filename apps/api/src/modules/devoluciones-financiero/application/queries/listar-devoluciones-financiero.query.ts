import { PrismaClient } from "@prisma/client";
import { AuthUser } from "../../../../common/http/context.helpers";
import { parsePagination, totalPages } from "../../../../common/pagination/pagination.helpers";

type ListarDevolucionesFinancieroParams = {
  user: AuthUser;
  pageQuery?: string;
  pageSizeQuery?: string;
};

export async function listarDevolucionesFinanciero(prisma: PrismaClient, params: ListarDevolucionesFinancieroParams) {
  const { user, pageQuery, pageSizeQuery } = params;
  const where: any = {};
  if (user.rol === "unidad") where.usuarioId = user.id;
  const { page, pageSize, skip, take } = parsePagination({ pageQuery, pageSizeQuery });
  const include = {
    certificacion: { include: { actividad: true } },
    usuario: { select: { id: true, nombre: true, email: true } },
  };
  if (pageQuery || pageSizeQuery) {
    const [totalItems, data] = await Promise.all([
      prisma.devolucionFinanciero.count({ where }),
      prisma.devolucionFinanciero.findMany({
        where,
        include,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
    ]);
    return { items: data, totalItems, page, pageSize, totalPages: totalPages(totalItems, pageSize) };
  }
  return prisma.devolucionFinanciero.findMany({
    where,
    include,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}
