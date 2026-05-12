import { PrismaClient } from "@prisma/client";

export interface CedulaMefVersionEntity {
  id: string;
  periodoFiscalId: string | null;
  archivoNombre: string;
  archivoHash: string;
  corteFecha: Date;
  vigente: boolean;
  totalEntradas: number;
  totalMonto: any;
  importadoPor: string;
  createdAt: Date;
}

export class ConsultarCedulaVigenteUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(periodoFiscalId: string): Promise<CedulaMefVersionEntity | null> {
    const version = await this.prisma.cedulaMefVersion.findFirst({
      where: { periodoFiscalId, vigente: true },
      include: {
        _count: { select: { entradas: true } },
      },
    });

    if (!version) return null;

    const totalMonto = await this.prisma.cedulaMefEntrada.aggregate({
      where: { versionId: version.id },
      _sum: { montoCodificado: true },
    });

    return {
      id: version.id,
      periodoFiscalId: version.periodoFiscalId,
      archivoNombre: version.archivoNombre,
      archivoHash: version.archivoHash,
      corteFecha: version.corteFecha,
      vigente: version.vigente,
      totalEntradas: version._count.entradas,
      totalMonto: totalMonto._sum.montoCodificado ?? new (require("@prisma/client").Prisma).Decimal(0),
      importadoPor: version.importadoPor,
      createdAt: version.createdAt,
    };
  }
}