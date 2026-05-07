import { PrismaClient } from "@prisma/client";

export class ListarCatalogosUsecase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute() {
    const [programas, actividades, items, fuentes] = await Promise.all([
      this.prisma.catalogoPrograma.findMany({
        where: { activo: true },
        orderBy: { nombre: "asc" },
      }),
      this.prisma.catalogoActividad.findMany({
        where: { activo: true },
        orderBy: { nombre: "asc" },
      }),
      this.prisma.catalogoItem.findMany({
        where: { activo: true },
        orderBy: { nombre: "asc" },
      }),
      this.prisma.catalogoFuente.findMany({
        where: { activo: true },
        orderBy: { nombre: "asc" },
      }),
    ]);

    return { programas, actividades, items, fuentes };
  }
}
