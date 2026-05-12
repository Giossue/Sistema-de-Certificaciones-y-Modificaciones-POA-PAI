import { PrismaClient } from "@prisma/client";

export class ListarProgramasCedulaUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(periodoFiscalId: string) {
    const version = await this.prisma.cedulaMefVersion.findFirst({
      where: { periodoFiscalId, vigente: true },
    });

    if (!version) return [];

    const programas = await this.prisma.cedulaMefEntrada.findMany({
      where: { versionId: version.id },
      select: { programaCodigo: true, programaNombre: true },
      orderBy: { programaCodigo: "asc" },
      distinct: ["programaCodigo"],
    });

    return programas.map((p) => ({
      codigo: p.programaCodigo,
      nombre: p.programaNombre,
    }));
  }
}

export class ListarActividadesCedulaUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(periodoFiscalId: string, programaCodigo?: string) {
    const version = await this.prisma.cedulaMefVersion.findFirst({
      where: { periodoFiscalId, vigente: true },
    });

    if (!version) return [];

    const where: any = { versionId: version.id };
    if (programaCodigo) {
      where.programaCodigo = programaCodigo;
    }

    const actividades = await this.prisma.cedulaMefEntrada.findMany({
      where,
      select: { actividadCodigo: true, actividadNombre: true, programaCodigo: true },
      orderBy: { actividadCodigo: "asc" },
      distinct: ["actividadCodigo"],
    });

    return actividades.map((a) => ({
      codigo: a.actividadCodigo,
      nombre: a.actividadNombre,
      programaCodigo: a.programaCodigo,
    }));
  }
}

export class ListarItemsCedulaUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(periodoFiscalId: string, programaCodigo?: string, actividadCodigo?: string) {
    const version = await this.prisma.cedulaMefVersion.findFirst({
      where: { periodoFiscalId, vigente: true },
    });

    if (!version) return [];

    const where: any = { versionId: version.id };
    if (programaCodigo) where.programaCodigo = programaCodigo;
    if (actividadCodigo) where.actividadCodigo = actividadCodigo;

    const items = await this.prisma.cedulaMefEntrada.findMany({
      where,
      select: { itemCodigo: true, itemNombre: true, programaCodigo: true, actividadCodigo: true },
      orderBy: { itemCodigo: "asc" },
      distinct: ["itemCodigo"],
    });

    return items.map((i) => ({
      codigo: i.itemCodigo,
      nombre: i.itemNombre,
      programaCodigo: i.programaCodigo,
      actividadCodigo: i.actividadCodigo,
    }));
  }
}

export class ListarFuentesCedulaUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(periodoFiscalId: string, itemCodigo?: string) {
    const version = await this.prisma.cedulaMefVersion.findFirst({
      where: { periodoFiscalId, vigente: true },
    });

    if (!version) return [];

    const where: any = { versionId: version.id };
    if (itemCodigo) where.itemCodigo = itemCodigo;

    const fuentes = await this.prisma.cedulaMefEntrada.findMany({
      where,
      select: { fuenteCodigo: true, fuenteNombre: true, itemCodigo: true },
      orderBy: { fuenteCodigo: "asc" },
      distinct: ["fuenteCodigo"],
    });

    return fuentes.map((f) => ({
      codigo: f.fuenteCodigo,
      nombre: f.fuenteNombre,
      itemCodigo: f.itemCodigo,
    }));
  }
}
