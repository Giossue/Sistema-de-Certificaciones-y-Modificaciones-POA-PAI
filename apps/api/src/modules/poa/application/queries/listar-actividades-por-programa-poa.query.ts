import { ValidationError } from "../../../../common/errors/http-error.map";
import { ListarActividadesPorProgramaPoaUseCase } from "../use-cases";

export async function listarActividadesPorProgramaPoa(
  listarActividadesPoaUseCase: ListarActividadesPorProgramaPoaUseCase,
  periodoFiscalId: string | undefined,
  programaCodigo?: string
) {
  if (!periodoFiscalId) throw new ValidationError("periodoFiscalId es requerido");
  return listarActividadesPoaUseCase.execute(periodoFiscalId, programaCodigo);
}
