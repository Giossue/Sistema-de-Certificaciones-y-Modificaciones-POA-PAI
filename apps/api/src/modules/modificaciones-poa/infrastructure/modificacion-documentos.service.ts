import { mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "../../../config/env";

type InformeData = {
  id: string;
  numero: string;
  motivo: string;
  programaAnterior: string;
  programaNuevo: string;
  actividadAnterior: string;
  actividadNueva: string;
  itemAnterior: string;
  itemNuevo: string;
  fuente: string;
  montoAnterior: string;
  montoNuevo: string;
  fecha: Date;
};

export class ModificacionDocumentosService {
  async generarInformeTecnico(data: InformeData): Promise<string> {
    const dir = join(env.GENERATED_DIR, "modificaciones-poa", data.id);
    await mkdir(dir, { recursive: true });
    const ruta = join(dir, `informe-${data.numero}.pdf`);
    const templateDir = join(dirname(fileURLToPath(import.meta.url)), "templates");
    const template = await readFile(join(templateDir, "informe-tecnico-v1.txt"), "utf8");
    const lines = template
      .replace(/\{\{(\w+)\}\}/g, (_, key: keyof InformeData) => {
        const value = data[key];
        return value instanceof Date ? value.toLocaleDateString("es-EC") : String(value ?? "");
      })
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    await Bun.write(ruta, this.crearPdfBuffer(lines));
    return ruta;
  }

  private crearPdfBuffer(lines: string[]): Buffer {
    const content = [
      "BT",
      "/F1 18 Tf",
      "72 760 Td",
      `(${this.escapePdf(lines[0] ?? "")}) Tj`,
      "/F1 11 Tf",
      ...lines.slice(1).flatMap((line) => ["0 -24 Td", `(${this.escapePdf(line)}) Tj`]),
      "ET",
    ].join("\n");

    const objects = [
      "<< /Type /Catalog /Pages 2 0 R >>",
      "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
      `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`,
    ];

    let pdf = "%PDF-1.4\n";
    const offsets: number[] = [0];
    objects.forEach((object, index) => {
      offsets[index + 1] = Buffer.byteLength(pdf, "utf8");
      pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });
    const xrefOffset = Buffer.byteLength(pdf, "utf8");
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= objects.length; i++) pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return Buffer.from(pdf, "utf8");
  }

  private escapePdf(value: string): string {
    return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  }
}
