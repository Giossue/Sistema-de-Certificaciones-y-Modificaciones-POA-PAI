import { PrismaClient } from "@prisma/client";

export interface ValidacionCedulaResult {
  valido: boolean;
  errores: string[];
  entradaCedula?: {
    id: string;
    programaCodigo: string;
    programaNombre: string;
    actividadCodigo: string;
    actividadNombre: string;
    itemCodigo: string;
    itemNombre: string;
    fuenteCodigo: string;
    fuenteNombre: string;
    montoCodificado: any;
    saldoDisponible: any;
  };
}

export class ValidarCombinacionCedulaUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(params: {
    periodoFiscalId: string;
    programaCodigo: string;
    actividadCodigo: string;
    itemCodigo: string;
    fuenteCodigo: string;
  }): Promise<ValidacionCedulaResult> {
    const result: ValidacionCedulaResult = { valido: true, errores: [] };

    // Obtener cédula vigente
    const version = await this.prisma.cedulaMefVersion.findFirst({
      where: { periodoFiscalId: params.periodoFiscalId, vigente: true },
    });

    if (!version) {
      result.valido = false;
      result.errores.push("No existe una cédula MEF vigente para este periodo fiscal");
      return result;
    }

    // Buscar la combinación exacta
    const entrada = await this.prisma.cedulaMefEntrada.findFirst({
      where: {
        versionId: version.id,
        programaCodigo: params.programaCodigo,
        actividadCodigo: params.actividadCodigo,
        itemCodigo: params.itemCodigo,
        fuenteCodigo: params.fuenteCodigo,
      },
    });

    if (!entrada) {
      result.valido = false;

      // Determinar cuál falla — para mensaje específico
      const existePrograma = await this.prisma.cedulaMefEntrada.findFirst({
        where: { versionId: version.id, programaCodigo: params.programaCodigo },
      });
      if (!existePrograma) {
        result.errores.push(`Programa '${params.programaCodigo}' no existe en la cédula MEF vigente`);
      } else {
        const existeActividad = await this.prisma.cedulaMefEntrada.findFirst({
          where: {
            versionId: version.id,
            programaCodigo: params.programaCodigo,
            actividadCodigo: params.actividadCodigo,
          },
        });
        if (!existeActividad) {
          result.errores.push(`Actividad '${params.actividadCodigo}' no existe en el programa '${params.programaCodigo}'`);
        } else {
          const existeItem = await this.prisma.cedulaMefEntrada.findFirst({
            where: {
              versionId: version.id,
              programaCodigo: params.programaCodigo,
              actividadCodigo: params.actividadCodigo,
              itemCodigo: params.itemCodigo,
            },
          });
          if (!existeItem) {
            result.errores.push(`Ítem '${params.itemCodigo}' no existe en la combinación programa+actividad`);
          } else {
            const existeFuente = await this.prisma.cedulaMefEntrada.findFirst({
              where: {
                versionId: version.id,
                programaCodigo: params.programaCodigo,
                actividadCodigo: params.actividadCodigo,
                itemCodigo: params.itemCodigo,
                fuenteCodigo: params.fuenteCodigo,
              },
            });
            if (!existeFuente) {
              result.errores.push(`Fuente '${params.fuenteCodigo}' no está asociada al ítem '${params.itemCodigo}' en esta combinación`);
            }
          }
        }
      }
      return result;
    }

    result.entradaCedula = {
      id: entrada.id,
      programaCodigo: entrada.programaCodigo,
      programaNombre: entrada.programaNombre,
      actividadCodigo: entrada.actividadCodigo,
      actividadNombre: entrada.actividadNombre,
      itemCodigo: entrada.itemCodigo,
      itemNombre: entrada.itemNombre,
      fuenteCodigo: entrada.fuenteCodigo,
      fuenteNombre: entrada.fuenteNombre,
      montoCodificado: entrada.montoCodificado,
      saldoDisponible: entrada.saldoDisponible,
    };

    return result;
  }
}
