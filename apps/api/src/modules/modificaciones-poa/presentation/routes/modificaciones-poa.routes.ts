import { Context, Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { requirePermission } from "../../../../common/guards/auth.guard";
import { NotFoundError, ValidationError } from "../../../../common/errors/http-error.map";
import { AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { centavosToDecimal, decimalToCentavos } from "../../../saldos/domain/saldo-calculator";
import { ModificacionDocumentosService } from "../../infrastructure/modificacion-documentos.service";

const prisma = new PrismaClient();
const auditoriaService = new AuditoriaService(prisma);
const documentosService = new ModificacionDocumentosService();
const app = new Hono();

type AuthUser = { id: string; rol: string };

const motivosBase = ["Regulación SBYE", "Discrepancia detectada por bienes", "Valor real superior al planeado", "Otro"];
const estadosVigentesCert = ["solicitada", "observada", "generada", "suscrita", "en_uso"];

function userFrom(c: Context): AuthUser {
  return c.get("user") as AuthUser;
}

function normalizarMonto(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) throw new ValidationError("montoPlanificadoNuevo debe ser un decimal positivo");
  const [integerPart, decimalPart = ""] = raw.split(".");
  return `${integerPart}.${decimalPart.padEnd(2, "0")}`;
}

function param(c: Context, name: string): string {
  const value = c.req.param(name);
  if (!value) throw new ValidationError(`${name} es requerido`);
  return value;
}

async function serializar(id: string) {
  const mod = await prisma.modificacionPoa.findUnique({
    where: { id },
    include: {
      solicitante: { select: { id: true, nombre: true, email: true } },
      analista: { select: { id: true, nombre: true, email: true } },
      director: { select: { id: true, nombre: true, email: true } },
    },
  });
  if (!mod) throw new NotFoundError("Modificación POA", id);
  return {
    id: mod.id,
    numero: mod.numero,
    estado: mod.estado,
    motivo: mod.motivo,
    observaciones: mod.observaciones,
    periodoFiscalId: mod.periodoFiscalId,
    actividadOrigenId: mod.actividadOrigenId,
    informeRuta: mod.informeRuta,
    nuevaPoaVersionId: mod.nuevaPoaVersionId,
    nuevaActividadId: mod.nuevaActividadId,
    anterior: {
      programaCodigo: mod.programaCodigoAnterior,
      programaNombre: mod.programaNombreAnterior,
      actividadCodigo: mod.actividadCodigoAnterior,
      actividadNombre: mod.actividadNombreAnterior,
      itemCodigo: mod.itemCodigoAnterior,
      itemNombre: mod.itemNombreAnterior,
      fuenteCodigo: mod.fuenteCodigo,
      fuenteNombre: mod.fuenteNombre,
      montoPlanificado: Number(mod.montoPlanificadoAnterior),
    },
    nuevo: {
      programaCodigo: mod.programaCodigoNuevo,
      programaNombre: mod.programaNombreNuevo,
      actividadCodigo: mod.actividadCodigoNuevo,
      actividadNombre: mod.actividadNombreNuevo,
      itemCodigo: mod.itemCodigoNuevo,
      itemNombre: mod.itemNombreNuevo,
      fuenteCodigo: mod.fuenteCodigo,
      fuenteNombre: mod.fuenteNombre,
      montoPlanificado: Number(mod.montoPlanificadoNuevo),
    },
    solicitante: mod.solicitante,
    analista: mod.analista,
    director: mod.director,
    createdAt: mod.createdAt,
    updatedAt: mod.updatedAt,
  };
}

app.get("/motivos", requirePermission("modificacion.ver"), (c) => c.json({ success: true, data: motivosBase }));

app.get("/", requirePermission("modificacion.ver"), async (c) => {
  const user = userFrom(c);
  const where: any = {};
  if (user.rol === "unidad") where.solicitanteId = user.id;
  const mods = await prisma.modificacionPoa.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return c.json({ success: true, data: await Promise.all(mods.map((m) => serializar(m.id))) });
});

app.post("/", requirePermission("modificacion.crear"), async (c) => {
  const user = userFrom(c);
  const body = await c.req.json();
  const actividadId = String(body.actividadId || "");
  const motivo = String(body.motivo || "").trim();
  const montoNuevo = normalizarMonto(body.montoPlanificadoNuevo);
  if (!actividadId) throw new ValidationError("actividadId es requerido");
  if (!motivo || !motivosBase.includes(motivo)) throw new ValidationError("motivo es requerido y debe venir del catálogo");

  const actividad = await prisma.actividadesPoa.findUnique({
    where: { id: actividadId },
    include: { poaVersion: { include: { periodoFiscal: true } } },
  });
  if (!actividad) throw new NotFoundError("Actividad POA", actividadId);
  if (!actividad.poaVersion.vigente) throw new ValidationError("Solo se puede modificar una actividad del POA vigente");
  if (!actividad.poaVersion.periodoFiscal.activo) throw new ValidationError("El periodo fiscal no está activo");

  const fuenteCodigo = String(body.fuenteCodigo || actividad.fuenteCodigo);
  if (fuenteCodigo !== actividad.fuenteCodigo) throw new ValidationError("No se puede modificar la fuente de financiamiento");

  const programaCodigo = String(body.programaCodigo || actividad.programaCodigo);
  const actividadCodigo = String(body.actividadCodigo || actividad.actividadCodigo);
  const itemCodigo = String(body.itemCodigo || actividad.itemCodigo);

  const cedula = await prisma.cedulaMefVersion.findFirst({
    where: { periodoFiscalId: actividad.poaVersion.periodoFiscalId, vigente: true },
  });
  if (!cedula) throw new ValidationError("No existe cédula MEF vigente para validar la modificación");
  const entrada = await prisma.cedulaMefEntrada.findFirst({
    where: { versionId: cedula.id, programaCodigo, actividadCodigo, itemCodigo, fuenteCodigo },
  });
  if (!entrada) throw new ValidationError("La nueva estructura no consta en la cédula MEF vigente");

  const totalPeriodo = await prisma.modificacionPoa.count({ where: { periodoFiscalId: actividad.poaVersion.periodoFiscalId } });
  const numero = `MOD-${actividad.poaVersion.periodoFiscal.anio}-${String(totalPeriodo + 1).padStart(4, "0")}`;

  const mod = await prisma.modificacionPoa.create({
    data: {
      numero,
      periodoFiscalId: actividad.poaVersion.periodoFiscalId,
      actividadOrigenId: actividad.id,
      solicitanteId: user.id,
      estado: "solicitada",
      motivo,
      programaCodigoAnterior: actividad.programaCodigo,
      programaNombreAnterior: actividad.programaNombre,
      actividadCodigoAnterior: actividad.actividadCodigo,
      actividadNombreAnterior: actividad.actividadNombre,
      itemCodigoAnterior: actividad.itemCodigo,
      itemNombreAnterior: actividad.itemNombre,
      fuenteCodigo: actividad.fuenteCodigo,
      fuenteNombre: actividad.fuenteNombre,
      montoPlanificadoAnterior: actividad.montoPlanificado,
      programaCodigoNuevo: programaCodigo,
      programaNombreNuevo: entrada.programaNombre,
      actividadCodigoNuevo: actividadCodigo,
      actividadNombreNuevo: entrada.actividadNombre,
      itemCodigoNuevo: itemCodigo,
      itemNombreNuevo: entrada.itemNombre,
      montoPlanificadoNuevo: montoNuevo,
    },
  });

  const informeRuta = await documentosService.generarInformeTecnico({
    id: mod.id,
    numero,
    motivo,
    programaAnterior: `${actividad.programaCodigo} - ${actividad.programaNombre}`,
    programaNuevo: `${programaCodigo} - ${entrada.programaNombre}`,
    actividadAnterior: `${actividad.actividadCodigo} - ${actividad.actividadNombre}`,
    actividadNueva: `${actividadCodigo} - ${entrada.actividadNombre}`,
    itemAnterior: `${actividad.itemCodigo} - ${actividad.itemNombre}`,
    itemNuevo: `${itemCodigo} - ${entrada.itemNombre}`,
    fuente: `${actividad.fuenteCodigo} - ${actividad.fuenteNombre}`,
    montoAnterior: actividad.montoPlanificado.toString(),
    montoNuevo,
    fecha: new Date(),
  });
  await prisma.modificacionPoa.update({ where: { id: mod.id }, data: { informeRuta } });
  await auditoriaService.registrar({
    usuarioId: user.id,
    entidad: "ModificacionPoa",
    entidadId: mod.id,
    accion: "SOLICITAR",
    estadoNuevo: "solicitada",
    motivo,
  });
  return c.json({ success: true, data: await serializar(mod.id) }, 201);
});

app.post("/:id/observar", requirePermission("modificacion.observar"), async (c) => {
  const user = userFrom(c);
  const id = param(c, "id");
  const body = await c.req.json();
  const observaciones = String(body.observaciones || "").trim();
  if (!observaciones) throw new ValidationError("observaciones es requerido");
  const current = await prisma.modificacionPoa.findUnique({ where: { id } });
  if (!current) throw new NotFoundError("Modificación POA", id);
  if (current.estado !== "solicitada") throw new ValidationError("Solo se puede observar una modificación solicitada");
  await prisma.modificacionPoa.update({ where: { id }, data: { estado: "observada", observaciones, analistaId: user.id } });
  await auditoriaService.registrar({ usuarioId: user.id, entidad: "ModificacionPoa", entidadId: id, accion: "OBSERVAR", estadoAnterior: current.estado, estadoNuevo: "observada", motivo: observaciones });
  return c.json({ success: true, data: await serializar(id) });
});

app.post("/:id/suscribir", requirePermission("modificacion.suscribir"), async (c) => {
  const user = userFrom(c);
  const id = param(c, "id");
  const current = await prisma.modificacionPoa.findUnique({ where: { id } });
  if (!current) throw new NotFoundError("Modificación POA", id);
  if (!["solicitada", "observada"].includes(current.estado)) throw new ValidationError("Solo se puede suscribir una modificación solicitada u observada");
  await prisma.modificacionPoa.update({ where: { id }, data: { estado: "suscrita", directorId: user.id, observaciones: null } });
  await auditoriaService.registrar({ usuarioId: user.id, entidad: "ModificacionPoa", entidadId: id, accion: "SUSCRIBIR", estadoAnterior: current.estado, estadoNuevo: "suscrita" });
  return c.json({ success: true, data: await serializar(id) });
});

app.post("/:id/aprobar", requirePermission("modificacion.aprobar"), async (c) => {
  const user = userFrom(c);
  const id = param(c, "id");
  const mod = await prisma.modificacionPoa.findUnique({
    where: { id },
    include: { actividadOrigen: { include: { poaVersion: { include: { actividades: true } } } } },
  });
  if (!mod) throw new NotFoundError("Modificación POA", id);
  if (mod.estado !== "suscrita") throw new ValidationError("Solo se puede aprobar una modificación suscrita");

  const result = await prisma.$transaction(async (tx) => {
    const versionActual = mod.actividadOrigen.poaVersion;
    const nuevoSaldo = decimalToCentavos(mod.actividadOrigen.saldoDisponible) + (decimalToCentavos(mod.montoPlanificadoNuevo) - decimalToCentavos(mod.montoPlanificadoAnterior));
    if (nuevoSaldo < 0n) throw new ValidationError("El nuevo monto no cubre el saldo ya comprometido");

    await tx.poaVersion.update({ where: { id: versionActual.id }, data: { vigente: false, estado: "reemplazada" } });
    const nuevaVersion = await tx.poaVersion.create({
      data: {
        periodoFiscalId: versionActual.periodoFiscalId,
        numeroVersion: versionActual.numeroVersion + 1,
        estado: "vigente",
        vigente: true,
        origenModificacionId: id,
        createdBy: user.id,
      },
    });

    let nuevaActividadId = "";
    for (const actividad of versionActual.actividades) {
      const esOrigen = actividad.id === mod.actividadOrigenId;
      const nuevaActividad = await tx.actividadesPoa.create({
        data: {
          poaVersionId: nuevaVersion.id,
          unidadId: actividad.unidadId,
          programaCodigo: esOrigen ? mod.programaCodigoNuevo : actividad.programaCodigo,
          programaNombre: esOrigen ? mod.programaNombreNuevo : actividad.programaNombre,
          actividadCodigo: esOrigen ? mod.actividadCodigoNuevo : actividad.actividadCodigo,
          actividadNombre: esOrigen ? mod.actividadNombreNuevo : actividad.actividadNombre,
          itemCodigo: esOrigen ? mod.itemCodigoNuevo : actividad.itemCodigo,
          itemNombre: esOrigen ? mod.itemNombreNuevo : actividad.itemNombre,
          fuenteCodigo: actividad.fuenteCodigo,
          fuenteNombre: actividad.fuenteNombre,
          montoPlanificado: esOrigen ? mod.montoPlanificadoNuevo : actividad.montoPlanificado,
          saldoDisponible: esOrigen ? centavosToDecimal(nuevoSaldo) : actividad.saldoDisponible,
        },
      });
      if (esOrigen) nuevaActividadId = nuevaActividad.id;
    }

    await tx.certificacion.updateMany({
      where: { actividadId: mod.actividadOrigenId, estado: { in: estadosVigentesCert } },
      data: { actividadId: nuevaActividadId },
    });

    return tx.modificacionPoa.update({
      where: { id },
      data: {
        estado: "aplicada",
        analistaId: user.id,
        nuevaPoaVersionId: nuevaVersion.id,
        nuevaActividadId,
      },
    });
  });

  await auditoriaService.registrar({ usuarioId: user.id, entidad: "ModificacionPoa", entidadId: id, accion: "APROBAR_Y_APLICAR", estadoAnterior: mod.estado, estadoNuevo: "aplicada", motivo: result.numero || undefined });
  return c.json({ success: true, data: await serializar(id) });
});

app.get("/:id/informe", requirePermission("modificacion.ver"), async (c) => {
  const id = param(c, "id");
  const mod = await prisma.modificacionPoa.findUnique({ where: { id } });
  if (!mod?.informeRuta) throw new NotFoundError("Informe técnico", id);
  const file = Bun.file(mod.informeRuta);
  if (!(await file.exists())) throw new NotFoundError("Archivo", id);
  return c.body(await file.arrayBuffer(), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="informe-${mod.numero}.pdf"`,
    },
  });
});

app.get("/:id", requirePermission("modificacion.ver"), async (c) => c.json({ success: true, data: await serializar(param(c, "id")) }));

export default app;
