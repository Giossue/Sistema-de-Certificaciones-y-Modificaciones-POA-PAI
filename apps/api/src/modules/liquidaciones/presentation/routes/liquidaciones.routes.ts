import { Context, Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { requirePermission } from "../../../../common/guards/auth.guard";
import { NotFoundError, ValidationError } from "../../../../common/errors/http-error.map";
import { AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { centavosToDecimal, decimalToCentavos } from "../../../saldos/domain/saldo-calculator";

const prisma = new PrismaClient();
const auditoriaService = new AuditoriaService(prisma);
const app = new Hono();

type AuthUser = { id: string; rol: string };

function userFrom(c: Context): AuthUser {
  return c.get("user") as AuthUser;
}

function normalizarMonto(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) throw new ValidationError("monto debe ser un decimal positivo");
  const [integerPart, decimalPart = ""] = raw.split(".");
  return `${integerPart}.${decimalPart.padEnd(2, "0")}`;
}

async function montoLiquidado(certificacionId: string): Promise<bigint> {
  const liquidaciones = await prisma.liquidacionCertificacion.findMany({
    where: { certificacionId },
    select: { monto: true },
  });
  return liquidaciones.reduce((acc, item) => acc + decimalToCentavos(item.monto), 0n);
}

app.get("/", requirePermission("liquidacion.ver"), async (c) => {
  const user = userFrom(c);
  const where: any = {};
  if (user.rol === "unidad") where.certificacion = { solicitanteId: user.id };
  const data = await prisma.liquidacionCertificacion.findMany({
    where,
    include: { certificacion: { include: { actividad: true } }, usuario: { select: { id: true, nombre: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return c.json({ success: true, data: data.map((l) => ({ ...l, monto: Number(l.monto) })) });
});

app.post("/", requirePermission("liquidacion.crear"), async (c) => {
  const user = userFrom(c);
  const body = await c.req.json();
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

  const liquidado = await montoLiquidado(cert.id);
  const restante = decimalToCentavos(cert.monto) - liquidado;
  if (restante <= 0n) throw new ValidationError("La certificación no tiene saldo certificado restante");
  const monto = tipo === "total" ? centavosToDecimal(restante) : normalizarMonto(body.monto);
  const montoCentavos = decimalToCentavos(monto);
  if (montoCentavos <= 0n || montoCentavos > restante) throw new ValidationError("Monto de liquidación inválido");

  const liquidacion = await prisma.$transaction(async (tx) => {
    const registro = await tx.liquidacionCertificacion.create({
      data: { certificacionId: cert.id, usuarioId: user.id, tipo, modo, monto, motivo },
    });

    if (modo === "A" && cert.actividadId) {
      const saldoActual = decimalToCentavos(cert.actividad?.saldoDisponible ?? "0");
      await tx.actividadesPoa.update({
        where: { id: cert.actividadId },
        data: { saldoDisponible: centavosToDecimal(saldoActual + montoCentavos) },
      });
    }

    const nuevoRestante = restante - montoCentavos;
    await tx.certificacion.update({
      where: { id: cert.id },
      data: { estado: nuevoRestante === 0n ? (modo === "A" ? "liquidada_a" : "liquidada_b") : "en_uso" },
    });

    return registro;
  });

  await auditoriaService.registrar({
    usuarioId: user.id,
    entidad: "Certificacion",
    entidadId: cert.id,
    accion: `LIQUIDAR_MODO_${modo}`,
    estadoAnterior: cert.estado,
    estadoNuevo: tipo === "total" ? (modo === "A" ? "liquidada_a" : "liquidada_b") : "en_uso",
    motivo,
  });
  return c.json({ success: true, data: { ...liquidacion, monto: Number(liquidacion.monto) } }, 201);
});

export default app;
