import { Prisma, PrismaClient } from "@prisma/client";
import { calcularBreakdown, centavosToDecimal, decimalToCentavos, SaldoBreakdown } from "../../domain/saldo-calculator";
import { ValidationError } from "../../../../common/errors/http-error.map";

type PrismaExecutor = PrismaClient | Prisma.TransactionClient;

export type SaldoActividad = SaldoBreakdown & {
  actividadId: string;
  periodoFiscalId: string;
  poaVersionId: string;
  programaCodigo: string;
  programaNombre: string;
  actividadCodigo: string;
  actividadNombre: string;
  itemCodigo: string;
  itemNombre: string;
  fuenteCodigo: string;
  fuenteNombre: string;
};

type ListarPorPeriodoParams = {
  page?: number;
  pageSize?: number;
  texto?: string;
  programaCodigo?: string;
  actividadCodigo?: string;
  itemCodigo?: string;
  fuenteCodigo?: string;
  soloConSaldo?: boolean;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
};

const ESTADOS_CERTIFICADO = ["suscrita", "en_uso"] as const;
const ESTADOS_BLOQUEO = ["solicitada", "observada", "generada"] as const;

function sumDecimal(values: Array<{ monto: Prisma.Decimal | null }>): string {
  const total = values.reduce((acc, item) => acc + decimalToCentavos(item.monto?.toString() ?? "0"), 0n);
  return centavosToDecimal(total);
}

function sumCertificadoRestante(values: Array<{ monto: Prisma.Decimal; liquidaciones: Array<{ monto: Prisma.Decimal }> }>): string {
  const total = values.reduce((acc, cert) => {
    const liquidado = cert.liquidaciones.reduce((sum, liquidacion) => sum + decimalToCentavos(liquidacion.monto), 0n);
    const restante = decimalToCentavos(cert.monto) - liquidado;
    return acc + (restante > 0n ? restante : 0n);
  }, 0n);
  return centavosToDecimal(total);
}

export class SaldosMotorService {
  constructor(private readonly prisma: PrismaClient) {}

  async consultarPorActividadId(actividadId: string, client: PrismaExecutor = this.prisma): Promise<SaldoActividad | null> {
    const actividad = await client.actividadesPoa.findUnique({
      where: { id: actividadId },
      include: { poaVersion: true },
    });
    if (!actividad) return null;

    const [certificado, bloqueado, liquidadoModoA, liquidadoModoB] = await Promise.all([
      client.certificacion.findMany({
        where: { actividadId, estado: { in: [...ESTADOS_CERTIFICADO] } },
        select: { monto: true, liquidaciones: { where: { estado: "aprobada" }, select: { monto: true } } },
      }),
      client.certificacion.findMany({
        where: { actividadId, estado: { in: [...ESTADOS_BLOQUEO] } },
        select: { monto: true },
      }),
      client.liquidacionCertificacion.findMany({
        where: { modo: "A", estado: "aprobada", certificacion: { actividadId } },
        select: { monto: true },
      }),
      client.liquidacionCertificacion.findMany({
        where: { modo: "B", estado: "aprobada", certificacion: { actividadId } },
        select: { monto: true },
      }),
    ]);

    return {
      actividadId: actividad.id,
      periodoFiscalId: actividad.poaVersion.periodoFiscalId,
      poaVersionId: actividad.poaVersionId,
      programaCodigo: actividad.programaCodigo,
      programaNombre: actividad.programaNombre,
      actividadCodigo: actividad.actividadCodigo,
      actividadNombre: actividad.actividadNombre,
      itemCodigo: actividad.itemCodigo,
      itemNombre: actividad.itemNombre,
      fuenteCodigo: actividad.fuenteCodigo,
      fuenteNombre: actividad.fuenteNombre,
      ...calcularBreakdown({
        montoPlanificado: actividad.montoPlanificado,
        saldoDisponible: actividad.saldoDisponible,
        certificadoVigente: sumCertificadoRestante(certificado),
        bloqueadoSolicitudes: sumDecimal(bloqueado),
        liberadoModoA: sumDecimal(liquidadoModoA),
        retiradoModoB: sumDecimal(liquidadoModoB),
      }),
    };
  }

