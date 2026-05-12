import { PrismaClient } from "@prisma/client";
import { AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { ImportarCedulaDto } from "../dto/importar-cedula.dto";

export class ImportarCedulaMefUseCase {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly parser: { calcularHash(b: Buffer): string; parse(b: Buffer, n: string): { filas: any[]; errores: any[] } },
    private readonly auditoria: AuditoriaService
  ) {}

  async execute(dto: ImportarCedulaDto) {
    const hash = this.parser.calcularHash(dto.archivoBuffer);
    const existente = await this.prisma.cedulaMefVersion.findFirst({
      where: { archivoHash: hash },
    });

    if (existente) {
      throw new Error(`Ya existe una versión de cédula con hash ${hash.slice(0, 8)}...`);
    }

    const parseResult = this.parser.parse(dto.archivoBuffer, dto.archivoNombre);

    if (parseResult.errores.length > 0) {
      const detalle = parseResult.errores
        .slice(0, 10)
        .map((e: any) => `fila ${e.fila}, ${e.columna}: ${e.mensaje}`)
        .join("; ");
      throw new Error(`El archivo contiene errores de importación: ${detalle}`);
    }

    if (parseResult.filas.length === 0) {
      throw new Error("El archivo no contiene filas válidas para importar");
    }

    const resultado = await this.prisma.$transaction(async (tx) => {
      await tx.cedulaMefVersion.updateMany({
        where: { periodoFiscalId: dto.periodoFiscalId, vigente: true },
        data: { vigente: false },
      });

      const version = await tx.cedulaMefVersion.create({
        data: {
          periodoFiscalId: dto.periodoFiscalId,
          archivoNombre: dto.archivoNombre,
          archivoHash: hash,
          corteFecha: new Date(),
          vigente: true,
          importadoPor: dto.importadoPor,
        },
      });

      let montoTotalCentavos = 0n;
      const entradasData = parseResult.filas.map((fila: any) => {
        montoTotalCentavos += this.toCentavos(fila.montoCodificado);
        return {
          versionId: version.id,
          programaCodigo: fila.programaCodigo,
          programaNombre: fila.programaNombre,
          actividadCodigo: fila.actividadCodigo,
          actividadNombre: fila.actividadNombre,
          itemCodigo: fila.itemCodigo,
          itemNombre: fila.itemNombre,
          fuenteCodigo: fila.fuenteCodigo,
          fuenteNombre: fila.fuenteNombre,
          montoCodificado: fila.montoCodificado,
          montoDevengado: fila.montoDevengado,
          saldoDisponible: fila.saldoDisponible,
        };
      });

      await tx.cedulaMefEntrada.createMany({ data: entradasData });

      return {
        versionId: version.id,
        totalFilas: parseResult.filas.length,
        filasValidas: parseResult.filas.length,
        filasIgnoradas: parseResult.errores.length,
        montoTotal: Number(montoTotalCentavos) / 100,
        hashArchivo: hash,
      };
    });

    await this.auditoria.registrar({
      usuarioId: dto.importadoPor,
      entidad: "CedulaMefVersion",
      entidadId: resultado.versionId,
      accion: "IMPORTAR",
      estadoNuevo: "vigente",
      motivo: `Importación de ${dto.archivoNombre}: ${resultado.filasValidas} filas`,
    });

    return resultado;
  }

  private toCentavos(decimal: string): bigint {
    const negative = decimal.startsWith("-");
    const unsigned = negative ? decimal.slice(1) : decimal;
    const [integerPart, decimalPart = ""] = unsigned.split(".");
    const centavos = BigInt(integerPart || "0") * 100n + BigInt(decimalPart.padEnd(2, "0").slice(0, 2));
    return negative ? -centavos : centavos;
  }
}
