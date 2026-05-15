import { z } from "zod";

export const UpdateUsuarioDtoSchema = z.object({
  nombre: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
  rol: z.enum(["admin", "director", "analista", "unidad", "financiero", "bienes"]).optional(),
  activo: z.boolean().optional(),
});

export type UpdateUsuarioDto = z.infer<typeof UpdateUsuarioDtoSchema>;
