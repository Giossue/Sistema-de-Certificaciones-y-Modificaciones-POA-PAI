import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { env } from "../../../../config/env";
import { UnauthorizedError } from "../../../../common/errors/http-error.map";
import { LoginDto } from "../dto/login.dto";

export class LoginUsecase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: LoginDto): Promise<{
    token: string;
    usuario: { id: string; email: string; nombre: string; rol: string };
  }> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedError("Credenciales inválidas");
    }

    const passwordValida = await bcrypt.compare(dto.password, usuario.password);
    if (!passwordValida) {
      throw new UnauthorizedError("Credenciales inválidas");
    }

    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const token = await new SignJWT({
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      nombre: usuario.nombre,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(env.JWT_EXPIRES_IN)
      .sign(secret);

    return {
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    };
  }
}
