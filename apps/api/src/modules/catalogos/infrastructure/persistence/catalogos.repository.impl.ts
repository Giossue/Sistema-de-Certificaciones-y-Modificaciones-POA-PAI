import { PrismaClient } from "@prisma/client";
import { CatalogosRepository } from "../../domain/repositories/catalogos.repository";
import { CatalogoEntity } from "../../domain/entities/catalogo.entity";

export class CatalogosRepositoryImpl implements CatalogosRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listarProgramas(): Promise<CatalogoEntity[]> {
    const rows = await this.prisma.catalogoPrograma.findMany({ where: { activo: true } });
    return rows.map(this.toEntity);
  }

  async listarActividades(): Promise<CatalogoEntity[]> {
    const rows = await this.prisma.catalogoActividad.findMany({ where: { activo: true } });
    return rows.map(this.toEntity);
  }

  async listarItems(): Promise<CatalogoEntity[]> {
    const rows = await this.prisma.catalogoItem.findMany({ where: { activo: true } });
    return rows.map(this.toEntity);
  }

  async listarFuentes(): Promise<CatalogoEntity[]> {
    const rows = await this.prisma.catalogoFuente.findMany({ where: { activo: true } });
    return rows.map(this.toEntity);
  }

  private toEntity(row: any): CatalogoEntity {
    return { id: row.id, codigo: row.codigo, nombre: row.nombre, activo: row.activo };
  }
}
