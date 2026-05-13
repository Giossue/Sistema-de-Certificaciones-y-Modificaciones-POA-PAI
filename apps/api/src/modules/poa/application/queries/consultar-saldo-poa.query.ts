import { ValidationError } from "../../../../common/errors/http-error.map";
import { SaldosMotorService } from "../../../saldos/application/use-cases/saldos-motor.service";

export async function consultarSaldoPoa(
  saldosMotor: SaldosMotorService,
  params: {
    periodoFiscalId?: string;
    programaCodigo?: string;
    actividadCodigo?: string;
    itemCodigo?: string;
    fuenteCodigo?: string;
  }
) {
  const { periodoFiscalId, programaCodigo, actividadCodigo, itemCodigo, fuenteCodigo } = params;

  if (!periodoFiscalId || !programaCodigo || !actividadCodigo || !itemCodigo || !fuenteCodigo) {
    throw new ValidationError("Todos los parámetros son requeridos");
  }
  return saldosMotor.consultarPorEstructura({
    periodoFiscalId,
    programaCodigo,
    actividadCodigo,
    itemCodigo,
    fuenteCodigo,
  });
}
