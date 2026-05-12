import { Context, Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { CrearCertificacionUseCase } from "../../application/use-cases/crear-certificacion.usecase";
import { CertificacionDocumentosService } from "../../infrastructure/certificacion-documentos.service";
import { NotFoundError, ValidationError } from "../../../../common/errors/http-error.map";
import { requirePermission } from "../../../../common/guards/auth.guard";
import { AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { SaldosMotorService } from "../../../saldos/application/use-cases/saldos-motor.service";

const prisma = new PrismaClient();
const crearCertificacionUseCase = new CrearCertificacionUseCase(prisma);
const documentosService = new CertificacionDocumentosService();
const auditoriaService = new AuditoriaService(prisma);
const saldosMotor = new SaldosMotorService(prisma);

type AuthUser = { id: string; email: string; rol: string; nombre: string };

const estadosActivos = ["solicitada", "observada", "generada", "suscrita", "en_uso"];

function normalizarMonto(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
    throw new ValidationError("monto debe ser un decimal positivo con máximo 2 decimales");
  }
  const [integerPart, decimalPart = ""] = raw.split(".");
  return `${integerPart}.${decimalPart.padEnd(2, "0")}`;
}

function userFrom(c: Context): AuthUser {
  return c.get("user") as AuthUser;
}

function param(c: Context, name: string): string {
  const value = c.req.param(name);
  if (!value) throw new ValidationError(`${name} es requerido`);
  return value;
}

export class CertificacionesController {
  async crear(c: Context) {
    const user = userFrom(c);
    const contentType = c.req.header("content-type") || "";
    let payload: Record<string, any> = {};
    let archivos: File[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await c.req.formData();
      payload = {
        periodoFiscalId: formData.get("periodoFiscalId"),
        programaCodigo: formData.get("programaCodigo"),
        actividadCodigo: formData.get("actividadCodigo"),
        itemCodigo: formData.get("itemCodigo"),
        fuenteCodigo: formData.get("fuenteCodigo"),
        monto: formData.get("monto"),
        conIva: formData.get("conIva") === "true",
      };
      archivos = formData.getAll("documentos").filter((item): item is File => item instanceof File && item.size > 0);
    } else {
      payload = await c.req.json();
    }

    const { periodoFiscalId, programaCodigo, actividadCodigo, itemCodigo, fuenteCodigo, conIva } = payload;
    const monto = normalizarMonto(payload.monto);

    if (!periodoFiscalId) throw new ValidationError("periodoFiscalId es requerido");
    if (!programaCodigo) throw new ValidationError("programaCodigo es requerido");
    if (!actividadCodigo) throw new ValidationError("actividadCodigo es requerido");
    if (!itemCodigo) throw new ValidationError("itemCodigo es requerido");
    if (!fuenteCodigo) throw new ValidationError("fuenteCodigo es requerido");
    if (archivos.length === 0) throw new ValidationError("Debe adjuntar al menos un documento habilitante");

    const cert = await crearCertificacionUseCase.execute({
      periodoFiscalId,
      programaCodigo,
      actividadCodigo,
      itemCodigo,
      fuenteCodigo,
      monto,
      conIva: Boolean(conIva),
      solicitanteId: user.id,
    });

    for (const archivo of archivos) {
      const adjunto = await documentosService.guardarAdjunto(cert.id, archivo);
      await prisma.documentoHabilitante.create({
        data: {
          certificacionId: cert.id,
          tipo: adjunto.tipo,
          ruta: adjunto.ruta,
          nombreOriginal: adjunto.nombreOriginal,
          tamano: adjunto.tamano,
          mimeType: adjunto.mimeType,
        },
      });
    }

    await auditoriaService.registrar({
      usuarioId: user.id,
      entidad: "Certificacion",
      entidadId: cert.id,
      accion: "SOLICITAR",
      estadoNuevo: "solicitada",
      motivo: `Solicitud de certificación por USD ${monto}`,
    });

    return c.json({ success: true, data: await this.serializar(cert.id) }, 201);
  }

  async listar(c: Context) {
    const user = userFrom(c);
    const estado = c.req.query("estado");
    const solicitanteId = c.req.query("solicitante");

    const where: any = {};
    if (estado) where.estado = estado;
    if (solicitanteId) where.solicitanteId = solicitanteId;
    if (user.rol === "unidad") where.solicitanteId = user.id;

    const certs = await prisma.certificacion.findMany({
      where,
      include: {
        actividad: { include: { poaVersion: { include: { periodoFiscal: true } } } },
        solicitante: { select: { id: true, nombre: true, email: true } },
        analista: { select: { id: true, nombre: true, email: true } },
        director: { select: { id: true, nombre: true, email: true } },
        documentos: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return c.json({ success: true, data: certs.map(this.toListItem) });
  }

  async obtener(c: Context) {
    return c.json({ success: true, data: await this.serializar(param(c, "id")) });
  }

  async observar(c: Context) {
    const user = userFrom(c);
    const id = param(c, "id");
    const body = await c.req.json();
    const observaciones = String(body.observaciones || "").trim();
    if (!observaciones) throw new ValidationError("observaciones es requerido");

    const cert = await prisma.certificacion.findUnique({ where: { id } });
    if (!cert) throw new NotFoundError("Certificación", id);
    if (!["solicitada", "generada"].includes(cert.estado)) {
      throw new ValidationError("Solo se puede observar una certificación solicitada o generada");
    }

    await prisma.certificacion.update({
      where: { id },
      data: {
        estado: "observada",
        observaciones,
        ...(user.rol === "director" ? { directorId: user.id } : { analistaId: user.id }),
      },
    });
    await auditoriaService.registrar({
      usuarioId: user.id,
      entidad: "Certificacion",
      entidadId: id,
      accion: "OBSERVAR",
      estadoAnterior: cert.estado,
      estadoNuevo: "observada",
      motivo: observaciones,
    });

    return c.json({ success: true, data: await this.serializar(id) });
  }

  async aprobar(c: Context) {
    const user = userFrom(c);
    const id = param(c, "id");
    const cert = await prisma.certificacion.findUnique({
      where: { id },
      include: {
        documentos: true,
        actividad: { include: { poaVersion: { include: { periodoFiscal: true } } } },
        solicitante: true,
      },
    });
    if (!cert) throw new NotFoundError("Certificación", id);
    if (!["solicitada", "observada"].includes(cert.estado)) {
      throw new ValidationError("Solo se puede aprobar una certificación solicitada u observada");
    }
    if (!cert.actividad) throw new ValidationError("La certificación no tiene actividad POA asociada");
    const actividad = cert.actividad;
    if (!cert.documentos.some((doc) => doc.tipo === "habilitante")) {
      throw new ValidationError("La certificación no tiene documentos habilitantes");
    }

    const result = await prisma.$transaction(async (tx) => {
      const duplicada = await tx.certificacion.findFirst({
        where: {
          id: { not: id },
          actividadId: cert.actividadId,
          estado: { in: estadosActivos },
        },
      });
      if (duplicada) throw new ValidationError("Ya existe otra certificación vigente para esta actividad");

      const periodo = actividad.poaVersion.periodoFiscal;
      const totalDelPeriodo = await tx.certificacion.count({
        where: {
          numero: { not: null },
          actividad: { poaVersion: { periodoFiscalId: periodo.id } },
        },
      });
      const numero = `CERT-${periodo.anio}-${String(totalDelPeriodo + 1).padStart(4, "0")}`;

      return tx.certificacion.update({
        where: { id },
        data: { numero, estado: "generada", analistaId: user.id, observaciones: null },
      });
    });

    const documentoData = this.crearDocumentoData(result, actividad, cert.solicitante.nombre);
    const certificacionPdf = await documentosService.generarCertificacionPdf(documentoData);
    const memorandoPdf = await documentosService.generarMemorandoPdf(documentoData);
    await prisma.documentoHabilitante.createMany({
      data: [
        {
          certificacionId: id,
          tipo: "certificacion_pdf",
          ruta: certificacionPdf,
          nombreOriginal: `certificacion-${result.numero}.pdf`,
          tamano: await Bun.file(certificacionPdf).size,
          mimeType: "application/pdf",
        },
        {
          certificacionId: id,
          tipo: "memorando_pdf",
          ruta: memorandoPdf,
          nombreOriginal: `memorando-${result.numero}.pdf`,
          tamano: await Bun.file(memorandoPdf).size,
          mimeType: "application/pdf",
        },
      ],
    });

    await auditoriaService.registrar({
      usuarioId: user.id,
      entidad: "Certificacion",
      entidadId: id,
      accion: "APROBAR_ANALISTA",
      estadoAnterior: cert.estado,
      estadoNuevo: "generada",
      motivo: result.numero || undefined,
    });

    return c.json({ success: true, data: await this.serializar(id) });
  }

  async suscribir(c: Context) {
    const user = userFrom(c);
    const id = param(c, "id");

    const cert = await prisma.certificacion.findUnique({
      where: { id },
      include: {
        actividad: { include: { poaVersion: { include: { periodoFiscal: true } } } },
        solicitante: true,
      },
    });
    if (!cert) throw new NotFoundError("Certificación", id);
    if (cert.estado !== "generada") {
      throw new ValidationError("Solo se puede suscribir una certificación generada por analista");
    }
    if (!cert.actividad) throw new ValidationError("La certificación no tiene actividad POA asociada");

    await prisma.$transaction(async (tx) => {
      const duplicada = await tx.certificacion.findFirst({
        where: {
          id: { not: id },
          actividadId: cert.actividadId,
          estado: { in: estadosActivos },
        },
      });
      if (duplicada) throw new ValidationError("Ya existe otra certificación vigente para esta actividad");

      await tx.certificacion.update({
        where: { id },
        data: {
          estado: "suscrita",
          directorId: user.id,
        },
      });

      await saldosMotor.descontar(cert.actividadId, cert.monto.toString(), tx);
    });

    await auditoriaService.registrar({
      usuarioId: user.id,
      entidad: "Certificacion",
      entidadId: id,
      accion: "SUSCRIBIR",
      estadoAnterior: cert.estado,
      estadoNuevo: "suscrita",
      motivo: cert.numero || undefined,
    });

    return c.json({ success: true, data: await this.serializar(id) });
  }

  async descargarDocumento(c: Context) {
    const id = param(c, "id");
    const documentoId = param(c, "documentoId");
    const documento = await prisma.documentoHabilitante.findFirst({
      where: { id: documentoId, certificacionId: id },
    });
    if (!documento) throw new NotFoundError("Documento", documentoId);
    const file = Bun.file(documento.ruta);
    if (!(await file.exists())) throw new NotFoundError("Archivo", documentoId);
    return c.body(await file.arrayBuffer(), {
      headers: {
        "Content-Type": documento.mimeType,
        "Content-Disposition": `attachment; filename="${documento.nombreOriginal}"`,
      },
    });
  }

  private async serializar(id: string) {
    const cert = await prisma.certificacion.findUnique({
      where: { id },
      include: {
        actividad: { include: { poaVersion: { include: { periodoFiscal: true } } } },
        solicitante: { select: { id: true, nombre: true, email: true } },
        analista: { select: { id: true, nombre: true, email: true } },
        director: { select: { id: true, nombre: true, email: true } },
        documentos: true,
      },
    });
    if (!cert) throw new NotFoundError("Certificación", id);
    return this.toListItem(cert);
  }

  private toListItem(c: any) {
    return {
      id: c.id,
      numero: c.numero,
      estado: c.estado,
      monto: Number(c.monto),
      conIva: c.conIva,
      observaciones: c.observaciones,
      cedulaVersionId: c.cedulaVersionId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      actividad: c.actividad ? {
        id: c.actividad.id,
        programaCodigo: c.actividad.programaCodigo,
        programaNombre: c.actividad.programaNombre,
        actividadCodigo: c.actividad.actividadCodigo,
        actividadNombre: c.actividad.actividadNombre,
        itemCodigo: c.actividad.itemCodigo,
        itemNombre: c.actividad.itemNombre,
        fuenteCodigo: c.actividad.fuenteCodigo,
        fuenteNombre: c.actividad.fuenteNombre,
        saldoDisponible: Number(c.actividad.saldoDisponible),
        periodoFiscalId: c.actividad.poaVersion?.periodoFiscalId,
        periodoAnio: c.actividad.poaVersion?.periodoFiscal?.anio,
      } : null,
      solicitante: c.solicitante,
      analista: c.analista,
      director: c.director,
      documentos: (c.documentos || []).map((doc: any) => ({
        id: doc.id,
        tipo: doc.tipo,
        nombreOriginal: doc.nombreOriginal,
        tamano: doc.tamano,
        mimeType: doc.mimeType,
        createdAt: doc.createdAt,
      })),
    };
  }

  private crearDocumentoData(cert: any, actividad: any, solicitanteNombre: string) {
    return {
      id: cert.id,
      numero: cert.numero,
      monto: cert.monto.toString(),
      conIva: cert.conIva,
      solicitanteNombre,
      programaCodigo: actividad.programaCodigo,
      programaNombre: actividad.programaNombre,
      actividadCodigo: actividad.actividadCodigo,
      actividadNombre: actividad.actividadNombre,
      itemCodigo: actividad.itemCodigo,
      itemNombre: actividad.itemNombre,
      fuenteCodigo: actividad.fuenteCodigo,
      fuenteNombre: actividad.fuenteNombre,
      fecha: new Date(),
    };
  }
}

export const certificacionesController = new CertificacionesController();

const app = new Hono();

app.post("/", requirePermission("certificacion.crear"), async (c) => certificacionesController.crear(c));
app.get("/", requirePermission("certificacion.ver"), async (c) => certificacionesController.listar(c));
app.post("/:id/observar", requirePermission("certificacion.observar"), async (c) => certificacionesController.observar(c));
app.post("/:id/aprobar", requirePermission("certificacion.aprobar"), async (c) => certificacionesController.aprobar(c));
app.post("/:id/suscribir", requirePermission("certificacion.suscribir"), async (c) => certificacionesController.suscribir(c));
app.get("/:id/documentos/:documentoId/download", requirePermission("certificacion.ver"), async (c) => certificacionesController.descargarDocumento(c));
app.get("/:id", requirePermission("certificacion.ver"), async (c) => certificacionesController.obtener(c));

export default app;
