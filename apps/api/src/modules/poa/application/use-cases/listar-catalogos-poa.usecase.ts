import { PrismaClient } from "@prisma/client";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function esUuidValido(str: string): boolean {
  return UUID_REGEX.test(str);
}

export class ListarProgramasPoaUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(periodoFiscalId: string) {
    if (!esUuidValido(periodoFiscalId)) return [];
    const version = await this.prisma.poaVersion.findFirst({
      where: { periodoFiscalId, vigente: true },
    });
    if (!version) return [];

    const programas = await this.prisma.actividadesPoa.findMany({
      where: { poaVersionId: version.id },
      select: { programaCodigo: true, programaNombre: true },
      orderBy: { programaCodigo: "asc" },
      distinct: ["programaCodigo"],
    });

    return programas.map((p) => ({
      codigo: p.programaCodigo,
      nombre: p.programaNombre || p.programaCodigo,
    }));
  }
}

export class ListarActividadesPorProgramaPoaUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(periodoFiscalId: string, programaCodigo?: string) {
    if (!esUuidValido(periodoFiscalId)) return [];
    const version = await this.prisma.poaVersion.findFirst({
      where: { periodoFiscalId, vigente: true },
    });
    if (!version) return [];

    const where: any = { poaVersionId: version.id };
    if (programaCodigo) where.programaCodigo = programaCodigo;

    const actividades = await this.prisma.actividadesPoa.findMany({
      where,
      select: { actividadCodigo: true, actividadNombre: true, programaCodigo: true },
      orderBy: { actividadCodigo: "asc" },
      distinct: ["actividadCodigo"],
    });

    return actividades.map((a) => ({
      codigo: a.actividadCodigo,
      nombre: a.actividadNombre || a.actividadCodigo,
      programaCodigo: a.programaCodigo,
    }));
  }
}

export class ListarItemsPoaUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(periodoFiscalId: string, programaCodigo?: string, actividadCodigo?: string) {
    if (!esUuidValido(periodoFiscalId)) return [];
    const version = await this.prisma.poaVersion.findFirst({
      where: { periodoFiscalId, vigente: true },
    });
    if (!version) return [];

    const where: any = { poaVersionId: version.id };
    if (programaCodigo) where.programaCodigo = programaCodigo;
    if (actividadCodigo) where.actividadCodigo = actividadCodigo;

    const items = await this.prisma.actividadesPoa.findMany({
      where,
      select: { itemCodigo: true, itemNombre: true, programaCodigo: true, actividadCodigo: true },
      orderBy: { itemCodigo: "asc" },
      distinct: ["itemCodigo"],
    });

    return items.map((i) => ({
      codigo: i.itemCodigo,
      nombre: i.itemNombre || i.itemCodigo,
      programaCodigo: i.programaCodigo,
      actividadCodigo: i.actividadCodigo,
    }));
  }
}

export class ListarFuentesPoaUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(periodoFiscalId: string, itemCodigo?: string) {
    if (!esUuidValido(periodoFiscalId)) return [];
    const version = await this.prisma.poaVersion.findFirst({
      where: { periodoFiscalId, vigente: true },
    });
    if (!version) return [];

    const where: any = { poaVersionId: version.id };
    if (itemCodigo) where.itemCodigo = itemCodigo;

    const fuentes = await this.prisma.actividadesPoa.findMany({
      where,
      select: { fuenteCodigo: true, fuenteNombre: true, itemCodigo: true },
      orderBy: { fuenteCodigo: "asc" },
      distinct: ["fuenteCodigo"],
    });

    return fuentes.map((f) => ({
      codigo: f.fuenteCodigo,
      nombre: f.fuenteNombre || f.fuenteCodigo,
      itemCodigo: f.itemCodigo,
    }));
  }
}

export class ConsultarSaldoActividadUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(params: {
    periodoFiscalId: string;
    programaCodigo: string;
    actividadCodigo: string;
    itemCodigo: string;
    fuenteCodigo: string;
  }): Promise<{ saldoDisponible: number; montoPlanificado: number } | null> {
    if (!esUuidValido(params.periodoFiscalId)) return null;
    const version = await this.prisma.poaVersion.findFirst({
      where: { periodoFiscalId: params.periodoFiscalId, vigente: true },
    });
    if (!version) return null;

    const actividad = await this.prisma.actividadesPoa.findFirst({
      where: {
        poaVersionId: version.id,
        programaCodigo: params.programaCodigo,
        actividadCodigo: params.actividadCodigo,
        itemCodigo: params.itemCodigo,
        fuenteCodigo: params.fuenteCodigo,
      },
    });

    if (!actividad) return null;

    return {
      saldoDisponible: Number(actividad.saldoDisponible),
      montoPlanificado: Number(actividad.montoPlanificado),
    };
  }
}