  async consultarPorEstructura(params: {
    periodoFiscalId: string;
    programaCodigo: string;
    actividadCodigo: string;
    itemCodigo: string;
    fuenteCodigo: string;
  }): Promise<SaldoActividad | null> {
    const actividad = await this.prisma.actividadesPoa.findFirst({
      where: {
        poaVersion: { periodoFiscalId: params.periodoFiscalId, vigente: true },
        programaCodigo: params.programaCodigo,
        actividadCodigo: params.actividadCodigo,
        itemCodigo: params.itemCodigo,
        fuenteCodigo: params.fuenteCodigo,
      },
      select: { id: true },
    });

    return actividad ? this.consultarPorActividadId(actividad.id) : null;
  }

  async listarPorPeriodo(periodoFiscalId: string, user?: { id: string; rol: string }): Promise<SaldoActividad[]> {
    const where = await this.actividadesWhere(periodoFiscalId, user);

    const actividades = await this.prisma.actividadesPoa.findMany({
      where,
      include: { poaVersion: true },
      orderBy: [{ programaCodigo: "asc" }, { actividadCodigo: "asc" }, { itemCodigo: "asc" }, { fuenteCodigo: "asc" }],
    });

    return this.hidratarSaldos(actividades);
  }

  async listarPorPeriodoPaginado(
    periodoFiscalId: string,
    params: ListarPorPeriodoParams,
    user?: { id: string; rol: string }
  ) {
    const page = Math.max(1, Number(params.page || 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize || 10)));
    const where = await this.actividadesWhere(periodoFiscalId, user, params);
    const orderBy = this.orderBy(params.sortKey, params.sortDirection);

