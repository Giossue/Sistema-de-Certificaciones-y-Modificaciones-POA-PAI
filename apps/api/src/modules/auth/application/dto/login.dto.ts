import { z } from "zod";

export const LoginDtoSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export type LoginDto = z.infer<typeof LoginDtoSchema>;
