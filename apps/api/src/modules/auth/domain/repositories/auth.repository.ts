import { Usuario } from "@prisma/client";
import { Credenciales } from "../entities/credenciales.entity";

export interface AuthRepository {
  buscarPorEmail(email: string): Promise<Usuario | null>;
  verificarPassword(hash: string, password: string): Promise<boolean>;
  generarToken(payload: { sub: string; email: string; rol: string }): Promise<string>;
  verificarToken(token: string): Promise<{ sub: string; email: string; rol: string } | null>;
}

export const AUTH_REPOSITORY = Symbol("AuthRepository");
