import { z } from "zod";

export const CreateUsuarioDtoSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  nombre: z.string().min(1, "El nombre es requerido"),
  rol: z.enum(["admin", "director", "analista", "unidad", "financiero", "bienes"]),
});

export type CreateUsuarioDto = z.infer<typeof CreateUsuarioDtoSchema>;
