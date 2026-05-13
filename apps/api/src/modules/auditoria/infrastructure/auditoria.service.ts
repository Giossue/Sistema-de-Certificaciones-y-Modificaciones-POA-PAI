import { Prisma, PrismaClient } from "@prisma/client";

export interface AuditoriaParams {
  usuarioId: string;
  rol?: string;
  entidad: string;
  entidadId: string;
  accion: string;
  estadoAnterior?: string;
  estadoNuevo?: string;
  payloadAnterior?: Prisma.InputJsonValue;
  payloadNuevo?: Prisma.InputJsonValue;
  motivo?: string;
  ip?: string;
  userAgent?: string;
}

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export class AuditoriaService {
  constructor(private readonly prisma: PrismaClient) {}

  async registrar(params: AuditoriaParams): Promise<void> {
    // Skip si el usuarioId no es un UUID valido (ej: "sistema", "admin")
    if (!isValidUUID(params.usuarioId)) {
      return;
    }

    try {
      await this.prisma.auditoria.create({
        data: {
          usuarioId: params.usuarioId,
          entidad: params.entidad,
          entidadId: params.entidadId,
          accion: params.accion,
          estadoAnterior: params.estadoAnterior,
          estadoNuevo: params.estadoNuevo,
          rol: params.rol,
          payloadAnterior: params.payloadAnterior,
          payloadNuevo: params.payloadNuevo,
          motivo: params.motivo,
          ip: params.ip,
          userAgent: params.userAgent,
        },
      });
    } catch (err) {
      // Log pero no falla el flujo principal
      console.warn("Auditoria fallida:", err);
    }
  }
}

export function auditoriaMeta(c: { req: { header: (name: string) => string | undefined } }, user?: { rol?: string }) {
  return {
    rol: user?.rol,
    ip: c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || c.req.header("x-real-ip"),
    userAgent: c.req.header("user-agent"),
  };
}
