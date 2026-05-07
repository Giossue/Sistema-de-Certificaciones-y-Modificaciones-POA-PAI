import { PrismaClient } from "@prisma/client";
import { seedUsuarios } from "./usuarios.seed";
import { seedCatalogos } from "./catalogos.seed";
import { seedPeriodos } from "./periodos.seed";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seeds...");
  await seedUsuarios();
  await seedCatalogos();
  await seedPeriodos();
  console.log("🌱 Seeds completados");
}

main()
  .catch((e) => {
    console.error("❌ Error en seeds:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
