import { PrismaClient, Rol } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function seedUsuarios() {
  const adminExists = await prisma.usuario.findUnique({
    where: { email: "admin@ueb.edu.ec" },
  });

  if (adminExists) {
    console.log("✓ Usuarios ya sembrados");
    return;
  }

  const password = await bcrypt.hash("admin123", 10);

  await prisma.usuario.create({
    data: {
      email: "admin@ueb.edu.ec",
      password,
      nombre: "Administrador del Sistema",
      rol: Rol.admin,
      activo: true,
    },
  });

  const directorPassword = await bcrypt.hash("director123", 10);
  await prisma.usuario.create({
    data: {
      email: "director@ueb.edu.ec",
      password: directorPassword,
      nombre: "Ing. Tania Alban",
      rol: Rol.director,
      activo: true,
    },
  });

  const analistaPassword = await bcrypt.hash("analista123", 10);
  await prisma.usuario.create({
    data: {
      email: "analista@ueb.edu.ec",
      password: analistaPassword,
      nombre: "Analista de Planificación",
      rol: Rol.analista,
      activo: true,
    },
  });

  const unidadPassword = await bcrypt.hash("unidad123", 10);
  await prisma.usuario.create({
    data: {
      email: "unidad@ueb.edu.ec",
      password: unidadPassword,
      nombre: "Secretaría Académica",
      rol: Rol.unidad,
      activo: true,
    },
  });

  console.log("✓ Usuarios sembrados");
}
