import { ValidationError } from "../../../../common/errors/http-error.map";
import { ListarProgramasPoaUseCase } from "../use-cases";

export async function listarProgramasPoa(listarProgramasUseCase: ListarProgramasPoaUseCase, periodoFiscalId: string | undefined) {
  if (!periodoFiscalId) throw new ValidationError("periodoFiscalId es requerido");
  return listarProgramasUseCase.execute(periodoFiscalId);
}
