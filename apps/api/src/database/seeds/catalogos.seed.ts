import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedCatalogos() {
  const programasCount = await prisma.catalogoPrograma.count();
  if (programasCount > 0) {
    console.log("✓ Catálogos ya sembrados");
    return;
  }

  const programas = [
    { codigo: "P001", nombre: "Gestión Académica" },
    { codigo: "P002", nombre: "Investigación e Innovación" },
    { codigo: "P003", nombre: "Vinculación con la Sociedad" },
    { codigo: "P004", nombre: "Infraestructura y Bienes" },
  ];

  for (const p of programas) {
    await prisma.catalogoPrograma.create({ data: p });
  }

  const actividades = [
    { codigo: "A001", nombre: "Organización de eventos académicos", programaCodigo: "P001" },
    { codigo: "A002", nombre: "Desarrollo curricular", programaCodigo: "P001" },
    { codigo: "A003", nombre: "Proyectos de investigación", programaCodigo: "P002" },
    { codigo: "A004", nombre: "Publicaciones científicas", programaCodigo: "P002" },
    { codigo: "A005", nombre: "Capacitaciones comunitarias", programaCodigo: "P003" },
    { codigo: "A006", nombre: "Mantenimiento de infraestructura", programaCodigo: "P004" },
  ];

  for (const a of actividades) {
    await prisma.catalogoActividad.create({ data: a });
  }

  const items = [
    { codigo: "I001", nombre: "Servicios de terceros" },
    { codigo: "I002", nombre: "Bienes y suministros" },
    { codigo: "I003", nombre: "Obras y mantenimiento" },
    { codigo: "I004", nombre: "Equipamiento y mobiliario" },
    { codigo: "I005", nombre: "Capacitación" },
  ];

  for (const i of items) {
    await prisma.catalogoItem.create({ data: i });
  }

  const fuentes = [
    { codigo: "F001", nombre: "Recursos Propios" },
    { codigo: "F002", nombre: "Asignación del Estado" },
    { codigo: "F003", nombre: "Crédito Externo" },
    { codigo: "F004", nombre: "Transferencias Corrientes" },
  ];

  for (const f of fuentes) {
    await prisma.catalogoFuente.create({ data: f });
  }

  console.log("✓ Catálogos sembrados");
}
