import { PrismaClient, Usuario } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { env } from "../../../../config/env";
import { AuthRepository } from "../../domain/repositories/auth.repository";

export class AuthRepositoryImpl implements AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  async verificarPassword(hash: string, password: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async generarToken(payload: { sub: string; email: string; rol: string }): Promise<string> {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    return new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(env.JWT_EXPIRES_IN)
      .sign(secret);
  }

  async verificarToken(token: string): Promise<{ sub: string; email: string; rol: string } | null> {
    try {
      const secret = new TextEncoder().encode(env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret, { clockTolerance: 60 });
      return {
        sub: payload.sub as string,
        email: payload.email as string,
        rol: payload.rol as string,
      };
    } catch {
      return null;
    }
  }
}
