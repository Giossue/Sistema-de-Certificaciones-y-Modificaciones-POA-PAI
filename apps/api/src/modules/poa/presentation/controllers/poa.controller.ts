import { Context } from "hono";
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
import { consultarPoaPorId } from "../../application/queries/consultar-poa-por-id.query";
import { consultarPoaVigente } from "../../application/queries/consultar-poa-vigente.query";
import { consultarSaldoPoa } from "../../application/queries/consultar-saldo-poa.query";
import { listarActividadesPorProgramaPoa } from "../../application/queries/listar-actividades-por-programa-poa.query";
import { listarActividadesPoaPorVersion } from "../../application/queries/listar-actividades-poa.query";
import { listarFuentesPoa } from "../../application/queries/listar-fuentes-poa.query";
import { listarItemsPoa } from "../../application/queries/listar-items-poa.query";
import { listarProgramasPoa } from "../../application/queries/listar-programas-poa.query";
import { AuditoriaService } from "../../../auditoria/infrastructure/auditoria.service";
import { ValidationError } from "../../../../common/errors/http-error.map";
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
    const data = await consultarPoaVigente(consultarVigenteUseCase, c.req.param("periodoFiscalId"));
    return c.json({ success: true, data });
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
    const data = await listarActividadesPoaPorVersion(listarActividadesUseCase, c.req.param("versionId"));
    return c.json({ success: true, data });
  }

  async getById(c: Context) {
    const data = await consultarPoaPorId(consultarPorIdUseCase, c.req.param("id"));
    return c.json({ success: true, data });
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
    const data = await listarProgramasPoa(listarProgramasUseCase, c.req.param("periodoFiscalId"));
    return c.json({ success: true, data });
  }

  async listarActividadesPoa(c: Context) {
    const data = await listarActividadesPorProgramaPoa(
      listarActividadesPoaUseCase,
      c.req.param("periodoFiscalId"),
      c.req.query("programa") || undefined
    );
    return c.json({ success: true, data });
  }

  async listarItemsPoa(c: Context) {
    const data = await listarItemsPoa(
      listarItemsPoaUseCase,
      c.req.param("periodoFiscalId"),
      c.req.query("programa") || undefined,
      c.req.query("actividad") || undefined
    );
    return c.json({ success: true, data });
  }

  async listarFuentesPoa(c: Context) {
    const data = await listarFuentesPoa(listarFuentesPoaUseCase, c.req.param("periodoFiscalId"), c.req.query("item") || undefined);
    return c.json({ success: true, data });
  }

  async consultarSaldo(c: Context) {
    const data = await consultarSaldoPoa(saldosMotor, {
      periodoFiscalId: c.req.param("periodoFiscalId"),
      programaCodigo: c.req.query("programa"),
      actividadCodigo: c.req.query("actividad"),
      itemCodigo: c.req.query("item"),
      fuenteCodigo: c.req.query("fuente"),
    });
    return c.json({ success: true, data });
  }
}
