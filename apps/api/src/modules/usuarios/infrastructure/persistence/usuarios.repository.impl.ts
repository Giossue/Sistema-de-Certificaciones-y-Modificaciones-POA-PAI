import { PrismaClient, Rol } from "@prisma/client";
import { UsuariosRepository } from "../../domain/repositories/usuarios.repository";
import type { UsuarioEntity } from "../../domain/entities/usuario.entity";

export class UsuariosRepositoryImpl implements UsuariosRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listar(): Promise<UsuarioEntity[]> {
    const usuarios = await this.prisma.usuario.findMany({
      orderBy: { nombre: "asc" },
    });
    return usuarios.map((u) => this.toEntity(u));
  }

  async obtenerPorId(id: string): Promise<UsuarioEntity | null> {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    return usuario ? this.toEntity(usuario) : null;
  }

  async crear(data: Omit<UsuarioEntity, "id" | "createdAt" | "updatedAt"> & { password: string }): Promise<UsuarioEntity> {
    const usuario = await this.prisma.usuario.create({
      data: {
        email: data.email,
        password: data.password,
        nombre: data.nombre,
        rol: data.rol as Rol,
        activo: data.activo,
      },
    });
    return this.toEntity(usuario);
  }

  async actualizar(id: string, data: Partial<Omit<UsuarioEntity, "id" | "createdAt" | "updatedAt">>): Promise<UsuarioEntity> {
    const usuario = await this.prisma.usuario.update({
      where: { id },
      data: {
        ...(data.email && { email: data.email }),
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.rol && { rol: data.rol as Rol }),
        ...(data.activo !== undefined && { activo: data.activo }),
      },
    });
    return this.toEntity(usuario);
  }

  async eliminar(id: string): Promise<void> {
    await this.prisma.usuario.delete({ where: { id } });
  }

  private toEntity(u: any): UsuarioEntity {
    return {
      id: u.id,
      email: u.email,
      nombre: u.nombre,
      rol: u.rol,
      activo: u.activo,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    };
  }
}
