import { z } from "zod";

export const CredencialesSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type Credenciales = z.infer<typeof CredencialesSchema>;
