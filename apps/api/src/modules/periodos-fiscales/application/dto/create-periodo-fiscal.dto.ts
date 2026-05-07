import { z } from "zod";

export const CreatePeriodoFiscalDtoSchema = z.object({
  anio: z.number().int().min(2000).max(2100),
  nombre: z.string().min(1, "El nombre es requerido"),
});

export type CreatePeriodoFiscalDto = z.infer<typeof CreatePeriodoFiscalDtoSchema>;
