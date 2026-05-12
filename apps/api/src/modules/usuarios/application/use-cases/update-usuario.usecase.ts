import { PrismaClient } from "@prisma/client";
import { UpdateUsuarioDto } from "../dto/update-usuario.dto";
import { NotFoundError, ValidationError } from "../../../../common/errors/http-error.map";

export class UpdateUsuarioUsecase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(id: string, dto: UpdateUsuarioDto) {
    const existente = await this.prisma.usuario.findUnique({ where: { id } });
    if (!existente) {
      throw new NotFoundError(`Usuario con ID ${id} no encontrado`);
    }

    if (dto.activo === false && existente.rol === "admin") {
      throw new ValidationError("No se puede desactivar un usuario administrador");
    }

    const updated = await this.prisma.usuario.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }
}
