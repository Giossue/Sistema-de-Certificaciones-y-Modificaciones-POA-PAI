import { ValidationError } from "../../../../common/errors/http-error.map";
import { ListarActividadesPoaUseCase } from "../use-cases";

export async function listarActividadesPoaPorVersion(listarActividadesUseCase: ListarActividadesPoaUseCase, versionId: string | undefined) {
  if (!versionId) {
    throw new ValidationError("versionId es requerido");
  }
  return listarActividadesUseCase.execute(versionId);
}
