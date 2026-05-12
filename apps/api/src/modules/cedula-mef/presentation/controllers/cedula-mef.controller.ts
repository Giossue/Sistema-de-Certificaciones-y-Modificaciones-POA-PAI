import { Context, Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { ValidationError, NotFoundError } from "../../../../common/errors/http-error.map";
import { ImportarCedulaMefUseCase } from "../../application/use-cases/importar-cedula-mef.usecase";
import { ConsultarCedulaVigenteUseCase } from "../../application/use-cases/consultar-cedula-vigente.usecase";
import { ListarCedulaVersionesUseCase } from "../../application/use-cases/listar-cedula-versiones.usecase";
import { ListarCedulaEntradasUseCase } from "../../application/use-cases/listar-cedula-entradas.usecase";
import { CedulaMefParserService } from "../../infrastructure/cedula-mef-parser.service";
import { AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { CompararCedulaVersionesUseCase } from "../../application/use-cases/comparar-cedula-versiones.usecase";
import { ValidarCombinacionCedulaUseCase } from "../../application/use-cases/validar-combinacion-cedula.usecase";
import { ListarProgramasCedulaUseCase, ListarActividadesCedulaUseCase, ListarItemsCedulaUseCase, ListarFuentesCedulaUseCase } from "../../application/use-cases/listar-catalogos-cedula.usecase";

const prisma = new PrismaClient();
const parserService = new CedulaMefParserService();
const auditoriaService = new AuditoriaService(prisma);

const importarUseCase = new ImportarCedulaMefUseCase(prisma, parserService, auditoriaService);
const consultarUseCase = new ConsultarCedulaVigenteUseCase(prisma);
const listarVersionesUseCase = new ListarCedulaVersionesUseCase(prisma);
const listarEntradasUseCase = new ListarCedulaEntradasUseCase(prisma);
const compararVersionesUseCase = new CompararCedulaVersionesUseCase(prisma);
const validarCombinacionUseCase = new ValidarCombinacionCedulaUseCase(prisma);
const listarProgramasUseCase = new ListarProgramasCedulaUseCase(prisma);
const listarActividadesUseCase = new ListarActividadesCedulaUseCase(prisma);
const listarItemsUseCase = new ListarItemsCedulaUseCase(prisma);
const listarFuentesUseCase = new ListarFuentesCedulaUseCase(prisma);

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export class CedulaMefController {
  async importar(c: Context) {
    const formData = await c.req.formData();
    const archivo = formData.get("archivo") as File | null;
    const periodoFiscalId = formData.get("periodoFiscalId") as string;
    const user = c.get("user") as { id: string } | undefined;

    if (!archivo) {
      throw new ValidationError("Archivo no proporcionado");
    }

    if (!periodoFiscalId) {
      throw new ValidationError("periodoFiscalId es requerido");
    }

    if (!isValidUUID(periodoFiscalId)) {
      throw new ValidationError("periodoFiscalId debe ser un UUID valido");
    }

    if (!archivo.name.endsWith(".xlsx") && !archivo.name.endsWith(".xls")) {
      throw new ValidationError("Formato invalido. Solo se acepta Excel (.xlsx, .xls)");
    }

    const buffer = Buffer.from(await archivo.arrayBuffer());

    try {
      const resultado = await importarUseCase.execute({
        archivoBuffer: buffer,
        archivoNombre: archivo.name,
        periodoFiscalId,
        importadoPor: user?.id || "sistema",
      });

      return c.json({ success: true, data: resultado });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ValidationError(error.message);
      }
      throw error;
    }
  }

  async consultarVigente(c: Context) {
    const periodoFiscalId = c.req.param("periodoFiscalId");
    if (!periodoFiscalId || !isValidUUID(periodoFiscalId)) {
      throw new ValidationError("periodoFiscalId debe ser un UUID valido");
    }
    const version = await consultarUseCase.execute(periodoFiscalId);
    if (!version) {
      throw new NotFoundError("Cedula MEF vigente", periodoFiscalId);
    }
    return c.json({ success: true, data: version });
  }

  async listarVersiones(c: Context) {
    const periodoFiscalId = c.req.param("periodoFiscalId");
    if (!periodoFiscalId || !isValidUUID(periodoFiscalId)) {
      throw new ValidationError("periodoFiscalId debe ser un UUID valido");
    }
    const versiones = await listarVersionesUseCase.execute(periodoFiscalId);
    return c.json({ success: true, data: versiones });
  }

  async listarEntradas(c: Context) {
    const { versionId } = c.req.param();
    if (!versionId) {
      throw new ValidationError("versionId es requerido");
    }
    const page = parseInt(c.req.query("page") || "1");
    const pageSize = parseInt(c.req.query("pageSize") || "50");
    const filtro = c.req.query("filtro") || undefined;

    const resultado = await listarEntradasUseCase.execute({ versionId, page, pageSize, filtro });
    return c.json({ success: true, data: resultado });
  }

  async compararVersiones(c: Context) {
    const { versionId } = c.req.param();
    if (!versionId) {
      throw new ValidationError("versionId es requerido");
    }
    const diff = await compararVersionesUseCase.execute(versionId);
    return c.json({ success: true, data: diff });
  }

  async validarCombinacion(c: Context) {
    const periodoFiscalId = c.req.query("periodoFiscalId");
    const programaCodigo = c.req.query("programaCodigo");
    const actividadCodigo = c.req.query("actividadCodigo");
    const itemCodigo = c.req.query("itemCodigo");
    const fuenteCodigo = c.req.query("fuenteCodigo");

    if (!periodoFiscalId || !programaCodigo || !actividadCodigo || !itemCodigo || !fuenteCodigo) {
      throw new ValidationError("Todos los parametros son requeridos: periodoFiscalId, programaCodigo, actividadCodigo, itemCodigo, fuenteCodigo");
    }
    const resultado = await validarCombinacionUseCase.execute({
      periodoFiscalId,
      programaCodigo,
      actividadCodigo,
      itemCodigo,
      fuenteCodigo,
    });
    return c.json({ success: true, data: resultado });
  }

  async listarProgramas(c: Context) {
    const periodoFiscalId = c.req.param("periodoFiscalId");
    if (!periodoFiscalId) throw new ValidationError("periodoFiscalId es requerido");
    const programas = await listarProgramasUseCase.execute(periodoFiscalId);
    return c.json({ success: true, data: programas });
  }

  async listarActividades(c: Context) {
    const periodoFiscalId = c.req.param("periodoFiscalId");
    const programaCodigo = c.req.query("programa") || undefined;
    if (!periodoFiscalId) throw new ValidationError("periodoFiscalId es requerido");
    const actividades = await listarActividadesUseCase.execute(periodoFiscalId, programaCodigo);
    return c.json({ success: true, data: actividades });
  }

  async listarItems(c: Context) {
    const periodoFiscalId = c.req.param("periodoFiscalId");
    const programaCodigo = c.req.query("programa") || undefined;
    const actividadCodigo = c.req.query("actividad") || undefined;
    if (!periodoFiscalId) throw new ValidationError("periodoFiscalId es requerido");
    const items = await listarItemsUseCase.execute(periodoFiscalId, programaCodigo, actividadCodigo);
    return c.json({ success: true, data: items });
  }

  async listarFuentes(c: Context) {
    const periodoFiscalId = c.req.param("periodoFiscalId");
    const itemCodigo = c.req.query("item") || undefined;
    if (!periodoFiscalId) throw new ValidationError("periodoFiscalId es requerido");
    const fuentes = await listarFuentesUseCase.execute(periodoFiscalId, itemCodigo);
    return c.json({ success: true, data: fuentes });
  }
}

export const cedulaMefController = new CedulaMefController();
