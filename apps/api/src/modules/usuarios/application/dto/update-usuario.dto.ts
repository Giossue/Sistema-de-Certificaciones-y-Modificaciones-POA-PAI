import { z } from "zod";

export const UpdateUsuarioDtoSchema = z.object({
  nombre: z.string().min(1).optional(),
  rol: z.enum(["admin", "director", "analista", "unidad"]).optional(),
  activo: z.boolean().optional(),
});

export type UpdateUsuarioDto = z.infer<typeof UpdateUsuarioDtoSchema>;
