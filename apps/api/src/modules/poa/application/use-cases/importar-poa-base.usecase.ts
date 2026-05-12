import { PrismaClient } from "@prisma/client";
import { AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";

export interface ImportarPoaBaseDto {
  archivoBuffer: Buffer;
  archivoNombre: string;
  periodoFiscalId: string;
  importadoPor: string;
  unidadId?: string;
}

export interface ImportarPoaBaseResult {
  poaVersionId: string;
  totalActividades: number;
  programasUnicos: number;
  actividadesUnicas: number;
  itemsUnicos: number;
  fuentesUnicas: number;
  montoTotal: number;
}

export interface ParsedPoaRow {
  programaCodigo: string;
  programaNombre: string;
  actividadCodigo: string;
  actividadNombre: string;
  itemCodigo: number;
  itemNombre: string;
  fuenteCodigo: string;
  fuenteNombre: string;
  montoAsignado: number;
  saldoDisponible: number;
  descripcionActividad: string;
  objetivoEstrategico: string;
  objetivoOperativo: string;
  nombrePrograma: string;
  nombreProyecto: string;
  responsable: string;
  grupoGasto: number;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class ImportarPoaBaseUseCase {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly auditoria: AuditoriaService
  ) {}

  async execute(dto: ImportarPoaBaseDto): Promise<ImportarPoaBaseResult> {
    if (!UUID_REGEX.test(dto.periodoFiscalId)) {
      throw new Error("periodoFiscalId debe ser un UUID válido");
    }
    const rows = this.parseExcel(dto.archivoBuffer);

    if (rows.length === 0) {
      throw new Error("El archivo no contiene filas válidas para importar");
    }

    const resultado = await this.prisma.$transaction(async (tx) => {
      // 1. Obtener siguiente número de versión para este periodo
      const ultimaVersion = await tx.poaVersion.findFirst({
        where: { periodoFiscalId: dto.periodoFiscalId },
        orderBy: { numeroVersion: "desc" },
      });
      const siguienteVersion = (ultimaVersion?.numeroVersion ?? 0) + 1;

      // 2. Marcar versiones anteriores como no vigentes
      await tx.poaVersion.updateMany({
        where: { periodoFiscalId: dto.periodoFiscalId, vigente: true },
        data: { vigente: false },
      });

      // 3. Crear nueva versión POA
      const poaVersion = await tx.poaVersion.create({
        data: {
          periodoFiscalId: dto.periodoFiscalId,
          numeroVersion: siguienteVersion,
          estado: "vigente",
          vigente: true,
          createdBy: dto.importadoPor,
        },
      });

      // 4. Crear actividades
      const actividadesData = rows.map((row) => ({
        poaVersionId: poaVersion.id,
        unidadId: dto.unidadId || null,
        programaCodigo: row.programaCodigo,
        programaNombre: row.programaNombre,
        actividadCodigo: row.actividadCodigo,
        actividadNombre: row.actividadNombre,
        itemCodigo: String(row.itemCodigo),
        itemNombre: row.itemNombre,
        fuenteCodigo: row.fuenteCodigo,
        fuenteNombre: row.fuenteNombre,
        montoPlanificado: row.montoAsignado,
        saldoDisponible: row.saldoDisponible,
      }));

      await tx.actividadesPoa.createMany({ data: actividadesData });

      // 5. Calcular estadísticas
      const programasUnicos = [...new Set(rows.map((r) => r.programaCodigo))].length;
      const actividadesUnicas = [...new Set(rows.map((r) => `${r.programaCodigo}|${r.actividadCodigo}`))].length;
      const itemsUnicos = [...new Set(rows.map((r) => r.itemCodigo))].length;
      const fuentesUnicas = [...new Set(rows.map((r) => r.fuenteCodigo))].length;
      const montoTotal = rows.reduce((sum, r) => sum + Number(r.montoAsignado), 0);

      return {
        poaVersionId: poaVersion.id,
        totalActividades: rows.length,
        programasUnicos,
        actividadesUnicas,
        itemsUnicos,
        fuentesUnicas,
        montoTotal,
      };
    });

    // 6. Registrar auditoría
    await this.auditoria.registrar({
      usuarioId: dto.importadoPor,
      entidad: "PoaVersion",
      entidadId: resultado.poaVersionId,
      accion: "IMPORTAR_POABASE",
      estadoNuevo: "vigente",
      motivo: `Importación POA-BASE: ${resultado.totalActividades} actividades, ${resultado.programasUnicos} programas`,
    });

    return resultado;
  }

  private parseExcel(buffer: Buffer): ParsedPoaRow[] {
    const XLSX = require("xlsx");
    const workbook = XLSX.read(buffer, { type: "buffer", cellText: false, cellNF: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[];

    if (rawData.length < 10) return [];

    const headers = rawData[9]; // Row index 9 is the header row
    const dataRows = rawData.slice(10);

    // Column indices (based on analysis):
    // 0=No, 1=OE, 2=OO, 3=PROGRAMAS, 4=PROYECTO, 5=RESPONSABLE,
    // 6-17=meses, 18=PRESUPUESTO, 19=ASIGNADO, 20=CERTIFICACIONES, 21=MODIFICACIONES, 22=SALDO,
    // 23=Descripción, 24=PROGRAMA, 25=actividad, 26=FUENTE, 27=Item, 28=Grupo, 29=Detalle, 30=OBSERVACION

    const rows: ParsedPoaRow[] = [];

    for (const raw of dataRows) {
      const programaCodigo = String(raw[24] ?? "").trim();
      const actividadCodigo = String(raw[25] ?? "").trim();
      const itemCodigo = raw[27];
      const fuenteCodigo = String(raw[26] ?? "").trim();

      // Skip rows without required fields
      if (!programaCodigo || !actividadCodigo || !itemCodigo || !fuenteCodigo) continue;

      const montoAsignado = Number(raw[19]) || 0;
      const saldoDisponible = Number(raw[22]) || montoAsignado;

      // Get item name from column 29 (Detalle Item) or fallback
      const itemNombre = String(raw[29] ?? raw[27] ?? "").trim() || String(itemCodigo);

      // Get fuente name - derive from source number
      const fuenteNum = parseInt(fuenteCodigo) || 1;
      const fuenteNombreMap: Record<string, string> = {
        "001": "Recursos Propios",
        "002": "Recursos Fiscales",
        "003": "Recursos Provenientes de Preasignaciones",
      };
      const fuenteNombre = fuenteNombreMap[fuenteCodigo] || `Fuente ${fuenteCodigo}`;

      // Get programa nombre from column 3
      const programaNombre = String(raw[3] ?? raw[24] ?? "").trim() || programaCodigo;

      // Get actividad nombre - use objective operativo as reference, or build from columns
      const actividadNombre = String(raw[2] ?? raw[25] ?? "").trim() || actividadCodigo;

      // Clean actividad codigo (remove spaces if any)
      const cleanActividad = actividadCodigo.replace(/\s+/g, "").replace(/^0+/, "") || actividadCodigo;

      rows.push({
        programaCodigo,
        programaNombre,
        actividadCodigo: cleanActividad,
        actividadNombre,
        itemCodigo: Number(itemCodigo),
        itemNombre,
        fuenteCodigo,
        fuenteNombre,
        montoAsignado,
        saldoDisponible,
        descripcionActividad: String(raw[23] ?? "").trim(),
        objetivoEstrategico: String(raw[1] ?? "").trim(),
        objetivoOperativo: String(raw[2] ?? "").trim(),
        nombrePrograma: String(raw[3] ?? "").trim(),
        nombreProyecto: String(raw[4] ?? "").trim(),
        responsable: String(raw[5] ?? "").trim(),
        grupoGasto: Number(raw[28]) || 0,
      });
    }

    return rows;
  }
}
