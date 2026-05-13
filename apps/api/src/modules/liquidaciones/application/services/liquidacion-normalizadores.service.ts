import { ValidationError } from "../../../../common/errors/http-error.map";

export function normalizarMonto(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) throw new ValidationError("monto debe ser un decimal positivo");
  const [integerPart, decimalPart = ""] = raw.split(".");
  return `${integerPart}.${decimalPart.padEnd(2, "0")}`;
}
