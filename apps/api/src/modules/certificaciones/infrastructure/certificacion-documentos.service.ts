import { mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "../../../config/env";

type CertificacionDocumentoData = {
  id: string;
  tipo: string;
  numero: string;
  monto: string;
  conIva: boolean;
  solicitanteNombre: string;
  programaCodigo: string;
  programaNombre: string;
  actividadCodigo: string;
  actividadNombre: string;
  itemCodigo: string;
  itemNombre: string;
  fuenteCodigo: string;
  fuenteNombre: string;
  fecha: Date;
};

export class CertificacionDocumentosService {
  async guardarAdjunto(certificacionId: string, archivo: File): Promise<{
    tipo: string;
    ruta: string;
    nombreOriginal: string;
    tamano: number;
    mimeType: string;
  }> {
    const dir = join(env.UPLOAD_DIR, "certificaciones", certificacionId);
    await mkdir(dir, { recursive: true });
    const safeName = this.safeFileName(archivo.name);
    const ruta = join(dir, `${Date.now()}-${safeName}`);
    await Bun.write(ruta, await archivo.arrayBuffer());
    return {
      tipo: "habilitante",
      ruta,
      nombreOriginal: archivo.name,
      tamano: archivo.size,
      mimeType: archivo.type || "application/octet-stream",
    };
  }

  async generarCertificacionPdf(data: CertificacionDocumentoData): Promise<string> {
    const dir = join(env.GENERATED_DIR, "certificaciones", data.id);
    await mkdir(dir, { recursive: true });
    const ruta = join(dir, `certificacion-${data.numero}.pdf`);
    await Bun.write(ruta, this.crearPdfBuffer(await this.renderTemplate("certificacion-v1.txt", data)));
    return ruta;
  }

  async generarMemorandoPdf(data: CertificacionDocumentoData): Promise<string> {
    const dir = join(env.GENERATED_DIR, "certificaciones", data.id);
    await mkdir(dir, { recursive: true });
    const ruta = join(dir, `memorando-${data.numero}.pdf`);
    await Bun.write(ruta, this.crearPdfBuffer(await this.renderTemplate("memorando-v1.txt", data)));
    return ruta;
  }

  private async renderTemplate(templateName: string, data: CertificacionDocumentoData): Promise<string[]> {
    const templateDir = join(dirname(fileURLToPath(import.meta.url)), "templates");
    const template = await readFile(join(templateDir, templateName), "utf8");
    const values: Record<string, string> = {
      numero: data.numero,
      tipo: data.tipo,
      fecha: data.fecha.toLocaleDateString("es-EC"),
      solicitanteNombre: data.solicitanteNombre,
      programaCodigo: data.programaCodigo,
      programaNombre: data.programaNombre,
      actividadCodigo: data.actividadCodigo,
      actividadNombre: data.actividadNombre,
      itemCodigo: data.itemCodigo,
      itemNombre: data.itemNombre,
      fuenteCodigo: data.fuenteCodigo,
      fuenteNombre: data.fuenteNombre,
      monto: data.monto,
      ivaTexto: data.conIva ? "incluye IVA" : "sin IVA",
    };

    return template
      .replace(/\{\{(\w+)\}\}/g, (_, key: string) => values[key] ?? "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
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
    for (let i = 1; i <= objects.length; i++) {
      pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return Buffer.from(pdf, "utf8");
  }

  private escapePdf(value: string): string {
    return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  }

  private safeFileName(value: string): string {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "_");
  }
}
