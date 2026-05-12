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

app.get("/", requirePermission("anulacion.ver"), async (c) => {
  const user = userFrom(c);
  const where: any = {};
  if (user.rol === "unidad") where.certificacion = { solicitanteId: user.id };
  const data = await prisma.anulacionCertificacion.findMany({
    where,
    include: { certificacion: { include: { actividad: true } }, usuario: { select: { id: true, nombre: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return c.json({ success: true, data: data.map((a) => ({ ...a, montoLiberado: Number(a.montoLiberado) })) });
});

app.post("/", requirePermission("anulacion.crear"), async (c) => {
  const user = userFrom(c);
  const body = await c.req.json();
  const certificacionId = String(body.certificacionId || "");
  const motivo = String(body.motivo || "").trim();
  if (!certificacionId) throw new ValidationError("certificacionId es requerido");
  if (!motivo) throw new ValidationError("motivo es requerido");

  const cert = await prisma.certificacion.findUnique({
    where: { id: certificacionId },
    include: { actividad: true, liquidaciones: true, anulacion: true },
  });
  if (!cert) throw new NotFoundError("Certificación", certificacionId);
  if (cert.anulacion) throw new ValidationError("La certificación ya fue anulada");
  if (cert.liquidaciones.length > 0 || cert.estado === "en_uso") {
    throw new ValidationError("La certificación tiene uso; debe liquidarse");
  }
  if (!["suscrita", "generada"].includes(cert.estado)) {
    throw new ValidationError("Solo se puede anular una certificación generada o suscrita sin uso");
  }

  const montoLiberado = cert.estado === "suscrita" ? cert.monto.toString() : "0.00";
  const anulacion = await prisma.$transaction(async (tx) => {
    if (cert.estado === "suscrita" && cert.actividadId) {
      const saldoActual = decimalToCentavos(cert.actividad?.saldoDisponible ?? "0");
      await tx.actividadesPoa.update({
        where: { id: cert.actividadId },
        data: { saldoDisponible: centavosToDecimal(saldoActual + decimalToCentavos(montoLiberado)) },
      });
    }
    const registro = await tx.anulacionCertificacion.create({
      data: { certificacionId: cert.id, usuarioId: user.id, motivo, montoLiberado },
    });
    await tx.certificacion.update({ where: { id: cert.id }, data: { estado: "anulada", observaciones: motivo } });
    return registro;
  });

  await auditoriaService.registrar({
    usuarioId: user.id,
    entidad: "Certificacion",
    entidadId: cert.id,
    accion: "ANULAR",
    estadoAnterior: cert.estado,
    estadoNuevo: "anulada",
    motivo,
  });
  return c.json({ success: true, data: { ...anulacion, montoLiberado: Number(anulacion.montoLiberado) } }, 201);
});

export default app;
