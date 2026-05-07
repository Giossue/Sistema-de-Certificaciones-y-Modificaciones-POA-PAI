import { Context, Next } from "hono";
import { jwtVerify } from "jose";
import { env } from "../../config/env";
import { UnauthorizedError } from "../errors/http-error.map";

export async function authGuard(c: Context, next: Next) {
  const authHeader = c.req.header("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Token de autenticación requerido");
  }

  const token = authHeader.substring(7);

  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, { clockTolerance: 60 });
    c.set("user", {
      id: payload.sub as string,
      email: payload.email as string,
      rol: payload.rol as string,
    });
    await next();
  } catch {
    throw new UnauthorizedError("Token inválido o expirado");
  }
}
