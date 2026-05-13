import { PrismaClient } from "@prisma/client";
import { AuditoriaParams, AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { normalizarMonto, normalizarTipo } from "../services/certificacion-normalizadores.service";
import { obtenerCertificacion } from "../queries/obtener-certificacion.query";
import { CrearCertificacionUseCase } from "./crear-certificacion.usecase";
import { CertificacionDocumentosService } from "../../infrastructure/certificacion-documentos.service";
import { hashFile, validarArchivo } from "../../infrastructure/certificacion-archivos.service";
import { ValidationError } from "../../../../common/errors/http-error.map";

type AuthUser = { id: string };
type AuditMeta = Pick<AuditoriaParams, "rol" | "ip" | "userAgent">;

export async function crearSolicitudCertificacion(params: {
  prisma: PrismaClient;
  crearCertificacionUseCase: CrearCertificacionUseCase;
  documentosService: CertificacionDocumentosService;
  auditoriaService: AuditoriaService;
  user: AuthUser;
  payload: Record<string, any>;
  archivos: File[];
  auditMeta: AuditMeta;
}) {
  const { prisma, crearCertificacionUseCase, documentosService, auditoriaService, user, payload, archivos, auditMeta } = params;
  const { periodoFiscalId, programaCodigo, actividadCodigo, itemCodigo, fuenteCodigo, conIva } = payload;
  const tipo = normalizarTipo(payload.tipo);
  const monto = normalizarMonto(payload.monto);

  if (!periodoFiscalId) throw new ValidationError("periodoFiscalId es requerido");
  if (!programaCodigo) throw new ValidationError("programaCodigo es requerido");
  if (!actividadCodigo) throw new ValidationError("actividadCodigo es requerido");
  if (!itemCodigo) throw new ValidationError("itemCodigo es requerido");
  if (!fuenteCodigo) throw new ValidationError("fuenteCodigo es requerido");
  if (archivos.length === 0) throw new ValidationError("Debe adjuntar al menos un documento habilitante");
  archivos.forEach(validarArchivo);

  const cert = await crearCertificacionUseCase.execute({
    tipo,
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
        entidadOrigen: "Certificacion",
        entidadOrigenId: cert.id,
        hashDocumento: await hashFile(adjunto.ruta),
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
    ...auditMeta,
    payloadNuevo: { tipo, periodoFiscalId, programaCodigo, actividadCodigo, itemCodigo, fuenteCodigo, monto, conIva: Boolean(conIva) },
  });

  return obtenerCertificacion(prisma, cert.id);
}
