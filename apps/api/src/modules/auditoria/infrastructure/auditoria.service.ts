import { PrismaClient } from "@prisma/client";

export interface AuditoriaParams {
  usuarioId: string;
  entidad: string;
  entidadId: string;
  accion: string;
  estadoAnterior?: string;
  estadoNuevo?: string;
  motivo?: string;
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
          motivo: params.motivo,
        },
      });
    } catch (err) {
      // Log pero no falla el flujo principal
      console.warn("Auditoria fallida:", err);
    }
  }
}