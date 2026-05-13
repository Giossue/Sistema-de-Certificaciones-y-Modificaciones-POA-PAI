import { ValidationError } from "../../../../common/errors/http-error.map";
import { ListarItemsPoaUseCase } from "../use-cases";

export async function listarItemsPoa(
  listarItemsPoaUseCase: ListarItemsPoaUseCase,
  periodoFiscalId: string | undefined,
  programaCodigo?: string,
  actividadCodigo?: string
) {
  if (!periodoFiscalId) throw new ValidationError("periodoFiscalId es requerido");
  return listarItemsPoaUseCase.execute(periodoFiscalId, programaCodigo, actividadCodigo);
}
