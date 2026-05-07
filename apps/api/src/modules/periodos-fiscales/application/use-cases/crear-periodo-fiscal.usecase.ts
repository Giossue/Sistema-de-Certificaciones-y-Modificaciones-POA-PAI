import { PrismaClient } from "@prisma/client";
import { ConflictError } from "../../../../common/errors/http-error.map";
import { CreatePeriodoFiscalDto } from "../dto/create-periodo-fiscal.dto";

export class CrearPeriodoFiscalUsecase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: CreatePeriodoFiscalDto) {
    const existente = await this.prisma.periodoFiscal.findUnique({
      where: { anio: dto.anio },
    });

    if (existente) {
      throw new ConflictError(`Ya existe un periodo fiscal para el año ${dto.anio}`);
    }

    const periodo = await this.prisma.periodoFiscal.create({
      data: {
        anio: dto.anio,
        nombre: dto.nombre,
        activo: true,
      },
    });

    return periodo;
  }
}
