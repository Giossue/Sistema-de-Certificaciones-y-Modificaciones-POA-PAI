import { CatalogoEntity } from "../entities/catalogo.entity";

export interface CatalogosRepository {
  listarProgramas(): Promise<CatalogoEntity[]>;
  listarActividades(): Promise<CatalogoEntity[]>;
  listarItems(): Promise<CatalogoEntity[]>;
  listarFuentes(): Promise<CatalogoEntity[]>;
}
