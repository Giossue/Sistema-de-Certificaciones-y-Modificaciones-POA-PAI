import { ValidationError } from "../../../../common/errors/http-error.map";
import { ListarFuentesPoaUseCase } from "../use-cases";

export async function listarFuentesPoa(listarFuentesPoaUseCase: ListarFuentesPoaUseCase, periodoFiscalId: string | undefined, itemCodigo?: string) {
  if (!periodoFiscalId) throw new ValidationError("periodoFiscalId es requerido");
  return listarFuentesPoaUseCase.execute(periodoFiscalId, itemCodigo);
}
