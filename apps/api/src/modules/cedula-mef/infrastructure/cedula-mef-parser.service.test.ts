import { describe, expect, test } from "bun:test";
import * as XLSX from "xlsx";
import { CedulaMefParserService } from "./cedula-mef-parser.service";

const headers = [
  "PROGRAMA",
  "PROGRAMA_NOMBRE",
  "ACTIVIDAD",
  "ACTIVIDAD_NOMBRE",
  "ITEM",
  "ITEM_NOMBRE",
  "FUENTE",
  "FUENTE_NOMBRE",
  "MONTO_CODIFICADO",
  "MONTO_DEVENGADO",
  "SALDO_DISPONIBLE",
];

function workbookBuffer(rows: unknown[][]): Buffer {
  const worksheet = XLSX.utils.aoa_to_sheet([headers, [], ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Cedula");
  return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
}

describe("CedulaMefParserService", () => {
  test("parsea una cédula válida y normaliza montos", () => {
    const parser = new CedulaMefParserService();
    const result = parser.parse(
      workbookBuffer([
        ["01", "Administración", "001", "Gestión", "530809", "Medicamentos", "001", "Fiscal", "1,234.50", "0", "1234,50"],
      ]),
      "cedula.xlsx"
    );

    expect(result.errores).toHaveLength(0);
    expect(result.filas).toHaveLength(1);
    expect(result.filas[0].montoCodificado).toBe("1234.50");
    expect(result.filas[0].saldoDisponible).toBe("1234.50");
  });

  test("rechaza combinaciones presupuestarias duplicadas", () => {
    const parser = new CedulaMefParserService();
    const row = ["01", "Administración", "001", "Gestión", "530809", "Medicamentos", "001", "Fiscal", "100.00", "0", "100.00"];
    const result = parser.parse(workbookBuffer([row, row]), "cedula.xlsx");

    expect(result.errores.some((error) => error.mensaje.includes("duplicada"))).toBe(true);
    expect(result.filas).toHaveLength(1);
  });
});
