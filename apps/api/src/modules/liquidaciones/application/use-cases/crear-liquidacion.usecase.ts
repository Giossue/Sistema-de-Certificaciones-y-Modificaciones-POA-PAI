import { PrismaClient } from "@prisma/client";
import { NotFoundError, ValidationError } from "../../../../common/errors/http-error.map";
import { AuditoriaParams, AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { centavosToDecimal, decimalToCentavos } from "../../../saldos/domain/saldo-calculator";
import { AuthUser } from "../../../../common/http/context.helpers";
import { toLiquidacionItem } from "../../presentation/serializers/liquidacion.serializer";
import { normalizarMonto } from "../services/liquidacion-normalizadores.service";

type AuditMeta = Pick<AuditoriaParams, "rol" | "ip" | "userAgent">;

type CrearLiquidacionParams = {
  prisma: PrismaClient;
  auditoriaService: AuditoriaService;
  user: AuthUser;
  body: any;
  auditMeta: AuditMeta;
};

async function montoLiquidado(prisma: PrismaClient, certificacionId: string): Promise<bigint> {
  const liquidaciones = await prisma.liquidacionCertificacion.findMany({
    where: { certificacionId, estado: "aprobada" },
    select: { monto: true },
  });
  return liquidaciones.reduce((acc, item) => acc + decimalToCentavos(item.monto), 0n);
}

export async function crearLiquidacion(params: CrearLiquidacionParams) {
  const { prisma, auditoriaService, user, body, auditMeta } = params;
  const certificacionId = String(body.certificacionId || "");
  const tipo = String(body.tipo || "").toLowerCase();
  const modo = String(body.modo || "").toUpperCase();
  const motivo = String(body.motivo || "").trim() || undefined;
  if (!certificacionId) throw new ValidationError("certificacionId es requerido");
  if (!["total", "parcial"].includes(tipo)) throw new ValidationError("tipo debe ser total o parcial");
  if (!["A", "B"].includes(modo)) throw new ValidationError("modo debe ser A o B");

  const cert = await prisma.certificacion.findUnique({ where: { id: certificacionId }, include: { actividad: true } });
  if (!cert) throw new NotFoundError("Certificación", certificacionId);
  if (!["suscrita", "en_uso"].includes(cert.estado)) {
    throw new ValidationError("La certificación no está en un estado compatible para liquidación");
  }

  const liquidado = await montoLiquidado(prisma, cert.id);
  const restante = decimalToCentavos(cert.monto) - liquidado;
  if (restante <= 0n) throw new ValidationError("La certificación no tiene saldo certificado restante");
  const monto = tipo === "total" ? centavosToDecimal(restante) : normalizarMonto(body.monto);
  const montoCentavos = decimalToCentavos(monto);
  if (montoCentavos <= 0n || montoCentavos > restante) throw new ValidationError("Monto de liquidación inválido");

  const liquidacion = await prisma.$transaction(async (tx) => {
    return tx.liquidacionCertificacion.create({
      data: { certificacionId: cert.id, usuarioId: user.id, tipo, modo, monto, motivo, estado: "solicitada" },
    });
  });

  await auditoriaService.registrar({
    usuarioId: user.id,
    entidad: "Certificacion",
    entidadId: cert.id,
    accion: `SOLICITAR_LIQUIDACION_MODO_${modo}`,
    estadoAnterior: cert.estado,
    estadoNuevo: cert.estado,
    motivo,
    ...auditMeta,
    payloadNuevo: { liquidacionId: liquidacion.id, tipo, modo, monto },
  });
  return toLiquidacionItem(liquidacion);
}
