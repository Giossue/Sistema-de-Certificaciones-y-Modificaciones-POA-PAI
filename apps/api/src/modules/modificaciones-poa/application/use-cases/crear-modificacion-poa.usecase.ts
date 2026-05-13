import { PrismaClient } from "@prisma/client";
import { NotFoundError, ValidationError } from "../../../../common/errors/http-error.map";
import { AuditoriaParams, AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { motivosBase } from "../../domain/constants/modificacion-motivos.constants";
import { ModificacionDocumentosService } from "../../infrastructure/modificacion-documentos.service";
import { AuthUser } from "../../../../common/http/context.helpers";
import { normalizarMonto } from "../services/modificacion-normalizadores.service";
import { obtenerModificacionPoa } from "../queries/obtener-modificacion-poa.query";

type AuditMeta = Pick<AuditoriaParams, "rol" | "ip" | "userAgent">;

type CrearModificacionPoaParams = {
  prisma: PrismaClient;
  documentosService: ModificacionDocumentosService;
  auditoriaService: AuditoriaService;
  user: AuthUser;
  body: any;
  auditMeta: AuditMeta;
};

export async function crearModificacionPoa(params: CrearModificacionPoaParams) {
  const { prisma, documentosService, auditoriaService, user, body, auditMeta } = params;
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
  const responsableNuevoId = body.responsableNuevoId ? String(body.responsableNuevoId) : actividad.responsableUsuarioId;
  const responsableNuevoNombre = String(body.responsableNuevoNombre || actividad.responsableNombre || "").trim() || null;
  const observacionBienes = String(body.observacionBienes || "").trim() || null;
  const tipoDiscrepancia = String(body.tipoDiscrepancia || "").trim() || null;

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
      responsableAnteriorId: actividad.responsableUsuarioId,
      responsableAnteriorNombre: actividad.responsableNombre,
      montoPlanificadoAnterior: actividad.montoPlanificado,
      programaCodigoNuevo: programaCodigo,
      programaNombreNuevo: entrada.programaNombre,
      actividadCodigoNuevo: actividadCodigo,
      actividadNombreNuevo: entrada.actividadNombre,
      itemCodigoNuevo: itemCodigo,
      itemNombreNuevo: entrada.itemNombre,
      responsableNuevoId,
      responsableNuevoNombre,
      observacionBienes,
      tipoDiscrepancia,
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
    ...auditMeta,
    payloadNuevo: {
      actividadId,
      motivo,
      estructuraAnterior: {
        programaCodigo: actividad.programaCodigo,
        actividadCodigo: actividad.actividadCodigo,
        itemCodigo: actividad.itemCodigo,
        fuenteCodigo: actividad.fuenteCodigo,
        responsableNombre: actividad.responsableNombre,
      },
      estructuraNueva: {
        programaCodigo,
        actividadCodigo,
        itemCodigo,
        fuenteCodigo,
        responsableNuevoId,
        responsableNuevoNombre,
      },
      observacionBienes,
      tipoDiscrepancia,
    },
  });
  return obtenerModificacionPoa(prisma, mod.id);
}
