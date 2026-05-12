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
        select: { monto: true, liquidaciones: { select: { monto: true } } },
      }),
      client.certificacion.findMany({
        where: { actividadId, estado: { in: [...ESTADOS_BLOQUEO] } },
        select: { monto: true },
      }),
      client.liquidacionCertificacion.findMany({
        where: { modo: "A", certificacion: { actividadId } },
        select: { monto: true },
      }),
      client.liquidacionCertificacion.findMany({
        where: { modo: "B", certificacion: { actividadId } },
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
    const where: Prisma.ActividadesPoaWhereInput = {
      poaVersion: { periodoFiscalId, vigente: true },
    };
    if (user?.rol === "unidad") {
      where.OR = [{ unidadId: user.id }, { unidadId: null }];
    }

    const actividades = await this.prisma.actividadesPoa.findMany({
      where,
      select: { id: true },
      orderBy: [{ programaCodigo: "asc" }, { actividadCodigo: "asc" }, { itemCodigo: "asc" }, { fuenteCodigo: "asc" }],
    });

    const saldos = await Promise.all(actividades.map((actividad) => this.consultarPorActividadId(actividad.id)));
    return saldos.filter((saldo): saldo is SaldoActividad => Boolean(saldo));
  }

  async resumenPeriodo(periodoFiscalId: string, user?: { id: string; rol: string }) {
    const saldos = await this.listarPorPeriodo(periodoFiscalId, user);
    const total = saldos.reduce(
      (acc, item) => ({
        montoPlanificado: acc.montoPlanificado + decimalToCentavos(item.montoPlanificado),
        saldoDisponible: acc.saldoDisponible + decimalToCentavos(item.saldoDisponible),
        certificadoVigente: acc.certificadoVigente + decimalToCentavos(item.certificadoVigente),
        bloqueadoSolicitudes: acc.bloqueadoSolicitudes + decimalToCentavos(item.bloqueadoSolicitudes),
        liberadoModoA: acc.liberadoModoA + decimalToCentavos(item.liberadoModoA),
        retiradoModoB: acc.retiradoModoB + decimalToCentavos(item.retiradoModoB),
      }),
      { montoPlanificado: 0n, saldoDisponible: 0n, certificadoVigente: 0n, bloqueadoSolicitudes: 0n, liberadoModoA: 0n, retiradoModoB: 0n }
    );

    return {
      periodoFiscalId,
      totalActividades: saldos.length,
      actividadesConSaldo: saldos.filter((s) => decimalToCentavos(s.saldoDisponible) > 0n).length,
      actividadesBajo30: saldos.filter((s) => s.estado === "bajo").length,
      actividadesBajo10: saldos.filter((s) => s.estado === "critico" || s.estado === "agotado").length,
      montoPlanificado: centavosToDecimal(total.montoPlanificado),
      saldoDisponible: centavosToDecimal(total.saldoDisponible),
      certificadoVigente: centavosToDecimal(total.certificadoVigente),
      bloqueadoSolicitudes: centavosToDecimal(total.bloqueadoSolicitudes),
      liberadoModoA: centavosToDecimal(total.liberadoModoA),
      retiradoModoB: centavosToDecimal(total.retiradoModoB),
      alertas: saldos
        .filter((s) => s.estado !== "ok")
        .sort((a, b) => a.porcentajeDisponible - b.porcentajeDisponible)
        .slice(0, 10),
    };
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
