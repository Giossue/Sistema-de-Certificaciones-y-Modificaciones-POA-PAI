import { createHash } from "crypto";
import * as XLSX from "xlsx";
import type { ParseResult, ParsedRow } from "../application/dto/importar-cedula.dto";

export class CedulaMefParserService {
  calcularHash(buffer: Buffer): string {
    return createHash("sha256").update(buffer).digest("hex");
  }

  parse(buffer: Buffer, _archivoNombre: string): ParseResult {
    const result: ParseResult = { filas: [], errores: [] };

    try {
      const workbook = XLSX.read(buffer, { type: "buffer", cellText: false, cellNF: true });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "" });

      if (rows.length < 2) {
        result.errores.push({ fila: 0, columna: "-", mensaje: "El archivo no contiene suficientes filas" });
        return result;
      }

      // Headers en fila 0
      const headers = rows[0].map((h: any) => String(h).toUpperCase().trim());

      // Mapeo de columnas
      const colMap: Record<string, number> = {
        PROGRAMA: this.findColumn(headers, ["PROGRAMA", "PROGRAMA_CODIGO", "CODIGO_PROGRAMA", "COD.PROG"]),
        PROGRAMA_NOMBRE: this.findColumn(headers, ["PROGRAMA_NOMBRE", "NOMBRE_PROGRAMA", "DESC.PROGRAMA"]),
        ACTIVIDAD: this.findColumn(headers, ["ACTIVIDAD", "ACTIVIDAD_CODIGO", "CODIGO_ACTIVIDAD", "COD.ACT"]),
        ACTIVIDAD_NOMBRE: this.findColumn(headers, ["ACTIVIDAD_NOMBRE", "NOMBRE_ACTIVIDAD", "DESC.ACTIVIDAD"]),
        ITEM: this.findColumn(headers, ["ITEM", "ITEM_CODIGO", "CODIGO_ITEM", "COD.ITEM"]),
        ITEM_NOMBRE: this.findColumn(headers, ["ITEM_NOMBRE", "NOMBRE_ITEM", "DESC.ITEM"]),
        FUENTE: this.findColumn(headers, ["FUENTE", "FUENTE_CODIGO", "CODIGO_FUENTE", "COD.FTE"]),
        FUENTE_NOMBRE: this.findColumn(headers, ["FUENTE_NOMBRE", "NOMBRE_FUENTE", "DESC.FUENTE"]),
        MONTO_CODIFICADO: this.findColumn(headers, ["MONTO_CODIFICADO", "CODIFICADO", "MONTO CODIFICADO", "CODIFIC"]),
        MONTO_DEVENGADO: this.findColumn(headers, ["MONTO_DEVENGADO", "DEVENGADO", "MONTO DEVENGADO", "DEV"]),
        SALDO_DISPONIBLE: this.findColumn(headers, ["SALDO_DISPONIBLE", "SALDO", "SALDO DISPONIBLE"]),
      };

      // Validar columnas requeridas
      const requiredCols = [
        "PROGRAMA",
        "PROGRAMA_NOMBRE",
        "ACTIVIDAD",
        "ACTIVIDAD_NOMBRE",
        "ITEM",
        "ITEM_NOMBRE",
        "FUENTE",
        "FUENTE_NOMBRE",
        "MONTO_CODIFICADO",
        "SALDO_DISPONIBLE",
      ];
      for (const col of requiredCols) {
        if (colMap[col] === undefined || colMap[col] === -1) {
          result.errores.push({ fila: 1, columna: col, mensaje: `Columna requerida no encontrada: ${col}` });
        }
      }

      if (result.errores.length > 0) {
        return result;
      }

      const combinaciones = new Set<string>();

      // Parsear filas de datos (desde fila 2)
      for (let i = 2; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0 || this.isEmptyRow(row)) continue;

