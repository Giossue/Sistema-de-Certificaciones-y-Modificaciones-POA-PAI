import { Context } from "hono";
import { PrismaClient } from "@prisma/client";
import { ListarUsuariosUsecase } from "../../application/use-cases/listar-usuarios.usecase";
import { CrearUsuarioUsecase } from "../../application/use-cases/crear-usuario.usecase";
import { UpdateUsuarioUsecase } from "../../application/use-cases/update-usuario.usecase";
import { DeleteUsuarioUsecase } from "../../application/use-cases/delete-usuario.usecase";
import { CreateUsuarioDtoSchema } from "../../application/dto/create-usuario.dto";
import { UpdateUsuarioDtoSchema } from "../../application/dto/update-usuario.dto";
import { ValidationError } from "../../../../common/errors/http-error.map";

const prisma = new PrismaClient();

export class UsuariosController {
  static async listar(c: Context) {
    const usecase = new ListarUsuariosUsecase(prisma);
    const usuarios = await usecase.execute();
    return c.json(usuarios);
  }

  static async crear(c: Context) {
    const body = await c.req.json();
    const parsed = CreateUsuarioDtoSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
    }

    const usecase = new CrearUsuarioUsecase(prisma);
    const usuario = await usecase.execute(parsed.data);
    return c.json(usuario, 201);
  }

  static async actualizar(c: Context) {
    const id = c.req.param("id");
    if (!id) {
      throw new ValidationError("ID de usuario es requerido");
    }
    const body = await c.req.json();
    const parsed = UpdateUsuarioDtoSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
    }

    const usecase = new UpdateUsuarioUsecase(prisma);
    const usuario = await usecase.execute(id, parsed.data);
    return c.json(usuario);
  }

  static async eliminar(c: Context) {
    const id = c.req.param("id");
    if (!id) {
      throw new ValidationError("ID de usuario es requerido");
    }
    const usecase = new DeleteUsuarioUsecase(prisma);
    await usecase.execute(id);
    return c.json({ message: "Usuario eliminado" });
  }
}
