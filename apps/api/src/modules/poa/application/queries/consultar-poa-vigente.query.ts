import { NotFoundError, ValidationError } from "../../../../common/errors/http-error.map";
import { ConsultarPoaVigenteUseCase } from "../use-cases";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function consultarPoaVigente(consultarVigenteUseCase: ConsultarPoaVigenteUseCase, periodoFiscalId: string | undefined) {
  if (!periodoFiscalId) {
    throw new ValidationError("periodoFiscalId es requerido");
  }
  if (!UUID_REGEX.test(periodoFiscalId)) {
    throw new ValidationError("periodoFiscalId debe ser un UUID válido");
  }
  const version = await consultarVigenteUseCase.execute(periodoFiscalId);

  if (!version) {
    throw new NotFoundError("POA vigente", periodoFiscalId);
  }

  return version;
}