        try {
          const programaCodigo = this.cleanText(row[colMap["PROGRAMA"]]);
          const programaNombre = this.cleanText(row[colMap["PROGRAMA_NOMBRE"]]);
          const actividadCodigo = this.cleanText(row[colMap["ACTIVIDAD"]]);
          const actividadNombre = this.cleanText(row[colMap["ACTIVIDAD_NOMBRE"]]);
          const itemCodigo = this.cleanText(row[colMap["ITEM"]]);
          const itemNombre = this.cleanText(row[colMap["ITEM_NOMBRE"]]);
          const fuenteCodigo = this.cleanText(row[colMap["FUENTE"]]);
          const fuenteNombre = this.cleanText(row[colMap["FUENTE_NOMBRE"]]);
          const montoCodificado = this.normalizarMonto(row[colMap["MONTO_CODIFICADO"]]);
          const montoDevengado = colMap["MONTO_DEVENGADO"] === -1 ? "0.00" : this.normalizarMonto(row[colMap["MONTO_DEVENGADO"]]);
          const saldoDisponible = this.normalizarMonto(row[colMap["SALDO_DISPONIBLE"]]);

          if (!programaCodigo && !actividadCodigo && !itemCodigo && !fuenteCodigo) continue;

          const campos = {
            PROGRAMA: programaCodigo,
            PROGRAMA_NOMBRE: programaNombre,
            ACTIVIDAD: actividadCodigo,
            ACTIVIDAD_NOMBRE: actividadNombre,
            ITEM: itemCodigo,
            ITEM_NOMBRE: itemNombre,
            FUENTE: fuenteCodigo,
            FUENTE_NOMBRE: fuenteNombre,
          };
          for (const [columna, valor] of Object.entries(campos)) {
            if (!valor) {
              result.errores.push({ fila: i + 1, columna, mensaje: "Campo obligatorio vacío" });
            }
          }
          if (!montoCodificado) {
            result.errores.push({ fila: i + 1, columna: "MONTO_CODIFICADO", mensaje: "Monto inválido" });
          }
          if (!montoDevengado) {
            result.errores.push({ fila: i + 1, columna: "MONTO_DEVENGADO", mensaje: "Monto inválido" });
          }
          if (!saldoDisponible) {
            result.errores.push({ fila: i + 1, columna: "SALDO_DISPONIBLE", mensaje: "Monto inválido" });
          }

          if (result.errores.some((e) => e.fila === i + 1)) continue;

          const clave = `${programaCodigo}|${actividadCodigo}|${itemCodigo}|${fuenteCodigo}`;
          if (combinaciones.has(clave)) {
            result.errores.push({ fila: i + 1, columna: "-", mensaje: `Combinación presupuestaria duplicada: ${clave}` });
            continue;
          }
          combinaciones.add(clave);

          const parsedRow: ParsedRow = {
            programaCodigo,
            programaNombre,
            actividadCodigo,
            actividadNombre,
            itemCodigo,
            itemNombre,
            fuenteCodigo,
            fuenteNombre,
            montoCodificado: montoCodificado!,
            montoDevengado: montoDevengado!,
            saldoDisponible: saldoDisponible!,
          };

          result.filas.push(parsedRow);
        } catch (err: any) {
          result.errores.push({ fila: i + 1, columna: "-", mensaje: `Error al parsear fila: ${err.message}` });
        }
      }
    } catch (err: any) {
      result.errores.push({ fila: 0, columna: "-", mensaje: `Error al leer archivo: ${err.message}` });
    }

    return result;
  }

  private findColumn(headers: string[], candidates: string[]): number {
    for (const candidate of candidates) {
      const idx = headers.findIndex((h) => h === candidate || h.includes(candidate));
      if (idx !== -1) return idx;
    }
    return -1;
  }

  private isEmptyRow(row: any[]): boolean {
    return row.every((cell) => cell === "" || cell === null || cell === undefined);
  }

  private cleanText(value: unknown): string {
    return String(value ?? "").trim();
  }

  private normalizarMonto(value: unknown): string | null {
    const raw = String(value ?? "").trim();
    if (!raw) return null;

    let cleaned = raw.replace(/\$/g, "").replace(/\s/g, "");
    const lastDot = cleaned.lastIndexOf(".");
    const lastComma = cleaned.lastIndexOf(",");

    if (lastDot !== -1 && lastComma !== -1) {
      cleaned = lastComma > lastDot ? cleaned.replace(/\./g, "").replace(",", ".") : cleaned.replace(/,/g, "");
    } else if (lastComma !== -1) {
      const decimalPlaces = cleaned.length - lastComma - 1;
      cleaned = decimalPlaces > 0 && decimalPlaces <= 2 ? cleaned.replace(",", ".") : cleaned.replace(/,/g, "");
    }

    if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;

    const negative = cleaned.startsWith("-");
    const unsigned = negative ? cleaned.slice(1) : cleaned;
    const [integerPartRaw, decimalPartRaw = ""] = unsigned.split(".");
    if (decimalPartRaw.length > 2) return null;

    const integerPart = integerPartRaw.replace(/^0+(?=\d)/, "") || "0";
    const decimalPart = decimalPartRaw.padEnd(2, "0");
    return `${negative ? "-" : ""}${integerPart}.${decimalPart}`;
  }
}
