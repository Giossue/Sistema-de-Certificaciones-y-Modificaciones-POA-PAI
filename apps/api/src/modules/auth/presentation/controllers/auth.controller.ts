import { Context } from "hono";
import { PrismaClient } from "@prisma/client";
import { LoginDtoSchema } from "../../application/dto/login.dto";
import { LoginUsecase } from "../../application/use-cases/login.usecase";
import { ValidationError } from "../../../../common/errors/http-error.map";

const prisma = new PrismaClient();

export class AuthController {
  static async login(c: Context) {
    const body = await c.req.json();
    const parsed = LoginDtoSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
    }

    const usecase = new LoginUsecase(prisma);
    const result = await usecase.execute(parsed.data);
    return c.json(result, 200);
  }

  static async me(c: Context) {
    const user = c.get("user");
    if (!user) {
      throw new ValidationError("Usuario no autenticado");
    }
    return c.json(user, 200);
  }
}
