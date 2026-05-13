import { ValidationError } from "../../../../common/errors/http-error.map";

export function normalizarMonto(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
    throw new ValidationError("monto debe ser un decimal positivo con máximo 2 decimales");
  }
  const [integerPart, decimalPart = ""] = raw.split(".");
  return `${integerPart}.${decimalPart.padEnd(2, "0")}`;
}

export function normalizarTipo(value: unknown): "POA" | "PAI" {
  const tipo = String(value || "POA").toUpperCase();
  if (tipo !== "POA" && tipo !== "PAI") throw new ValidationError("tipo debe ser POA o PAI");
  return tipo;
}

export function unidadCodigo(user: { email?: string; nombre?: string }, actividad?: { unidadId?: string | null }) {
  const base = actividad?.unidadId || user.email?.split("@")[0] || user.nombre || "UNI";
  return String(base).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase() || "UNI";
}
