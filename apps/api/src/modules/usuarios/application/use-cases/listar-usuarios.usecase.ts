import { PrismaClient } from "@prisma/client";

export class ListarUsuariosUsecase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute() {
    return this.prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { nombre: "asc" },
    });
  }
}
