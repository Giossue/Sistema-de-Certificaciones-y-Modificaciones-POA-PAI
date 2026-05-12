import { PrismaClient } from "@prisma/client";
import { NotFoundError, ValidationError } from "../../../../common/errors/http-error.map";

export class DeleteUsuarioUsecase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(id: string) {
    const existente = await this.prisma.usuario.findUnique({ where: { id } });
    if (!existente) {
      throw new NotFoundError(`Usuario con ID ${id} no encontrado`);
    }

    if (existente.rol === "admin") {
      throw new ValidationError("No se puede eliminar un usuario administrador");
    }

    await this.prisma.usuario.delete({ where: { id } });
  }
}
