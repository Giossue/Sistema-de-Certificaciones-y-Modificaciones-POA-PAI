import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ConflictError } from "../../../../common/errors/http-error.map";
import { CreateUsuarioDto } from "../dto/create-usuario.dto";

export class CrearUsuarioUsecase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: CreateUsuarioDto) {
    const existente = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (existente) {
      throw new ConflictError(`Ya existe un usuario con el correo ${dto.email}`);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        email: dto.email,
        password: passwordHash,
        nombre: dto.nombre,
        rol: dto.rol,
        activo: true,
      },
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

    return usuario;
  }
}
