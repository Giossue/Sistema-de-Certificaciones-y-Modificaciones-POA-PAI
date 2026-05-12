import { PrismaClient } from "@prisma/client";

export class ListarCedulaVersionesUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(periodoFiscalId: string) {
    const versiones = await this.prisma.cedulaMefVersion.findMany({
      where: { periodoFiscalId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        archivoNombre: true,
        archivoHash: true,
        corteFecha: true,
        vigente: true,
        importadoPor: true,
        createdAt: true,
        _count: { select: { entradas: true } },
      },
    });

    return versiones.map((v) => ({
      id: v.id,
      archivoNombre: v.archivoNombre,
      archivoHash: v.archivoHash,
      corteFecha: v.corteFecha,
      vigente: v.vigente,
      importadoPor: v.importadoPor,
      createdAt: v.createdAt,
      totalEntradas: v._count.entradas,
    }));
  }
}