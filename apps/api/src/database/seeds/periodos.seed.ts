import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedPeriodos() {
  const existing = await prisma.periodoFiscal.findFirst();
  if (existing) {
    console.log("✓ Periodos fiscales ya sembrados");
    return;
  }

  const currentYear = new Date().getFullYear();

  await prisma.periodoFiscal.create({
    data: {
      anio: currentYear,
      nombre: `Año Fiscal ${currentYear}`,
      activo: true,
    },
  });

  console.log("✓ Periodo fiscal sembrado");
}
