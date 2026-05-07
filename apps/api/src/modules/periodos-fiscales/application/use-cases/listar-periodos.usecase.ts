import { PrismaClient } from "@prisma/client";

export class ListarPeriodosFiscalesUsecase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute() {
    return this.prisma.periodoFiscal.findMany({
      orderBy: { anio: "desc" },
    });
  }
}