    const [totalItems, actividades] = await Promise.all([
      this.prisma.actividadesPoa.count({ where }),
      this.prisma.actividadesPoa.findMany({
        where,
        include: { poaVersion: true },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items: await this.hidratarSaldos(actividades),
      totalItems,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
    };
  }

  private async hidratarSaldos(actividades: Array<Prisma.ActividadesPoaGetPayload<{ include: { poaVersion: true } }>>): Promise<SaldoActividad[]> {
    const acumulados = new Map<
      string,
      {
        certificado: bigint;
        bloqueado: bigint;
        liquidadoModoA: bigint;
        liquidadoModoB: bigint;
      }
    >();
    for (const actividad of actividades) {
      acumulados.set(actividad.id, { certificado: 0n, bloqueado: 0n, liquidadoModoA: 0n, liquidadoModoB: 0n });
    }

    for (const ids of chunk(actividades.map((actividad) => actividad.id), 5000)) {
      const [certificaciones, liquidaciones] = await Promise.all([
        this.prisma.certificacion.findMany({
          where: { actividadId: { in: ids }, estado: { in: [...ESTADOS_CERTIFICADO, ...ESTADOS_BLOQUEO] } },
          select: {
            actividadId: true,
            estado: true,
            monto: true,
            liquidaciones: { where: { estado: "aprobada" }, select: { monto: true } },
          },
        }),
        this.prisma.liquidacionCertificacion.findMany({
          where: { estado: "aprobada", certificacion: { actividadId: { in: ids } } },
          select: { modo: true, monto: true, certificacion: { select: { actividadId: true } } },
        }),
      ]);

      for (const cert of certificaciones) {
        const acc = acumulados.get(cert.actividadId);
        if (!acc) continue;
        if ((ESTADOS_CERTIFICADO as readonly string[]).includes(cert.estado)) {
          const liquidado = cert.liquidaciones.reduce((sum, item) => sum + decimalToCentavos(item.monto), 0n);
          const restante = decimalToCentavos(cert.monto) - liquidado;
          acc.certificado += restante > 0n ? restante : 0n;
        } else {
          acc.bloqueado += decimalToCentavos(cert.monto);
        }
      }

      for (const liquidacion of liquidaciones) {
        const actividadId = liquidacion.certificacion.actividadId;
        const acc = acumulados.get(actividadId);
        if (!acc) continue;
        if (liquidacion.modo === "A") acc.liquidadoModoA += decimalToCentavos(liquidacion.monto);
        if (liquidacion.modo === "B") acc.liquidadoModoB += decimalToCentavos(liquidacion.monto);
      }
    }

    return actividades.map((actividad) => {
      const acc = acumulados.get(actividad.id) || { certificado: 0n, bloqueado: 0n, liquidadoModoA: 0n, liquidadoModoB: 0n };
      return {
        actividadId: actividad.id,
        periodoFiscalId: actividad.poaVersion.periodoFiscalId,
        poaVersionId: actividad.poaVersionId,
        programaCodigo: actividad.programaCodigo,
        programaNombre: actividad.programaNombre,
        actividadCodigo: actividad.actividadCodigo,
        actividadNombre: actividad.actividadNombre,
        itemCodigo: actividad.itemCodigo,
        itemNombre: actividad.itemNombre,
        fuenteCodigo: actividad.fuenteCodigo,
        fuenteNombre: actividad.fuenteNombre,
        ...calcularBreakdown({
          montoPlanificado: actividad.montoPlanificado,
          saldoDisponible: actividad.saldoDisponible,
          certificadoVigente: centavosToDecimal(acc.certificado),
          bloqueadoSolicitudes: centavosToDecimal(acc.bloqueado),
          liberadoModoA: centavosToDecimal(acc.liquidadoModoA),
          retiradoModoB: centavosToDecimal(acc.liquidadoModoB),
        }),
      };
    });
  }

  async resumenPeriodo(periodoFiscalId: string, user?: { id: string; rol: string }) {
    const where = await this.actividadesWhere(periodoFiscalId, user);
    const [totalActividades, actividadesConSaldo, total, riesgoBase, alertasBase] = await Promise.all([
      this.prisma.actividadesPoa.count({ where }),
      this.prisma.actividadesPoa.count({ where: { ...where, saldoDisponible: { gt: 0 } } }),
      this.prisma.actividadesPoa.aggregate({
        where,
        _sum: { montoPlanificado: true, saldoDisponible: true },
      }),
      this.prisma.actividadesPoa.findMany({
        where,
        select: { montoPlanificado: true, saldoDisponible: true },
      }),
      this.prisma.actividadesPoa.findMany({
        where,
        include: { poaVersion: true },
        orderBy: { saldoDisponible: "asc" },
        take: 10,
      }),
    ]);
    const alertas = await this.hidratarSaldos(alertasBase);

    return {
      periodoFiscalId,
      totalActividades,
      actividadesConSaldo,
      actividadesBajo30: riesgoBase.filter((item) => porcentajeSaldo(item.saldoDisponible, item.montoPlanificado) < 30).length,
      actividadesBajo10: riesgoBase.filter((item) => porcentajeSaldo(item.saldoDisponible, item.montoPlanificado) < 10).length,
      montoPlanificado: total._sum.montoPlanificado?.toString() || "0",
      saldoDisponible: total._sum.saldoDisponible?.toString() || "0",
      certificadoVigente: "0",
      bloqueadoSolicitudes: "0",
      liberadoModoA: "0",
      retiradoModoB: "0",
      alertas: alertas.filter((s) => s.estado !== "ok"),
    };
  }

  private async actividadesWhere(
    periodoFiscalId: string,
    user?: { id: string; rol: string },
    params: ListarPorPeriodoParams = {}
  ): Promise<Prisma.ActividadesPoaWhereInput> {
    const where: Prisma.ActividadesPoaWhereInput = {
      poaVersion: { periodoFiscalId, vigente: true },
    };
    if (user?.rol === "unidad") {
      where.OR = [{ unidadId: user.id }, { unidadId: null }];
    }
    if (params.programaCodigo) where.programaCodigo = params.programaCodigo;
    if (params.actividadCodigo) where.actividadCodigo = params.actividadCodigo;
    if (params.itemCodigo) where.itemCodigo = params.itemCodigo;
    if (params.fuenteCodigo) where.fuenteCodigo = params.fuenteCodigo;
    if (params.soloConSaldo) where.saldoDisponible = { gt: 0 };
    const texto = params.texto?.trim();
    if (texto) {
      const search: Prisma.ActividadesPoaWhereInput[] = [
        { programaCodigo: { contains: texto, mode: "insensitive" } },
        { programaNombre: { contains: texto, mode: "insensitive" } },
        { actividadCodigo: { contains: texto, mode: "insensitive" } },
        { actividadNombre: { contains: texto, mode: "insensitive" } },
        { itemCodigo: { contains: texto, mode: "insensitive" } },
        { itemNombre: { contains: texto, mode: "insensitive" } },
        { fuenteCodigo: { contains: texto, mode: "insensitive" } },
        { fuenteNombre: { contains: texto, mode: "insensitive" } },
      ];
      where.AND = [...(Array.isArray(where.AND) ? where.AND : []), { OR: search }];
    }
    return where;
  }

  private orderBy(sortKey = "programa", sortDirection: "asc" | "desc" = "asc"): Prisma.ActividadesPoaOrderByWithRelationInput[] {
    const direction = sortDirection === "desc" ? "desc" : "asc";
    if (sortKey === "actividad") return [{ actividadCodigo: direction }, { itemCodigo: "asc" }, { fuenteCodigo: "asc" }];
    if (sortKey === "item") return [{ itemCodigo: direction }, { programaCodigo: "asc" }, { actividadCodigo: "asc" }];
    if (sortKey === "fuente") return [{ fuenteCodigo: direction }, { programaCodigo: "asc" }, { actividadCodigo: "asc" }];
    if (sortKey === "planificado") return [{ montoPlanificado: direction }, { programaCodigo: "asc" }];
    if (sortKey === "saldo" || sortKey === "estado") return [{ saldoDisponible: direction }, { programaCodigo: "asc" }];
    return [{ programaCodigo: direction }, { actividadCodigo: "asc" }, { itemCodigo: "asc" }, { fuenteCodigo: "asc" }];
  }

  async validarDisponible(actividadId: string, monto: string, client: PrismaExecutor = this.prisma): Promise<SaldoActividad> {
    const saldo = await this.consultarPorActividadId(actividadId, client);
    if (!saldo) throw new ValidationError("Actividad POA no encontrada para consultar saldo");
    if (decimalToCentavos(monto) > decimalToCentavos(saldo.saldoDisponible)) {
      throw new ValidationError(`Saldo insuficiente. Disponible: ${saldo.saldoDisponible}`);
    }
    return saldo;
  }

  async descontar(actividadId: string, monto: string, client: PrismaExecutor): Promise<string> {
    const saldo = await this.validarDisponible(actividadId, monto, client);
    const nuevoSaldo = decimalToCentavos(saldo.saldoDisponible) - decimalToCentavos(monto);
    const saldoDisponible = centavosToDecimal(nuevoSaldo);
    await client.actividadesPoa.update({
      where: { id: actividadId },
      data: { saldoDisponible },
    });
    return saldoDisponible;
  }
}

function porcentajeSaldo(saldoDisponible: Prisma.Decimal, montoPlanificado: Prisma.Decimal): number {
  const monto = decimalToCentavos(montoPlanificado);
  if (monto <= 0n) return 0;
  return Number((decimalToCentavos(saldoDisponible) * 10000n) / monto) / 100;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}
