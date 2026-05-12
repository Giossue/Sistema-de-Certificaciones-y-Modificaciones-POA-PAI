import { Context, Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import {
  CrearPoaVersionUseCase,
  ConsultarPoaVigenteUseCase,
  ImportarDesdeCedulaUseCase,
  ListarActividadesPoaUseCase as ListarActividadesPoaUseCaseOrig,
  ConsultarPoaPorIdUseCase,
  ImportarPoaBaseUseCase,
  ListarProgramasPoaUseCase,
  ListarActividadesPorProgramaPoaUseCase,
  ListarItemsPoaUseCase,
  ListarFuentesPoaUseCase,
} from "../../application/use-cases/index";
import { AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { ValidationError, NotFoundError } from "../../../../common/errors/http-error.map";
import { requirePermission } from "../../../../common/guards/auth.guard";
import { SaldosMotorService } from "../../../saldos/application/use-cases/saldos-motor.service";

const prisma = new PrismaClient();
const auditoriaService = new AuditoriaService(prisma);

const crearPoaUseCase = new CrearPoaVersionUseCase(prisma);
const consultarVigenteUseCase = new ConsultarPoaVigenteUseCase(prisma);
const importarDesdeCedulaUseCase = new ImportarDesdeCedulaUseCase(prisma);
const listarActividadesUseCase = new ListarActividadesPoaUseCaseOrig(prisma);
const consultarPorIdUseCase = new ConsultarPoaPorIdUseCase(prisma);
const importarPoaBaseUseCase = new ImportarPoaBaseUseCase(prisma, auditoriaService);
const listarProgramasUseCase = new ListarProgramasPoaUseCase(prisma);
const listarActividadesPoaUseCase = new ListarActividadesPorProgramaPoaUseCase(prisma);
const listarItemsPoaUseCase = new ListarItemsPoaUseCase(prisma);
const listarFuentesPoaUseCase = new ListarFuentesPoaUseCase(prisma);
const saldosMotor = new SaldosMotorService(prisma);

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class PoaController {
  async crear(c: Context) {
    const body = await c.req.json();
    const { periodoFiscalId } = body;
    const user = c.get("user") as { id: string } | undefined;

    if (!periodoFiscalId) {
      throw new ValidationError("periodoFiscalId es requerido");
    }

    const resultado = await crearPoaUseCase.execute({
      periodoFiscalId,
      createdBy: user?.id || "sistema",
    });

    return c.json({ success: true, data: resultado });
  }

  async consultarVigente(c: Context) {
    const periodoFiscalId = c.req.param("periodoFiscalId");
    if (!periodoFiscalId) {
      throw new ValidationError("periodoFiscalId es requerido");
    }
    if (!UUID_REGEX.test(periodoFiscalId)) {
      throw new ValidationError("periodoFiscalId debe ser un UUID válido");
    }
    const version = await consultarVigenteUseCase.execute(periodoFiscalId);

    if (!version) {
      throw new NotFoundError("POA vigente", periodoFiscalId);
    }

    return c.json({ success: true, data: version });
  }

  async importarDesdeCedula(c: Context) {
    const body = await c.req.json();
    const { cedulaVersionId } = body;

    if (!cedulaVersionId) {
      throw new ValidationError("cedulaVersionId es requerido");
    }

    try {
      const resultado = await importarDesdeCedulaUseCase.execute(
        { cedulaVersionId, poaVersionId: "" },
        "sistema"
      );
      return c.json({ success: true, data: resultado });
    } catch (err: any) {
      throw new ValidationError(err.message || "Error al importar desde cédula");
    }
  }

  async listarActividades(c: Context) {
    const versionId = c.req.param("versionId");
    if (!versionId) {
      throw new ValidationError("versionId es requerido");
    }
    const actividades = await listarActividadesUseCase.execute(versionId);
    return c.json({ success: true, data: actividades });
  }

  async getById(c: Context) {
    const id = c.req.param("id");
    if (!id) {
      throw new ValidationError("id es requerido");
    }
    const version = await consultarPorIdUseCase.execute(id);

    if (!version) {
      throw new NotFoundError("Versión POA", id);
    }

    return c.json({ success: true, data: version });
  }

  async importarPoaBase(c: Context) {
    const formData = await c.req.formData();
    const archivo = formData.get("archivo") as File | null;
    const periodoFiscalId = formData.get("periodoFiscalId") as string;
    const unidadId = formData.get("unidadId") as string | undefined;
    const user = c.get("user") as { id: string } | undefined;

    if (!archivo) {
      throw new ValidationError("Archivo no proporcionado");
    }
    if (!periodoFiscalId) {
      throw new ValidationError("periodoFiscalId es requerido");
    }
    if (!archivo.name.endsWith(".xlsx") && !archivo.name.endsWith(".xls")) {
      throw new ValidationError("Formato inválido. Solo se acepta Excel (.xlsx, .xls)");
    }

    const buffer = Buffer.from(await archivo.arrayBuffer());

    try {
      const resultado = await importarPoaBaseUseCase.execute({
        archivoBuffer: buffer,
        archivoNombre: archivo.name,
        periodoFiscalId,
        importadoPor: user?.id || "sistema",
        unidadId,
      });
      return c.json({ success: true, data: resultado });
    } catch (err: any) {
      throw new ValidationError(err.message || "Error al importar POA base");
    }
  }

  async listarProgramas(c: Context) {
    const periodoFiscalId = c.req.param("periodoFiscalId");
    if (!periodoFiscalId) throw new ValidationError("periodoFiscalId es requerido");
    const programas = await listarProgramasUseCase.execute(periodoFiscalId);
    return c.json({ success: true, data: programas });
  }

  async listarActividadesPoa(c: Context) {
    const periodoFiscalId = c.req.param("periodoFiscalId");
    const programaCodigo = c.req.query("programa") || undefined;
    if (!periodoFiscalId) throw new ValidationError("periodoFiscalId es requerido");
    const actividades = await listarActividadesPoaUseCase.execute(periodoFiscalId, programaCodigo);
    return c.json({ success: true, data: actividades });
  }

  async listarItemsPoa(c: Context) {
    const periodoFiscalId = c.req.param("periodoFiscalId");
    const programaCodigo = c.req.query("programa") || undefined;
    const actividadCodigo = c.req.query("actividad") || undefined;
    if (!periodoFiscalId) throw new ValidationError("periodoFiscalId es requerido");
    const items = await listarItemsPoaUseCase.execute(periodoFiscalId, programaCodigo, actividadCodigo);
    return c.json({ success: true, data: items });
  }

  async listarFuentesPoa(c: Context) {
    const periodoFiscalId = c.req.param("periodoFiscalId");
    const itemCodigo = c.req.query("item") || undefined;
    if (!periodoFiscalId) throw new ValidationError("periodoFiscalId es requerido");
    const fuentes = await listarFuentesPoaUseCase.execute(periodoFiscalId, itemCodigo);
    return c.json({ success: true, data: fuentes });
  }

  async consultarSaldo(c: Context) {
    const periodoFiscalId = c.req.param("periodoFiscalId");
    const programaCodigo = c.req.query("programa");
    const actividadCodigo = c.req.query("actividad");
    const itemCodigo = c.req.query("item");
    const fuenteCodigo = c.req.query("fuente");

    if (!periodoFiscalId || !programaCodigo || !actividadCodigo || !itemCodigo || !fuenteCodigo) {
      throw new ValidationError("Todos los parámetros son requeridos");
    }
    const saldo = await saldosMotor.consultarPorEstructura({
      periodoFiscalId,
      programaCodigo,
      actividadCodigo,
      itemCodigo,
      fuenteCodigo,
    });
    return c.json({ success: true, data: saldo });
  }

  async descargarPlantilla(c: Context) {
    const XLSX = require("xlsx");
    const wsdata = [
      // Header row (row 1)
      ["No", "OE", "OO", "PROGRAMAS", "PROYECTO", "RESPONSABLE",
       "ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC",
       "PRESUPUESTO", "ASIGNADO", "CERTIFICACIONES", "MODIFICACIONES", "SALDO",
       "Descripción", "PROGRAMA", "ACTIVIDAD", "FUENTE", "Item", "Grupo", "Detalle Item", "OBSERVACION"],
      // Example data row (row 2)
      [1, "", "", "001", "Proyecto institucional", "Responsable",
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0,
       "Descripción de la actividad", "001", "00101", "001", 53101, 5, "Sueldos y salarios", ""],
      // Row 3 empty as template
      [2, "", "", "", "", "",
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0,
       "", "", "", "", 0, 0, "", ""],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsdata);

    // Set column widths
    ws["!cols"] = [
      { wch: 5 },   // No
      { wch: 6 },   // OE
      { wch: 6 },   // OO
      { wch: 8 },   // PROGRAMAS
      { wch: 20 },  // PROYECTO
      { wch: 15 },  // RESPONSABLE
      ...Array(12).fill({ wch: 8 }), // months
      { wch: 12 },  // PRESUPUESTO
      { wch: 12 },  // ASIGNADO
      { wch: 14 },  // CERTIFICACIONES
      { wch: 14 },  // MODIFICACIONES
      { wch: 12 },  // SALDO
      { wch: 30 },  // Descripción
      { wch: 8 },   // PROGRAMA
      { wch: 10 },  // ACTIVIDAD
      { wch: 8 },   // FUENTE
      { wch: 8 },   // Item
      { wch: 6 },   // Grupo
      { wch: 25 },  // Detalle Item
      { wch: 20 },  // OBSERVACION
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "POA-BASE");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

    return c.body(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=\"plantilla-poa-definitivo.xlsx\"",
      },
    });
  }
}

