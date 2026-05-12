import { Context, Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { requirePermission } from "../../../../common/guards/auth.guard";
import { ValidationError } from "../../../../common/errors/http-error.map";
import { AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";

const prisma = new PrismaClient();
const auditoriaService = new AuditoriaService(prisma);
const app = new Hono();

const causas = [
  "Estructura presupuestaria inválida",
  "Saldo insuficiente",
  "Ítem incorrecto",
  "Fuente incorrecta",
  "Documento incompleto",
  "Cambio de cédula posterior",
  "Error operativo externo",
  "Otro",
];

function userFrom(c: Context) {
  return c.get("user") as { id: string; rol: string };
}

app.get("/causas", requirePermission("devolucion.ver"), (c) => c.json({ success: true, data: causas }));

app.get("/", requirePermission("devolucion.ver"), async (c) => {
  const user = userFrom(c);
  const where: any = {};
  if (user.rol === "unidad") where.usuarioId = user.id;
  const data = await prisma.devolucionFinanciero.findMany({
    where,
    include: {
      certificacion: { include: { actividad: true } },
      usuario: { select: { id: true, nombre: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return c.json({ success: true, data });
});

app.post("/", requirePermission("devolucion.crear"), async (c) => {
  const user = userFrom(c);
  const body = await c.req.json();
  const causa = String(body.causa || "").trim();
  const descripcion = String(body.descripcion || "").trim();
  if (!causa || !causas.includes(causa)) throw new ValidationError("causa es requerida y debe venir del catálogo");
  if (!descripcion) throw new ValidationError("descripcion es requerida");
  const data = await prisma.devolucionFinanciero.create({
    data: {
      usuarioId: user.id,
      certificacionId: body.certificacionId || null,
      causa,
      descripcion,
      reglaAsociada: body.reglaAsociada || null,
      cubiertaPorSistema: Boolean(body.cubiertaPorSistema),
      improcedente: Boolean(body.improcedente),
    },
  });
  await auditoriaService.registrar({
    usuarioId: user.id,
    entidad: "DevolucionFinanciero",
    entidadId: data.id,
    accion: "REGISTRAR_DEVOLUCION",
    motivo: causa,
  });
  return c.json({ success: true, data }, 201);
});

export default app;
