import { Prisma, PrismaClient } from "@prisma/client";
import { AuthUser } from "../../../../common/http/context.helpers";
import { parsePagination, totalPages } from "../../../../common/pagination/pagination.helpers";
import {
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

type TramiteKind =
  | "certificacion"
  | "modificacion"
  | "liquidacion"
  | "anulacion"
  | "devolucion";

type TramiteIndexRow = {
  kind: TramiteKind;
  id: string;
};

type CountRow = {
  total: number;
};

export async function listarTramites(prisma: PrismaClient, params: ListarTramitesParams) {
  const { page, pageSize } = parsePagination({ pageQuery: params.pageQuery, pageSizeQuery: params.pageSizeQuery, maxPageSize: 100 });
  const estado = params.estadoQuery || "todos";
  const query = String(params.searchQuery || "").trim();
  const sortKey = params.sortKeyQuery || "fecha";
  const sortDirection = params.sortDirectionQuery === "asc" ? "asc" : "desc";
  const offset = (page - 1) * pageSize;
  const unified = tramitesIndexSql(params.user, estado);
  const searchWhere = searchSql(query);
  const sortColumn = sortColumnSql(sortKey);
  const direction = sortDirection === "asc" ? Prisma.raw("ASC") : Prisma.raw("DESC");

  const [countRows, pageRows] = await Promise.all([
    prisma.$queryRaw<CountRow[]>`
      WITH unified AS (${unified})
      SELECT COUNT(*)::int AS total
      FROM unified
      ${searchWhere}
    `,
    prisma.$queryRaw<TramiteIndexRow[]>`
      WITH unified AS (${unified})
      SELECT kind, id
      FROM unified
      ${searchWhere}
      ORDER BY ${Prisma.raw(sortColumn)} ${direction} NULLS LAST, fecha DESC
      LIMIT ${pageSize}
      OFFSET ${offset}
    `,
  ]);

  const totalItems = Number(countRows[0]?.total || 0);
  const idsByKind = groupIdsByKind(pageRows);

  const [certificaciones, modificaciones, liquidaciones, anulaciones, devoluciones] = await Promise.all([
    prisma.certificacion.findMany({
      where: { id: { in: idsByKind.certificacion } },
      include: {
        actividad: true,
        solicitante: { select: { id: true, nombre: true, email: true } },
        documentos: true,
      },
    }),
    prisma.modificacionPoa.findMany({
      where: { id: { in: idsByKind.modificacion } },
      include: { solicitante: { select: { id: true, nombre: true, email: true } } },
    }),
    prisma.liquidacionCertificacion.findMany({
      where: { id: { in: idsByKind.liquidacion } },
      include: {
        certificacion: { include: { actividad: true } },
        usuario: { select: { id: true, nombre: true, email: true } },
      },
    }),
    prisma.anulacionCertificacion.findMany({
      where: { id: { in: idsByKind.anulacion } },
      include: {
        certificacion: { include: { actividad: true } },
        usuario: { select: { id: true, nombre: true, email: true } },
      },
    }),
    prisma.devolucionFinanciero.findMany({
      where: { id: { in: idsByKind.devolucion } },
      include: {
        certificacion: { include: { actividad: true } },
        usuario: { select: { id: true, nombre: true, email: true } },
      },
    }),
  ]);

  const itemsByKey = new Map(
    [
    ...certificaciones.map((item) => normalizarCertificacion(item)),
    ...modificaciones.map((item) => normalizarModificacion(item)),
    ...liquidaciones.map((item) => normalizarLiquidacion(item)),
    ...anulaciones.map((item) => normalizarAnulacion(item)),
    ...devoluciones.map((item) => normalizarDevolucion(item)),
  ]
      .map((item) => [`${item.kind}:${item.id}`, item] as const),
  );

  return {
    items: pageRows
      .map((row) => itemsByKey.get(`${row.kind}:${row.id}`))
      .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    totalItems,
    total: totalItems,
    page,
    pageSize,
    totalPages: totalPages(totalItems, pageSize),
  };
}

function tramitesIndexSql(user: AuthUser, estado: string) {
  const unidadCertificacion = user.rol === "unidad" ? Prisma.sql`AND c.solicitante_id = CAST(${user.id} AS uuid)` : Prisma.empty;
  const unidadModificacion = user.rol === "unidad" ? Prisma.sql`AND m.solicitante_id = CAST(${user.id} AS uuid)` : Prisma.empty;
  const unidadLiquidacion = user.rol === "unidad" ? Prisma.sql`AND c.solicitante_id = CAST(${user.id} AS uuid)` : Prisma.empty;
  const unidadAnulacion = user.rol === "unidad" ? Prisma.sql`AND c.solicitante_id = CAST(${user.id} AS uuid)` : Prisma.empty;
  const unidadDevolucion = user.rol === "unidad" ? Prisma.sql`AND d.usuario_id = CAST(${user.id} AS uuid)` : Prisma.empty;

  return Prisma.sql`
    SELECT
      'certificacion'::text AS kind,
      c.id::text AS id,
      COALESCE(c.numero, '') AS numero,
      c.estado AS estado,
      CONCAT_WS(' ', c.tipo, a.actividad_codigo, a.item_codigo) AS titulo,
      COALESCE(c.observaciones, a.actividad_nombre, 'Solicitud de certificación') AS detalle,
      u.nombre AS unidad,
      c.monto::numeric AS monto,
      c.created_at AS fecha
    FROM certificaciones c
    LEFT JOIN actividades_poa a ON a.id = c.actividad_id
    LEFT JOIN usuarios u ON u.id = c.solicitante_id
    WHERE 1 = 1
      ${estadoSql("c.estado", estado)}
      ${unidadCertificacion}

    UNION ALL

    SELECT
      'modificacion'::text AS kind,
      m.id::text AS id,
      COALESCE(m.numero, '') AS numero,
      m.estado AS estado,
      m.motivo AS titulo,
      CONCAT_WS(' ', m.programa_codigo_anterior, m.actividad_codigo_anterior, m.item_codigo_anterior, m.programa_codigo_nuevo, m.actividad_codigo_nuevo, m.item_codigo_nuevo) AS detalle,
      u.nombre AS unidad,
      m.monto_planificado_nuevo::numeric AS monto,
      m.created_at AS fecha
    FROM modificaciones_poa m
    LEFT JOIN usuarios u ON u.id = m.solicitante_id
    WHERE 1 = 1
      ${estadoSql("m.estado", estado)}
      ${unidadModificacion}

    UNION ALL

    SELECT
      'liquidacion'::text AS kind,
      l.id::text AS id,
      COALESCE(c.numero, '') AS numero,
      l.estado AS estado,
      CONCAT_WS(' ', 'Modo', l.modo, l.tipo) AS titulo,
      COALESCE(l.motivo, a.actividad_nombre, 'Solicitud de liquidación') AS detalle,
      u.nombre AS unidad,
      l.monto::numeric AS monto,
      l.created_at AS fecha
    FROM liquidaciones_certificacion l
    JOIN certificaciones c ON c.id = l.certificacion_id
    LEFT JOIN actividades_poa a ON a.id = c.actividad_id
    LEFT JOIN usuarios u ON u.id = l.usuario_id
    WHERE 1 = 1
      ${estadoSql("l.estado", estado)}
      ${unidadLiquidacion}

    UNION ALL

    SELECT
      'anulacion'::text AS kind,
      an.id::text AS id,
      COALESCE(c.numero, '') AS numero,
      an.estado AS estado,
      'Anulación de certificación' AS titulo,
      an.motivo AS detalle,
      u.nombre AS unidad,
      an.monto_liberado::numeric AS monto,
      an.created_at AS fecha
    FROM anulaciones_certificacion an
    JOIN certificaciones c ON c.id = an.certificacion_id
    LEFT JOIN usuarios u ON u.id = an.usuario_id
    WHERE 1 = 1
      ${estadoSql("an.estado", estado)}
      ${unidadAnulacion}

    UNION ALL

    SELECT
      'devolucion'::text AS kind,
      d.id::text AS id,
      COALESCE(c.numero, '') AS numero,
      d.estado_correccion AS estado,
      COALESCE(d.clasificacion, d.causa) AS titulo,
      d.descripcion AS detalle,
      u.nombre AS unidad,
      NULL::numeric AS monto,
      d.created_at AS fecha
    FROM devoluciones_financiero d
    LEFT JOIN certificaciones c ON c.id = d.certificacion_id
    LEFT JOIN usuarios u ON u.id = d.usuario_id
    WHERE 1 = 1
      ${estadoSql("d.estado_correccion", estado)}
      ${unidadDevolucion}
  `;
}

function estadoSql(column: string, estado: string) {
  if (estado === "todos") return Prisma.empty;
  return Prisma.sql`AND ${Prisma.raw(column)} = ${estado}`;
}

function searchSql(query: string) {
  if (!query) return Prisma.empty;
  const like = `%${query}%`;
  return Prisma.sql`
    WHERE
      COALESCE(numero, '') ILIKE ${like}
      OR COALESCE(estado, '') ILIKE ${like}
      OR COALESCE(titulo, '') ILIKE ${like}
      OR COALESCE(detalle, '') ILIKE ${like}
      OR COALESCE(unidad, '') ILIKE ${like}
  `;
}

function sortColumnSql(sortKey: string) {
  if (sortKey === "numero") return "numero";
  if (sortKey === "titulo") return "titulo";
  if (sortKey === "unidad") return "unidad";
  if (sortKey === "monto") return "monto";
  if (sortKey === "estado") return "estado";
  return "fecha";
}

function groupIdsByKind(rows: TramiteIndexRow[]) {
  const idsByKind: Record<TramiteKind, string[]> = {
    certificacion: [],
    modificacion: [],
    liquidacion: [],
    anulacion: [],
    devolucion: [],
  };
  for (const row of rows) idsByKind[row.kind].push(row.id);
  return idsByKind;
}
