import { PeriodoFiscalEntity } from "../entities/periodo-fiscal.entity";

export interface PeriodosFiscalesRepository {
  listar(): Promise<PeriodoFiscalEntity[]>;
  obtenerPorId(id: string): Promise<PeriodoFiscalEntity | null>;
  crear(data: Omit<PeriodoFiscalEntity, "id" | "createdAt" | "updatedAt">): Promise<PeriodoFiscalEntity>;
  actualizar(id: string, data: Partial<Omit<PeriodoFiscalEntity, "id" | "createdAt" | "updatedAt">>): Promise<PeriodoFiscalEntity>;
}
