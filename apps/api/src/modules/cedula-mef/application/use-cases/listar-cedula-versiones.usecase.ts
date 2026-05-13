import { PrismaClient } from "@prisma/client";

export class ListarCedulaVersionesUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(periodoFiscalId: string, params?: { page?: number; pageSize?: number }) {
    const page = Math.max(1, Number(params?.page || 1));
    const pageSize = Math.min(200, Math.max(1, Number(params?.pageSize || 10)));
    const hasPaging = Boolean(params?.page || params?.pageSize);
    const query = {
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
    } as const;
    const [totalItems, versiones] = hasPaging
      ? await Promise.all([
          this.prisma.cedulaMefVersion.count({ where: query.where }),
          this.prisma.cedulaMefVersion.findMany({ ...query, skip: (page - 1) * pageSize, take: pageSize }),
        ])
      : [0, await this.prisma.cedulaMefVersion.findMany(query)];

    const items = versiones.map((v) => ({
      id: v.id,
      archivoNombre: v.archivoNombre,
      archivoHash: v.archivoHash,
      corteFecha: v.corteFecha,
      vigente: v.vigente,
      importadoPor: v.importadoPor,
      createdAt: v.createdAt,
      totalEntradas: v._count.entradas,
    }));

    if (!hasPaging) return items;
    return { items, totalItems, page, pageSize, totalPages: Math.max(1, Math.ceil(totalItems / pageSize)) };
  }
}
