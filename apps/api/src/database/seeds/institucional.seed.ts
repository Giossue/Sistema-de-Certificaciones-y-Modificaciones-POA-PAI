import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const rows = [
  ["P001", "Gestión Académica", "A001", "Organización de eventos académicos", "I001", "Servicios de terceros", "F001", "Recursos Propios", "12000.00"],
  ["P001", "Gestión Académica", "A002", "Desarrollo curricular", "I005", "Capacitación", "F002", "Asignación del Estado", "18000.00"],
  ["P002", "Investigación e Innovación", "A003", "Proyectos de investigación", "I002", "Bienes y suministros", "F002", "Asignación del Estado", "22000.00"],
  ["P002", "Investigación e Innovación", "A004", "Publicaciones científicas", "I001", "Servicios de terceros", "F001", "Recursos Propios", "9000.00"],
  ["P003", "Vinculación con la Sociedad", "A005", "Capacitaciones comunitarias", "I005", "Capacitación", "F004", "Transferencias Corrientes", "7500.00"],
  ["P004", "Infraestructura y Bienes", "A006", "Mantenimiento de infraestructura", "I003", "Obras y mantenimiento", "F002", "Asignación del Estado", "30000.00"],
] as const;

export async function seedInstitucional() {
  const [periodo, admin, unidad] = await Promise.all([
    prisma.periodoFiscal.findFirst({ where: { activo: true }, orderBy: { anio: "desc" } }),
    prisma.usuario.findUnique({ where: { email: "admin@ueb.edu.ec" } }),
    prisma.usuario.findUnique({ where: { email: "unidad@ueb.edu.ec" } }),
  ]);
  if (!periodo || !admin) {
    console.log("↷ Seed institucional omitido: falta periodo activo o admin");
    return;
  }

  let cedula = await prisma.cedulaMefVersion.findFirst({
    where: { periodoFiscalId: periodo.id, vigente: true, archivoHash: `seed-institucional-${periodo.anio}` },
  });
  if (!cedula) {
    await prisma.cedulaMefVersion.updateMany({ where: { periodoFiscalId: periodo.id, vigente: true }, data: { vigente: false } });
    cedula = await prisma.cedulaMefVersion.create({
      data: {
        periodoFiscalId: periodo.id,
        archivoNombre: `cedula-seed-${periodo.anio}.xlsx`,
        archivoHash: `seed-institucional-${periodo.anio}`,
        corteFecha: new Date(),
        vigente: true,
        importadoPor: admin.id,
      },
    });
  }

  const entradas = await prisma.cedulaMefEntrada.count({ where: { versionId: cedula.id } });
  if (entradas === 0) {
    await prisma.cedulaMefEntrada.createMany({
      data: rows.map(([programaCodigo, programaNombre, actividadCodigo, actividadNombre, itemCodigo, itemNombre, fuenteCodigo, fuenteNombre, monto]) => ({
        versionId: cedula.id,
        programaCodigo,
        programaNombre,
        actividadCodigo,
        actividadNombre,
        itemCodigo,
        itemNombre,
        fuenteCodigo,
        fuenteNombre,
        montoCodificado: monto,
        montoDevengado: "0.00",
        saldoDisponible: monto,
      })),
    });
  }

  let poa = await prisma.poaVersion.findFirst({ where: { periodoFiscalId: periodo.id, vigente: true } });
  if (!poa) {
    poa = await prisma.poaVersion.create({
      data: {
        periodoFiscalId: periodo.id,
        numeroVersion: 1,
        estado: "vigente",
        vigente: true,
        createdBy: admin.id,
      },
    });
  }

  const actividades = await prisma.actividadesPoa.count({ where: { poaVersionId: poa.id } });
  if (actividades === 0) {
    await prisma.actividadesPoa.createMany({
      data: rows.map(([programaCodigo, programaNombre, actividadCodigo, actividadNombre, itemCodigo, itemNombre, fuenteCodigo, fuenteNombre, monto]) => ({
        poaVersionId: poa!.id,
        unidadId: unidad?.id,
        responsableNombre: unidad?.nombre || "Secretaría Académica",
        programaCodigo,
        programaNombre,
        actividadCodigo,
        actividadNombre,
        itemCodigo,
        itemNombre,
        fuenteCodigo,
        fuenteNombre,
        montoPlanificado: monto,
        saldoDisponible: monto,
      })),
    });
  }

  console.log("✓ Datos institucionales mínimos sembrados");
}
