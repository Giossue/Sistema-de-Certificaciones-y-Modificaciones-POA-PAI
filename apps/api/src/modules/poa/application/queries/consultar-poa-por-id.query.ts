import { NotFoundError, ValidationError } from "../../../../common/errors/http-error.map";
import { ConsultarPoaPorIdUseCase } from "../use-cases";

export async function consultarPoaPorId(consultarPorIdUseCase: ConsultarPoaPorIdUseCase, id: string | undefined) {
  if (!id) {
    throw new ValidationError("id es requerido");
  }
  const version = await consultarPorIdUseCase.execute(id);

  if (!version) {
    throw new NotFoundError("Versión POA", id);
  }

  return version;
}