export const poaController = new PoaController();

const app = new Hono();

app.post("/", requirePermission("poa.versionar"), async (c) => poaController.crear(c));
app.get("/vigente/:periodoFiscalId", requirePermission("poa.ver"), async (c) => poaController.consultarVigente(c));
app.post("/importar-desde-cedula", requirePermission("poa.versionar"), async (c) => poaController.importarDesdeCedula(c));
app.post("/importar-poa-base", requirePermission("poa.versionar"), async (c) => poaController.importarPoaBase(c));
app.get("/:periodoFiscalId/programas", requirePermission("poa.actividad.ver"), async (c) => poaController.listarProgramas(c));
app.get("/:periodoFiscalId/actividades", requirePermission("poa.actividad.ver"), async (c) => poaController.listarActividadesPoa(c));
app.get("/:periodoFiscalId/items", requirePermission("poa.actividad.ver"), async (c) => poaController.listarItemsPoa(c));
app.get("/:periodoFiscalId/fuentes", requirePermission("poa.actividad.ver"), async (c) => poaController.listarFuentesPoa(c));
app.get("/:periodoFiscalId/saldo", requirePermission("poa.actividad.ver"), async (c) => poaController.consultarSaldo(c));
app.get("/:id/actividades", requirePermission("poa.actividad.ver"), async (c) => poaController.listarActividades(c));
app.get("/:id", requirePermission("poa.ver"), async (c) => poaController.getById(c));

export default app;
