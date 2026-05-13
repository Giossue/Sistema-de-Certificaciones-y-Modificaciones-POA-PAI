import { PrismaClient } from "@prisma/client";
import { AuditoriaParams, AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { estadosActivos } from "../../domain/constants/certificacion-estados.constants";
import { hashFile } from "../../infrastructure/certificacion-archivos.service";
import { crearDocumentoData } from "../../infrastructure/certificacion-documento-data.mapper";
import { CertificacionDocumentosService } from "../../infrastructure/certificacion-documentos.service";
import { NotFoundError, ValidationError } from "../../../../common/errors/http-error.map";
import { normalizarTipo, unidadCodigo } from "../services/certificacion-normalizadores.service";
import { obtenerCertificacion } from "../queries/obtener-certificacion.query";

type AuthUser = { id: string };
type AuditMeta = Pick<AuditoriaParams, "rol" | "ip" | "userAgent">;

export async function aprobarCertificacion(params: {
  prisma: PrismaClient;
  documentosService: CertificacionDocumentosService;
  auditoriaService: AuditoriaService;
  id: string;
  user: AuthUser;
  auditMeta: AuditMeta;
}) {
  const { prisma, documentosService, auditoriaService, id, user, auditMeta } = params;
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
    const tipo = normalizarTipo(cert.tipo);
    const codigoUnidad = unidadCodigo(cert.solicitante, actividad);
    const prefijoNumero = `${tipo}-${codigoUnidad}-${periodo.anio}-`;
    const certificacionesNumeradas = await tx.certificacion.findMany({
      where: {
        tipo,
        numero: { startsWith: prefijoNumero },
        actividad: { poaVersion: { periodoFiscalId: periodo.id } },
      },
      select: { numero: true },
    });
    const ultimoCorrelativo = certificacionesNumeradas.reduce((max, item) => {
      const correlativo = Number(item.numero?.slice(prefijoNumero.length) || 0);
      return Number.isFinite(correlativo) ? Math.max(max, correlativo) : max;
    }, 0);
    const numero = `${prefijoNumero}${String(ultimoCorrelativo + 1).padStart(4, "0")}`;

    return tx.certificacion.update({
      where: { id },
      data: { numero, tipo, estado: "generada", analistaId: user.id, observaciones: null },
    });
  });

  const documentoData = crearDocumentoData(result, actividad, cert.solicitante.nombre);
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
        plantilla: `${result.tipo.toLowerCase()}-certificacion-v1`,
        versionPlantilla: "v1",
        entidadOrigen: "Certificacion",
        entidadOrigenId: id,
        hashDocumento: await hashFile(certificacionPdf),
      },
      {
        certificacionId: id,
        tipo: "memorando_pdf",
        ruta: memorandoPdf,
        nombreOriginal: `memorando-${result.numero}.pdf`,
        tamano: await Bun.file(memorandoPdf).size,
        mimeType: "application/pdf",
        plantilla: "memorando-v1",
        versionPlantilla: "v1",
        entidadOrigen: "Certificacion",
        entidadOrigenId: id,
        hashDocumento: await hashFile(memorandoPdf),
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
    ...auditMeta,
    payloadAnterior: { estado: cert.estado, numero: cert.numero },
    payloadNuevo: { estado: "generada", numero: result.numero },
  });

  return obtenerCertificacion(prisma, id);
}
