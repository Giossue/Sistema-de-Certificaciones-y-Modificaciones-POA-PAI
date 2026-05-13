import { PrismaClient } from "@prisma/client";
import { NotFoundError, ValidationError } from "../../../../common/errors/http-error.map";
import { AuditoriaParams, AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { centavosToDecimal, decimalToCentavos } from "../../../saldos/domain/saldo-calculator";
import { estadosVigentesCert } from "../../domain/constants/modificacion-estados.constants";
import { AuthUser } from "../../../../common/http/context.helpers";
import { obtenerModificacionPoa } from "../queries/obtener-modificacion-poa.query";

type AuditMeta = Pick<AuditoriaParams, "rol" | "ip" | "userAgent">;

type AplicarModificacionPoaParams = {
  prisma: PrismaClient;
  auditoriaService: AuditoriaService;
  id: string;
  user: AuthUser;
  auditMeta: AuditMeta;
};

export async function aplicarModificacionPoa(params: AplicarModificacionPoaParams) {
  const { prisma, auditoriaService, id, user, auditMeta } = params;
  const mod = await prisma.modificacionPoa.findUnique({
    where: { id },
    include: { actividadOrigen: { include: { poaVersion: { include: { actividades: true } } } } },
  });
  if (!mod) throw new NotFoundError("Modificación POA", id);
  if (mod.estado !== "aprobada") throw new ValidationError("Solo se puede aplicar una modificación aprobada");
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
          responsableUsuarioId: esOrigen ? mod.responsableNuevoId ?? actividad.responsableUsuarioId : actividad.responsableUsuarioId,
          responsableNombre: esOrigen ? mod.responsableNuevoNombre ?? actividad.responsableNombre : actividad.responsableNombre,
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

  await auditoriaService.registrar({
    usuarioId: user.id,
    entidad: "ModificacionPoa",
    entidadId: id,
    accion: "APLICAR",
    estadoAnterior: mod.estado,
    estadoNuevo: "aplicada",
    motivo: result.numero || undefined,
    ...auditMeta,
    payloadNuevo: {
      nuevaPoaVersionId: result.nuevaPoaVersionId,
      nuevaActividadId: result.nuevaActividadId,
    },
  });
  return obtenerModificacionPoa(prisma, id);
}
