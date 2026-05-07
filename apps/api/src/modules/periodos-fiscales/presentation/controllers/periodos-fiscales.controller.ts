import { Context } from "hono";
import { PrismaClient } from "@prisma/client";
import { ListarPeriodosFiscalesUsecase } from "../../application/use-cases/listar-periodos.usecase";
import { CrearPeriodoFiscalUsecase } from "../../application/use-cases/crear-periodo-fiscal.usecase";
import { CreatePeriodoFiscalDtoSchema } from "../../application/dto/create-periodo-fiscal.dto";
import { ValidationError } from "../../../../common/errors/http-error.map";

const prisma = new PrismaClient();

export class PeriodosFiscalesController {
  static async listar(c: Context) {
    const usecase = new ListarPeriodosFiscalesUsecase(prisma);
    const periodos = await usecase.execute();
    return c.json(periodos);
  }

  static async crear(c: Context) {
    const body = await c.req.json();
    const parsed = CreatePeriodoFiscalDtoSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
    }

    const usecase = new CrearPeriodoFiscalUsecase(prisma);
    const periodo = await usecase.execute(parsed.data);
    return c.json(periodo, 201);
  }
}
