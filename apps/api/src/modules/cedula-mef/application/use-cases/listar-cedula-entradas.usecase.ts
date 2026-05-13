import { PrismaClient } from "@prisma/client";

export class ListarCedulaEntradasUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(params: {
    versionId: string;
    page?: number;
    pageSize?: number;
    filtro?: string;
  }) {
    const { versionId, page = 1, pageSize = 10, filtro } = params;

    const where: any = { versionId };

    if (filtro) {
      where.OR = [
        { programaCodigo: { contains: filtro, mode: "insensitive" } },
        { programaNombre: { contains: filtro, mode: "insensitive" } },
        { actividadCodigo: { contains: filtro, mode: "insensitive" } },
        { actividadNombre: { contains: filtro, mode: "insensitive" } },
        { itemCodigo: { contains: filtro, mode: "insensitive" } },
        { fuenteCodigo: { contains: filtro, mode: "insensitive" } },
      ];
    }

    const [total, entradas] = await this.prisma.$transaction([
      this.prisma.cedulaMefEntrada.count({ where }),
      this.prisma.cedulaMefEntrada.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "asc" },
      }),
    ]);

    return {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      datos: entradas,
    };
  }
}
