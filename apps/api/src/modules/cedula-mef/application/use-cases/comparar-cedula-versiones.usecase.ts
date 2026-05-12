import { PrismaClient } from "@prisma/client";
import { ParsedRow } from "../dto/importar-cedula.dto";

export interface DiffEntrada {
  tipo: "agregada" | "modificada" | "retirada";
  clave: string;
  datosAnteriores?: Record<string, string>;
  datosNuevos?: Record<string, string>;
}

export interface DiffResult {
  versionAnteriorId: string | null;
  versionNuevaId: string;
  agregadas: DiffEntrada[];
  modificadas: DiffEntrada[];
  retiradas: DiffEntrada[];
  totalAgregadas: number;
  totalModificadas: number;
  totalRetiradas: number;
}

export class CompararCedulaVersionesUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(versionNuevaId: string): Promise<DiffResult> {
    const versionNueva = await this.prisma.cedulaMefVersion.findUnique({
      where: { id: versionNuevaId },
      include: {
        entradas: true,
        periodoFiscal: true,
      },
    });

    if (!versionNueva) {
      throw new Error("Versión nueva no encontrada");
    }

    const resultado: DiffResult = {
      versionAnteriorId: null,
      versionNuevaId,
      agregadas: [],
      modificadas: [],
      retiradas: [],
      totalAgregadas: 0,
      totalModificadas: 0,
      totalRetiradas: 0,
    };

    // Obtener versión anterior (la más reciente distinta a la nueva)
    const versionAnterior = await this.prisma.cedulaMefVersion.findFirst({
      where: {
        periodoFiscalId: versionNueva.periodoFiscalId,
        id: { not: versionNuevaId },
        vigente: false,
      },
      orderBy: { createdAt: "desc" },
      include: { entradas: true },
    });

    if (!versionAnterior) {
      // Primera importación: todo es "agregado"
      resultado.versionAnteriorId = null;
      for (const entrada of versionNueva.entradas) {
        resultado.agregadas.push(this.entradaToDiff(entrada, "agregada"));
      }
      resultado.totalAgregadas = versionNueva.entradas.length;
      return resultado;
    }

    resultado.versionAnteriorId = versionAnterior.id;

    // Indexar entradas anteriores por clave compuesta
    const anterioresMap = new Map<string, any>();
    for (const entrada of versionAnterior.entradas) {
      const clave = this.claveComposta(entrada);
      anterioresMap.set(clave, entrada);
    }

    // Indexar entradas nuevas por clave compuesta
    const nuevasMap = new Map<string, any>();
    for (const entrada of versionNueva.entradas) {
      const clave = this.claveComposta(entrada);
      nuevasMap.set(clave, entrada);
    }

    // Comparar: buscar agregadas y modificadas
    for (const [clave, entradaNueva] of nuevasMap) {
      const entradaAnterior = anterioresMap.get(clave);
      if (!entradaAnterior) {
        resultado.agregadas.push(this.entradaToDiff(entradaNueva, "agregada"));
        resultado.totalAgregadas++;
      } else {
        // Verificar si hubo modificación en montos
        if (
          entradaAnterior.montoCodificado !== entradaNueva.montoCodificado ||
          entradaAnterior.montoDevengado !== entradaNueva.montoDevengado ||
          entradaAnterior.saldoDisponible !== entradaNueva.saldoDisponible
        ) {
          resultado.modificadas.push({
            tipo: "modificada",
            clave,
            datosAnteriores: {
              programaCodigo: entradaAnterior.programaCodigo,
              actividadCodigo: entradaAnterior.actividadCodigo,
              itemCodigo: entradaAnterior.itemCodigo,
              fuenteCodigo: entradaAnterior.fuenteCodigo,
              montoCodificado: String(entradaAnterior.montoCodificado),
              montoDevengado: String(entradaAnterior.montoDevengado),
              saldoDisponible: String(entradaAnterior.saldoDisponible),
            },
            datosNuevos: {
              programaCodigo: entradaNueva.programaCodigo,
              actividadCodigo: entradaNueva.actividadCodigo,
              itemCodigo: entradaNueva.itemCodigo,
              fuenteCodigo: entradaNueva.fuenteCodigo,
              montoCodificado: String(entradaNueva.montoCodificado),
              montoDevengado: String(entradaNueva.montoDevengado),
              saldoDisponible: String(entradaNueva.saldoDisponible),
            },
          });
          resultado.totalModificadas++;
        }
        // Si no cambió, no se agrega a ninguna lista
        anterioresMap.delete(clave);
      }
    }

    // Las que quedaron en anterioresMap son "retiradas"
    for (const [, entradaAnterior] of anterioresMap) {
      resultado.retiradas.push(this.entradaToDiff(entradaAnterior, "retirada"));
      resultado.totalRetiradas++;
    }

    return resultado;
  }

  private claveComposta(entrada: any): string {
    return `${entrada.programaCodigo}|${entrada.actividadCodigo}|${entrada.itemCodigo}|${entrada.fuenteCodigo}`;
  }

  private entradaToDiff(entrada: any, tipo: "agregada" | "retirada"): DiffEntrada {
    return {
      tipo,
      clave: this.claveComposta(entrada),
      datosAnteriores: tipo === "retirada" ? {
        programaCodigo: entrada.programaCodigo,
        actividadCodigo: entrada.actividadCodigo,
        itemCodigo: entrada.itemCodigo,
        fuenteCodigo: entrada.fuenteCodigo,
        programaNombre: entrada.programaNombre,
        actividadNombre: entrada.actividadNombre,
        itemNombre: entrada.itemNombre,
        fuenteNombre: entrada.fuenteNombre,
        montoCodificado: String(entrada.montoCodificado),
      } : undefined,
      datosNuevos: tipo === "agregada" ? {
        programaCodigo: entrada.programaCodigo,
        actividadCodigo: entrada.actividadCodigo,
        itemCodigo: entrada.itemCodigo,
        fuenteCodigo: entrada.fuenteCodigo,
        programaNombre: entrada.programaNombre,
        actividadNombre: entrada.actividadNombre,
        itemNombre: entrada.itemNombre,
        fuenteNombre: entrada.fuenteNombre,
        montoCodificado: String(entrada.montoCodificado),
      } : undefined,
    };
  }
}
