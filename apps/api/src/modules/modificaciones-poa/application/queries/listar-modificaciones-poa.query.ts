import { PrismaClient } from "@prisma/client";
import { AuthUser } from "../../../../common/http/context.helpers";
import { parsePagination, totalPages } from "../../../../common/pagination/pagination.helpers";
import { obtenerModificacionPoa } from "./obtener-modificacion-poa.query";

type ListarModificacionesPoaParams = {
  user: AuthUser;
  pageQuery?: string;
  pageSizeQuery?: string;
};

export async function listarModificacionesPoa(prisma: PrismaClient, params: ListarModificacionesPoaParams) {
  const { user, pageQuery, pageSizeQuery } = params;
  const where: any = {};
  if (user.rol === "unidad") where.solicitanteId = user.id;
  const { page, pageSize, skip, take } = parsePagination({ pageQuery, pageSizeQuery });
  if (pageQuery || pageSizeQuery) {
    const [totalItems, mods] = await Promise.all([
      prisma.modificacionPoa.count({ where }),
      prisma.modificacionPoa.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
    ]);
    return {
      items: await Promise.all(mods.map((m) => obtenerModificacionPoa(prisma, m.id))),
      totalItems,
      page,
      pageSize,
      totalPages: totalPages(totalItems, pageSize),
    };
  }
  const mods = await prisma.modificacionPoa.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 });
  return Promise.all(mods.map((m) => obtenerModificacionPoa(prisma, m.id)));
}
