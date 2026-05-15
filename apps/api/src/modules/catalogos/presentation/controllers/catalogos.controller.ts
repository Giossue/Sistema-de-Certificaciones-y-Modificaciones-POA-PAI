import { Context } from "hono";
import { prisma } from "../../../../database/prisma";
import { ListarCatalogosUsecase } from "../../application/use-cases/listar-catalogos.usecase";



export class CatalogosController {
  static async listar(c: Context) {
    const usecase = new ListarCatalogosUsecase(prisma);
    const catalogos = await usecase.execute();
    return c.json(catalogos);
  }

  static async listarProgramas(c: Context) {
    const programas = await prisma.catalogoPrograma.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
    });
    return c.json(programas);
  }

  static async listarActividades(c: Context) {
    const actividades = await prisma.catalogoActividad.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
    });
    return c.json(actividades);
  }

  static async listarItems(c: Context) {
    const items = await prisma.catalogoItem.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
    });
    return c.json(items);
  }

  static async listarFuentes(c: Context) {
    const fuentes = await prisma.catalogoFuente.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
    });
    return c.json(fuentes);
  }
}
