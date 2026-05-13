import { PrismaClient } from "@prisma/client";
import { AuthUser } from "../../../../common/http/context.helpers";
import { parsePagination, totalPages } from "../../../../common/pagination/pagination.helpers";
import {
  compareTramites,
  matchesQuery,
  normalizarAnulacion,
  normalizarCertificacion,
  normalizarDevolucion,
  normalizarLiquidacion,
  normalizarModificacion,
} from "../services/tramites-normalizadores.service";

type ListarTramitesParams = {
  user: AuthUser;
  pageQuery?: string;
  pageSizeQuery?: string;
  estadoQuery?: string;
  searchQuery?: string;
  sortKeyQuery?: string;
  sortDirectionQuery?: string;
};

export async function listarTramites(prisma: PrismaClient, params: ListarTramitesParams) {
  const { page, pageSize } = parsePagination({ pageQuery: params.pageQuery, pageSizeQuery: params.pageSizeQuery, maxPageSize: 100 });
  const estado = params.estadoQuery || "todos";
  const query = String(params.searchQuery || "").trim();
  const sortKey = params.sortKeyQuery || "fecha";
  const sortDirection = params.sortDirectionQuery === "asc" ? "asc" : "desc";
  const takePerSource = Math.min(500, page * pageSize + pageSize);

  const [certificaciones, modificaciones, liquidaciones, anulaciones, devoluciones] = await Promise.all([
    prisma.certificacion.findMany({
      where: withSearch(certificacionWhere(params.user, estado), query, [
        "numero",
        "estado",
        "observaciones",
      ]),
      include: {
        actividad: true,
        solicitante: { select: { id: true, nombre: true, email: true } },
        documentos: true,
      },
      orderBy: { createdAt: "desc" },
      take: takePerSource,
    }),
    prisma.modificacionPoa.findMany({
      where: withSearch(modificacionWhere(params.user, estado), query, [
        "numero",
        "estado",
        "motivo",
        "actividadNombreAnterior",
        "actividadNombreNuevo",
      ]),
      include: { solicitante: { select: { id: true, nombre: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: takePerSource,
    }),
    prisma.liquidacionCertificacion.findMany({
      where: liquidacionWhere(params.user, estado),
      include: {
        certificacion: { include: { actividad: true } },
        usuario: { select: { id: true, nombre: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: takePerSource,
    }),
    prisma.anulacionCertificacion.findMany({
      where: anulacionWhere(params.user, estado),
      include: {
        certificacion: { include: { actividad: true } },
        usuario: { select: { id: true, nombre: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: takePerSource,
    }),
    prisma.devolucionFinanciero.findMany({
      where: devolucionWhere(params.user, estado),
      include: {
        certificacion: { include: { actividad: true } },
        usuario: { select: { id: true, nombre: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: takePerSource,
    }),
  ]);

  const items = [
    ...certificaciones.map((item) => normalizarCertificacion(item)),
    ...modificaciones.map((item) => normalizarModificacion(item)),
    ...liquidaciones.map((item) => normalizarLiquidacion(item)),
    ...anulaciones.map((item) => normalizarAnulacion(item)),
    ...devoluciones.map((item) => normalizarDevolucion(item)),
  ]
    .filter((item) => matchesQuery(item, query))
    .sort((a, b) => compareTramites(a, b, sortKey, sortDirection));

  const totalItems = query ? items.length : await totalTramites(prisma, params.user, estado);
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    totalItems,
    page,
    pageSize,
    totalPages: totalPages(totalItems, pageSize),
  };
}

function certificacionWhere(user: AuthUser, estado: string) {
  const where: any = {};
  if (estado !== "todos") where.estado = estado;
  if (user.rol === "unidad") where.solicitanteId = user.id;
  return where;
}

function modificacionWhere(user: AuthUser, estado: string) {
  const where: any = {};
  if (estado !== "todos") where.estado = estado;
  if (user.rol === "unidad") where.solicitanteId = user.id;
  return where;
}

function liquidacionWhere(user: AuthUser, estado: string) {
  const where: any = {};
  if (estado !== "todos") where.estado = estado;
  if (user.rol === "unidad") where.certificacion = { solicitanteId: user.id };
  return where;
}

function anulacionWhere(user: AuthUser, estado: string) {
  const where: any = {};
  if (estado !== "todos") where.estado = estado;
  if (user.rol === "unidad") where.certificacion = { solicitanteId: user.id };
  return where;
}

function devolucionWhere(user: AuthUser, estado: string) {
  const where: any = {};
  if (estado !== "todos") where.estadoCorreccion = estado;
  if (user.rol === "unidad") where.usuarioId = user.id;
  return where;
}

function withSearch(where: any, query: string, fields: string[]) {
  if (!query) return where;
  return {
    AND: [
      where,
      { OR: fields.map((field) => ({ [field]: { contains: query, mode: "insensitive" } })) },
    ],
  };
}

async function totalTramites(prisma: PrismaClient, user: AuthUser, estado: string) {
  const [certificaciones, modificaciones, liquidaciones, anulaciones, devoluciones] = await Promise.all([
    prisma.certificacion.count({ where: certificacionWhere(user, estado) }),
    prisma.modificacionPoa.count({ where: modificacionWhere(user, estado) }),
    prisma.liquidacionCertificacion.count({ where: liquidacionWhere(user, estado) }),
    prisma.anulacionCertificacion.count({ where: anulacionWhere(user, estado) }),
    prisma.devolucionFinanciero.count({ where: devolucionWhere(user, estado) }),
  ]);
  return certificaciones + modificaciones + liquidaciones + anulaciones + devoluciones;
}
