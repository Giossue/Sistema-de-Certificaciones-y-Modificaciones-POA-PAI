import { PrismaClient } from "@prisma/client";
import { NotFoundError, ValidationError } from "../../../../common/errors/http-error.map";
import { AuditoriaParams, AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { AuthUser } from "../../../../common/http/context.helpers";

type AuditMeta = Pick<AuditoriaParams, "rol" | "ip" | "userAgent">;

type ClasificarDevolucionFinancieroParams = {
  prisma: PrismaClient;
  auditoriaService: AuditoriaService;
  id: string;
  user: AuthUser;
  body: any;
  auditMeta: AuditMeta;
};

export async function clasificarDevolucionFinanciero(params: ClasificarDevolucionFinancieroParams) {
  const { prisma, auditoriaService, id, user, body, auditMeta } = params;
  const clasificacion = String(body.clasificacion || "").trim();
  if (!clasificacion) throw new ValidationError("clasificacion es requerida");
  const current = await prisma.devolucionFinanciero.findUnique({ where: { id } });
  if (!current) throw new NotFoundError("Devolución", id);
  const data = await prisma.devolucionFinanciero.update({
    where: { id },
    data: {
      clasificacion,
      reglaAsociada: body.reglaAsociada || current.reglaAsociada,
      cubiertaPorSistema: body.cubiertaPorSistema === undefined ? current.cubiertaPorSistema : Boolean(body.cubiertaPorSistema),
      improcedente: body.improcedente === undefined ? current.improcedente : Boolean(body.improcedente),
    },
  });
  await auditoriaService.registrar({
    usuarioId: user.id,
    entidad: "DevolucionFinanciero",
    entidadId: id,
    accion: "CLASIFICAR_DEVOLUCION",
    motivo: clasificacion,
    ...auditMeta,
    payloadAnterior: { clasificacion: current.clasificacion, reglaAsociada: current.reglaAsociada },
    payloadNuevo: { clasificacion: data.clasificacion, reglaAsociada: data.reglaAsociada },
  });
  return data;
}
