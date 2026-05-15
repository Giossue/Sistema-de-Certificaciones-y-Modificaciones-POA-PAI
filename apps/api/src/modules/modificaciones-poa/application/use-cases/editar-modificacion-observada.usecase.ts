import { PrismaClient } from "@prisma/client";
import { NotFoundError, ValidationError } from "../../../../common/errors/http-error.map";
import { AuditoriaParams, AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { AuthUser } from "../../../../common/http/context.helpers";
import { motivosBase } from "../../domain/constants/modificacion-motivos.constants";
import { ModificacionDocumentosService } from "../../infrastructure/modificacion-documentos.service";
import { obtenerModificacionPoa } from "../queries/obtener-modificacion-poa.query";
import { normalizarMonto } from "../services/modificacion-normalizadores.service";

type AuditMeta = Pick<AuditoriaParams, "rol" | "ip" | "userAgent">;

type EditarModificacionObservadaParams = {
  prisma: PrismaClient;
  auditoriaService: AuditoriaService;
  documentosService: ModificacionDocumentosService;
  id: string;
  user: AuthUser;
  body: EditarModificacionObservadaBody;
  auditMeta: AuditMeta;
};

type EditarModificacionObservadaBody = {
  motivo?: unknown;
  programaCodigo?: unknown;
  actividadCodigo?: unknown;
  itemCodigo?: unknown;
  fuenteCodigo?: unknown;
  responsableNuevoId?: unknown;
  responsableNuevoNombre?: unknown;
  observacionBienes?: unknown;
  tipoDiscrepancia?: unknown;
  montoPlanificadoNuevo?: unknown;
  justificacion?: unknown;
};

function optionalTrim(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}

export async function editarModificacionObservada(
  params: EditarModificacionObservadaParams,
) {
  const { prisma, auditoriaService, documentosService, id, user, body, auditMeta } =
    params;
  const justificacion = String(body.justificacion || "").trim();
  if (!justificacion) throw new ValidationError("justificacion es requerido");

  const current = await prisma.modificacionPoa.findUnique({
    where: { id },
    include: {
      actividadOrigen: {
        include: {
          poaVersion: {
            include: { periodoFiscal: true },
          },
        },
      },
    },
  });
  if (!current) throw new NotFoundError("Modificación POA", id);
  if (current.estado !== "observada") {
    throw new ValidationError("Solo se puede editar una modificación observada");
  }

  const fuenteCodigo = String(body.fuenteCodigo || current.fuenteCodigo);
  if (fuenteCodigo !== current.fuenteCodigo) {
    throw new ValidationError(
      "No se puede modificar la fuente de financiamiento",
    );
  }

  const motivo = String(body.motivo ?? current.motivo).trim();
  if (!motivo || !motivosBase.includes(motivo)) {
    throw new ValidationError("motivo es requerido y debe venir del catálogo");
  }

  const programaCodigo = String(
    body.programaCodigo ?? current.programaCodigoNuevo,
  ).trim();
  const actividadCodigo = String(
    body.actividadCodigo ?? current.actividadCodigoNuevo,
  ).trim();
  const itemCodigo = String(body.itemCodigo ?? current.itemCodigoNuevo).trim();
  const montoPlanificadoNuevo = normalizarMonto(
    body.montoPlanificadoNuevo ?? current.montoPlanificadoNuevo.toString(),
  );
  if (!programaCodigo) throw new ValidationError("programaCodigo es requerido");
  if (!actividadCodigo) throw new ValidationError("actividadCodigo es requerido");
  if (!itemCodigo) throw new ValidationError("itemCodigo es requerido");
  if (!montoPlanificadoNuevo) {
    throw new ValidationError("montoPlanificadoNuevo debe ser un monto válido");
  }

  const cedula = await prisma.cedulaMefVersion.findFirst({
    where: {
      periodoFiscalId: current.periodoFiscalId,
      vigente: true,
    },
  });
  if (!cedula) {
    throw new ValidationError(
      "No existe cédula MEF vigente para validar la modificación",
    );
  }

  const entrada = await prisma.cedulaMefEntrada.findFirst({
    where: {
      versionId: cedula.id,
      programaCodigo,
      actividadCodigo,
      itemCodigo,
      fuenteCodigo,
    },
  });
  if (!entrada) {
    throw new ValidationError(
      "La nueva estructura no consta en la cédula MEF vigente",
    );
  }

  const payloadAnterior = {
    motivo: current.motivo,
    programaCodigo: current.programaCodigoNuevo,
    actividadCodigo: current.actividadCodigoNuevo,
    itemCodigo: current.itemCodigoNuevo,
    fuenteCodigo: current.fuenteCodigo,
    responsableNuevoId: current.responsableNuevoId,
    responsableNuevoNombre: current.responsableNuevoNombre,
    observacionBienes: current.observacionBienes,
    tipoDiscrepancia: current.tipoDiscrepancia,
    montoPlanificadoNuevo: current.montoPlanificadoNuevo.toString(),
  };

  const updateData = {
    motivo,
    programaCodigoNuevo: programaCodigo,
    programaNombreNuevo: entrada.programaNombre,
    actividadCodigoNuevo: actividadCodigo,
    actividadNombreNuevo: entrada.actividadNombre,
    itemCodigoNuevo: itemCodigo,
    itemNombreNuevo: entrada.itemNombre,
    responsableNuevoId:
      body.responsableNuevoId === undefined
        ? current.responsableNuevoId
        : optionalTrim(body.responsableNuevoId),
    responsableNuevoNombre:
      body.responsableNuevoNombre === undefined
        ? current.responsableNuevoNombre
        : optionalTrim(body.responsableNuevoNombre),
    observacionBienes:
      body.observacionBienes === undefined
        ? current.observacionBienes
        : optionalTrim(body.observacionBienes),
    tipoDiscrepancia:
      body.tipoDiscrepancia === undefined
        ? current.tipoDiscrepancia
        : optionalTrim(body.tipoDiscrepancia),
    montoPlanificadoNuevo,
  };

  const numero = current.numero;
  if (!numero) {
    throw new ValidationError("La modificación no tiene número asignado");
  }

  let informeRuta: string;
  try {
    informeRuta = await prisma.$transaction(async (tx) => {
      await tx.modificacionPoa.update({
        where: { id },
        data: updateData,
      });

      const ruta = await documentosService.generarInformeTecnico({
        id,
        numero,
        motivo,
        programaAnterior: `${current.programaCodigoAnterior} - ${current.programaNombreAnterior}`,
        programaNuevo: `${programaCodigo} - ${entrada.programaNombre}`,
        actividadAnterior: `${current.actividadCodigoAnterior} - ${current.actividadNombreAnterior}`,
        actividadNueva: `${actividadCodigo} - ${entrada.actividadNombre}`,
        itemAnterior: `${current.itemCodigoAnterior} - ${current.itemNombreAnterior}`,
        itemNuevo: `${itemCodigo} - ${entrada.itemNombre}`,
        fuente: `${current.fuenteCodigo} - ${current.fuenteNombre}`,
        responsableNuevo: updateData.responsableNuevoNombre,
        montoAnterior: current.montoPlanificadoAnterior.toString(),
        montoNuevo: montoPlanificadoNuevo,
        justificacionLinea: `Justificacion de subsanacion: ${justificacion}`,
        fecha: new Date(),
      });

      await tx.modificacionPoa.update({
        where: { id },
        data: { informeRuta: ruta },
      });

      return ruta;
    });
  } catch (error) {
    throw new ValidationError(
      `No se pudo regenerar el informe técnico actualizado: ${
        error instanceof Error ? error.message : "error desconocido"
      }`,
    );
  }

  await auditoriaService.registrar({
    usuarioId: user.id,
    entidad: "ModificacionPoa",
    entidadId: id,
    accion: "EDITAR_OBSERVADA",
    estadoAnterior: current.estado,
    estadoNuevo: "observada",
    motivo: justificacion,
    ...auditMeta,
    payloadAnterior,
    payloadNuevo: {
      motivo,
      programaCodigo,
      actividadCodigo,
      itemCodigo,
      fuenteCodigo,
      responsableNuevoId: updateData.responsableNuevoId,
      responsableNuevoNombre: updateData.responsableNuevoNombre,
      observacionBienes: updateData.observacionBienes,
      tipoDiscrepancia: updateData.tipoDiscrepancia,
      montoPlanificadoNuevo,
      justificacion,
      informeRuta,
    },
  });

  return obtenerModificacionPoa(prisma, id);
}
