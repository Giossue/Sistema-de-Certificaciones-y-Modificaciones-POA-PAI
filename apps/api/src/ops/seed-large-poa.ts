import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const target = Number(process.argv[2] || 50000);
const CHUNK_SIZE = 1000;
const LOAD_YEAR = 2099;

function money(index: number) {
  return `${(1000 + (index % 9000)).toFixed(2)}`;
}

function code(prefix: string, value: number, width = 4) {
  return `${prefix}${String(value).padStart(width, "0")}`;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size));
  return chunks;
}

async function main() {
  if (!Number.isInteger(target) || target < 1) throw new Error("Cantidad inválida");

  const [admin, unidad] = await Promise.all([
    prisma.usuario.findUnique({ where: { email: "admin@ueb.edu.ec" } }),
    prisma.usuario.findUnique({ where: { email: "unidad@ueb.edu.ec" } }),
  ]);
  if (!admin) throw new Error("Ejecuta primero el seed base de usuarios");

  const periodo = await prisma.periodoFiscal.upsert({
    where: { anio: LOAD_YEAR },
    update: { nombre: `Carga ${target} actividades`, activo: false },
    create: { anio: LOAD_YEAR, nombre: `Carga ${target} actividades`, activo: false },
  });

  const existing = await prisma.actividadesPoa.count({
    where: { poaVersion: { periodoFiscalId: periodo.id }, programaCodigo: { startsWith: "L" } },
  });
  if (existing >= target) {
    console.log(`✓ Dataset de carga ya existe: ${existing} actividades`);
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.poaVersion.updateMany({ where: { periodoFiscalId: periodo.id }, data: { vigente: false, estado: "reemplazada" } });
    await tx.cedulaMefVersion.updateMany({ where: { periodoFiscalId: periodo.id }, data: { vigente: false } });
  });

  const poa = await prisma.poaVersion.create({
    data: {
      periodoFiscalId: periodo.id,
      numeroVersion: Date.now() % 100000,
      estado: "vigente",
      vigente: true,
      createdBy: admin.id,
    },
  });
  const cedula = await prisma.cedulaMefVersion.create({
    data: {
      periodoFiscalId: periodo.id,
      archivoNombre: `cedula-carga-${target}.xlsx`,
      archivoHash: `load-${target}-${Date.now()}`,
      corteFecha: new Date(),
      vigente: true,
      importadoPor: admin.id,
    },
  });

  const entries = Array.from({ length: target }, (_, index) => {
    const programaCodigo = code("L", Math.floor(index / 500) + 1, 3);
    const actividadCodigo = code("LA", Math.floor(index / 50) + 1, 4);
    const itemCodigo = code("LI", index + 1, 5);
    const fuenteCodigo = code("LF", (index % 12) + 1, 3);
    const monto = money(index);
    return {
      programaCodigo,
      programaNombre: `Programa carga ${programaCodigo}`,
      actividadCodigo,
      actividadNombre: `Actividad carga ${actividadCodigo}`,
      itemCodigo,
      itemNombre: `Ítem carga ${itemCodigo}`,
      fuenteCodigo,
      fuenteNombre: `Fuente carga ${fuenteCodigo}`,
      monto,
    };
  });

  let inserted = 0;
  for (const part of chunk(entries, CHUNK_SIZE)) {
    await prisma.$transaction([
      prisma.cedulaMefEntrada.createMany({
        data: part.map((entry) => ({
          versionId: cedula.id,
          programaCodigo: entry.programaCodigo,
          programaNombre: entry.programaNombre,
          actividadCodigo: entry.actividadCodigo,
          actividadNombre: entry.actividadNombre,
          itemCodigo: entry.itemCodigo,
          itemNombre: entry.itemNombre,
          fuenteCodigo: entry.fuenteCodigo,
          fuenteNombre: entry.fuenteNombre,
          montoCodificado: entry.monto,
          montoDevengado: "0.00",
          saldoDisponible: entry.monto,
        })),
      }),
      prisma.actividadesPoa.createMany({
        data: part.map((entry) => ({
          poaVersionId: poa.id,
          unidadId: unidad?.id,
          responsableNombre: unidad?.nombre || "Unidad requirente",
          programaCodigo: entry.programaCodigo,
          programaNombre: entry.programaNombre,
          actividadCodigo: entry.actividadCodigo,
          actividadNombre: entry.actividadNombre,
          itemCodigo: entry.itemCodigo,
          itemNombre: entry.itemNombre,
          fuenteCodigo: entry.fuenteCodigo,
          fuenteNombre: entry.fuenteNombre,
          montoPlanificado: entry.monto,
          saldoDisponible: entry.monto,
        })),
      }),
    ]);
    inserted += part.length;
    if (inserted % 10000 === 0 || inserted === target) console.log(`Carga POA: ${inserted}/${target}`);
  }

  console.log(`✓ Dataset de carga creado: periodo=${periodo.id}, actividades=${target}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
