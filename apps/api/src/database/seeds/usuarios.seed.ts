import { PrismaClient, Rol } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function seedUsuarios() {
  const usuarios = [
    {
      email: "admin@ueb.edu.ec",
      password: "admin123",
      nombre: "Administrador del Sistema",
      rol: Rol.admin,
    },
    {
      email: "director@ueb.edu.ec",
      password: "director123",
      nombre: "Ing. Tania Alban",
      rol: Rol.director,
    },
    {
      email: "analista@ueb.edu.ec",
      password: "analista123",
      nombre: "Analista de Planificación",
      rol: Rol.analista,
    },
    {
      email: "unidad@ueb.edu.ec",
      password: "unidad123",
      nombre: "Secretaría Académica",
      rol: Rol.unidad,
    },
    {
      email: "financiero@ueb.edu.ec",
      password: "financiero123",
      nombre: "Coordinación Administrativa Financiera",
      rol: Rol.financiero,
    },
    {
      email: "bienes@ueb.edu.ec",
      password: "bienes123",
      nombre: "Área de Bienes",
      rol: Rol.bienes,
    },
  ];

  for (const usuario of usuarios) {
    await prisma.usuario.upsert({
      where: { email: usuario.email },
      update: {
        nombre: usuario.nombre,
        rol: usuario.rol,
        activo: true,
      },
      create: {
        email: usuario.email,
        password: await bcrypt.hash(usuario.password, 10),
        nombre: usuario.nombre,
        rol: usuario.rol,
        activo: true,
      },
    });
  }

  console.log("✓ Usuarios sembrados");
}
