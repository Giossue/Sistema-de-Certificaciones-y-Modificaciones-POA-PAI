import { PrismaClient } from "@prisma/client";
import { NotFoundError, ValidationError } from "../../../../common/errors/http-error.map";
import { AuditoriaParams, AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { centavosToDecimal, decimalToCentavos } from "../../../saldos/domain/saldo-calculator";
import { AuthUser } from "../../../../common/http/context.helpers";
import { toLiquidacionItem } from "../../presentation/serializers/liquidacion.serializer";

type AuditMeta = Pick<AuditoriaParams, "rol" | "ip" | "userAgent">;

type AprobarLiquidacionParams = {
  prisma: PrismaClient;
  auditoriaService: AuditoriaService;
  id: string;
  user: AuthUser;
  auditMeta: AuditMeta;
};

async function aplicarLiquidacion(prisma: PrismaClient, params: { liquidacionId: string; aprobadaPorId: string }) {
  return prisma.$transaction(async (tx) => {
    const liquidacion = await tx.liquidacionCertificacion.findUnique({
      where: { id: params.liquidacionId },
      include: { certificacion: { include: { actividad: true, liquidaciones: true } } },
    });
    if (!liquidacion) throw new NotFoundError("Liquidación", params.liquidacionId);
    if (liquidacion.estado !== "solicitada") throw new ValidationError("Solo se puede aprobar una liquidación solicitada");

    const cert = liquidacion.certificacion;
    if (!["suscrita", "en_uso"].includes(cert.estado)) {
      throw new ValidationError("La certificación no está en un estado compatible para liquidación");
    }

    const liquidado = cert.liquidaciones
      .filter((item) => item.estado === "aprobada" && item.id !== liquidacion.id)
      .reduce((acc, item) => acc + decimalToCentavos(item.monto), 0n);
    const restante = decimalToCentavos(cert.monto) - liquidado;
    const montoCentavos = decimalToCentavos(liquidacion.monto);
    if (montoCentavos <= 0n || montoCentavos > restante) throw new ValidationError("Monto de liquidación inválido");

    if (liquidacion.modo === "A" && cert.actividadId) {
      const saldoActual = decimalToCentavos(cert.actividad?.saldoDisponible ?? "0");
      await tx.actividadesPoa.update({
        where: { id: cert.actividadId },
        data: { saldoDisponible: centavosToDecimal(saldoActual + montoCentavos) },
      });
    }

    const nuevoRestante = restante - montoCentavos;
    await tx.certificacion.update({
      where: { id: cert.id },
      data: { estado: nuevoRestante === 0n ? (liquidacion.modo === "A" ? "liquidada_a" : "liquidada_b") : "en_uso" },
    });

    return tx.liquidacionCertificacion.update({
      where: { id: liquidacion.id },
      data: { estado: "aprobada", aprobadaPorId: params.aprobadaPorId, approvedAt: new Date() },
    });
  });
}

export async function aprobarLiquidacion(params: AprobarLiquidacionParams) {
  const { prisma, auditoriaService, id, user, auditMeta } = params;
  const liquidacion = await prisma.liquidacionCertificacion.findUnique({ where: { id }, include: { certificacion: true } });
  if (!liquidacion) throw new NotFoundError("Liquidación", id);
  const aplicada = await aplicarLiquidacion(prisma, { liquidacionId: id, aprobadaPorId: user.id });
  await auditoriaService.registrar({
    usuarioId: user.id,
    entidad: "Certificacion",
    entidadId: liquidacion.certificacionId,
    accion: `APROBAR_LIQUIDACION_MODO_${liquidacion.modo}`,
    estadoAnterior: liquidacion.certificacion.estado,
    estadoNuevo: "liquidada",
    motivo: liquidacion.motivo || undefined,
    ...auditMeta,
  });
  return toLiquidacionItem(aplicada);
}
