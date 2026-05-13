import { Context, Next } from "hono";
import { jwtVerify } from "jose";
import { env } from "../../config/env";
import { ForbiddenError, UnauthorizedError } from "../errors/http-error.map";

export type Permission =
  | "usuarios.gestionar"
  | "roles.ver"
  | "catalogos.ver"
  | "periodos.ver"
  | "periodos.gestionar"
  | "cedula.importar"
  | "cedula.ver"
  | "cedula.comparar"
  | "poa.ver"
  | "poa.versionar"
  | "poa.actividad.ver"
  | "saldos.ver"
  | "certificacion.crear"
  | "certificacion.ver"
  | "certificacion.aprobar"
  | "certificacion.observar"
  | "certificacion.suscribir"
  | "certificacion.marcar_uso"
  | "modificacion.crear"
  | "modificacion.ver"
  | "modificacion.observar"
  | "modificacion.suscribir"
  | "modificacion.aprobar"
  | "liquidacion.crear"
  | "liquidacion.aprobar"
  | "liquidacion.ver"
  | "anulacion.crear"
  | "anulacion.aprobar"
  | "anulacion.ver"
  | "devolucion.crear"
  | "devolucion.clasificar"
  | "devolucion.ver"
  | "reporte.ver";

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    "usuarios.gestionar",
    "roles.ver",
    "catalogos.ver",
    "periodos.ver",
    "periodos.gestionar",
    "cedula.importar",
    "cedula.ver",
    "cedula.comparar",
    "poa.ver",
    "poa.versionar",
    "poa.actividad.ver",
    "saldos.ver",
    "certificacion.crear",
    "certificacion.ver",
    "certificacion.aprobar",
    "certificacion.observar",
    "certificacion.suscribir",
    "certificacion.marcar_uso",
    "modificacion.crear",
    "modificacion.ver",
    "modificacion.observar",
    "modificacion.suscribir",
    "modificacion.aprobar",
    "liquidacion.crear",
    "liquidacion.aprobar",
    "liquidacion.ver",
    "anulacion.crear",
    "anulacion.aprobar",
    "anulacion.ver",
    "devolucion.crear",
    "devolucion.clasificar",
    "devolucion.ver",
    "reporte.ver",
  ],
  director: [
    "roles.ver",
    "catalogos.ver",
    "periodos.ver",
    "cedula.ver",
    "cedula.comparar",
    "poa.ver",
    "poa.actividad.ver",
    "saldos.ver",
    "certificacion.ver",
    "certificacion.observar",
    "certificacion.suscribir",
    "certificacion.marcar_uso",
    "modificacion.ver",
    "modificacion.observar",
    "modificacion.suscribir",
    "modificacion.aprobar",
    "liquidacion.crear",
    "liquidacion.aprobar",
    "liquidacion.ver",
    "anulacion.crear",
    "anulacion.aprobar",
    "anulacion.ver",
    "devolucion.crear",
    "devolucion.clasificar",
    "devolucion.ver",
    "reporte.ver",
  ],
  analista: [
    "catalogos.ver",
    "periodos.ver",
    "cedula.importar",
    "cedula.ver",
    "cedula.comparar",
    "poa.ver",
    "poa.versionar",
    "poa.actividad.ver",
    "saldos.ver",
    "certificacion.ver",
    "certificacion.aprobar",
    "certificacion.observar",
    "modificacion.ver",
    "modificacion.observar",
    "modificacion.aprobar",
    "liquidacion.aprobar",
    "liquidacion.ver",
    "anulacion.aprobar",
    "anulacion.ver",
    "devolucion.clasificar",
    "devolucion.ver",
    "reporte.ver",
  ],
  unidad: [
    "catalogos.ver",
    "periodos.ver",
    "cedula.ver",
    "poa.ver",
    "poa.actividad.ver",
    "saldos.ver",
    "certificacion.crear",
    "certificacion.ver",
    "modificacion.crear",
    "modificacion.ver",
    "liquidacion.crear",
    "liquidacion.ver",
    "anulacion.crear",
    "anulacion.ver",
    "devolucion.crear",
    "devolucion.ver",
  ],
  financiero: [
    "catalogos.ver",
    "periodos.ver",
    "cedula.ver",
    "poa.ver",
    "poa.actividad.ver",
    "saldos.ver",
    "certificacion.ver",
    "certificacion.marcar_uso",
    "liquidacion.ver",
    "anulacion.ver",
    "devolucion.crear",
    "devolucion.clasificar",
    "devolucion.ver",
    "reporte.ver",
  ],
  bienes: [
    "catalogos.ver",
    "periodos.ver",
    "cedula.ver",
    "poa.ver",
    "poa.actividad.ver",
    "saldos.ver",
    "certificacion.ver",
    "modificacion.crear",
    "modificacion.ver",
  ],
};

export function getPermissionsForRole(rol: string): Permission[] {
  return ROLE_PERMISSIONS[rol] ?? [];
}

export async function authGuard(c: Context, next: Next) {
  const authHeader = c.req.header("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Token de autenticación requerido");
  }

  const token = authHeader.substring(7);
  let payload: any;

  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const verified = await jwtVerify(token, secret, { clockTolerance: 60 });
    payload = verified.payload;
  } catch {
    throw new UnauthorizedError("Token inválido o expirado");
  }

  const rol = payload.rol as string;
  c.set("user", {
    id: payload.sub as string,
    email: payload.email as string,
    rol,
    nombre: payload.nombre as string,
    permisos: getPermissionsForRole(rol),
  });
  await next();
}

export function requirePermission(permission: Permission) {
  return async (c: Context, next: Next) => {
    const user = c.get("user") as { permisos?: Permission[]; rol?: string } | undefined;
    if (!user) {
      throw new UnauthorizedError("Token de autenticación requerido");
    }
    if (!user.permisos?.includes(permission)) {
      throw new ForbiddenError(`Permiso requerido: ${permission}`);
    }
    await next();
  };
}
