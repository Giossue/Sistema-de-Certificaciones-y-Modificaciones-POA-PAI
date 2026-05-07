import { PrismaClient } from "@prisma/client";
import { UsuariosRepository } from "../../domain/repositories/usuarios.repository";
import { UsuarioEntity } from "../../domain/entities/usuario.entity";

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
    const usuario = await this.prisma.usuario.create({ data });
    return this.toEntity(usuario);
  }

  async actualizar(id: string, data: Partial<Omit<UsuarioEntity, "id" | "createdAt" | "updatedAt">>): Promise<UsuarioEntity> {
    const usuario = await this.prisma.usuario.update({ where: { id }, data });
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
