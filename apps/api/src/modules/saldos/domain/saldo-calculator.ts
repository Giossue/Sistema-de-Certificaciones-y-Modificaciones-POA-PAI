export type EstadoSaldo = "ok" | "bajo" | "critico" | "agotado";

export type SaldoBreakdown = {
  montoPlanificado: string;
  saldoDisponible: string;
  certificadoVigente: string;
  bloqueadoSolicitudes: string;
  modificado: string;
  liberadoModoA: string;
  retiradoModoB: string;
  porcentajeDisponible: number;
  estado: EstadoSaldo;
};

export function decimalToCentavos(value: string | number | { toString(): string }): bigint {
  const raw = String(value ?? "0").trim();
  if (!/^-?\d+(\.\d+)?$/.test(raw)) throw new Error(`Monto inválido: ${raw}`);
  const negative = raw.startsWith("-");
  const unsigned = negative ? raw.slice(1) : raw;
  const [integerPart = "0", decimalPart = ""] = unsigned.split(".");
  const cents = BigInt(integerPart || "0") * 100n + BigInt(decimalPart.padEnd(2, "0").slice(0, 2));
  return negative ? -cents : cents;
}

export function centavosToDecimal(value: bigint): string {
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  const raw = absolute.toString().padStart(3, "0");
  return `${negative ? "-" : ""}${raw.slice(0, -2) || "0"}.${raw.slice(-2)}`;
}

export function estadoSaldo(saldoCentavos: bigint, planificadoCentavos: bigint): EstadoSaldo {
  if (saldoCentavos <= 0n) return "agotado";
  if (planificadoCentavos <= 0n) return "critico";
  const porcentajeEntero = Number((saldoCentavos * 10000n) / planificadoCentavos) / 100;
  if (porcentajeEntero < 10) return "critico";
  if (porcentajeEntero < 30) return "bajo";
  return "ok";
}

export function calcularBreakdown(params: {
  montoPlanificado: string | number | { toString(): string };
  saldoDisponible: string | number | { toString(): string };
  certificadoVigente?: string | number | { toString(): string };
  bloqueadoSolicitudes?: string | number | { toString(): string };
  modificado?: string | number | { toString(): string };
  liberadoModoA?: string | number | { toString(): string };
  retiradoModoB?: string | number | { toString(): string };
}): SaldoBreakdown {
  const planificado = decimalToCentavos(params.montoPlanificado);
  const disponible = decimalToCentavos(params.saldoDisponible);
  const porcentajeDisponible = planificado > 0n ? Number((disponible * 10000n) / planificado) / 100 : 0;

  return {
    montoPlanificado: centavosToDecimal(planificado),
    saldoDisponible: centavosToDecimal(disponible),
    certificadoVigente: centavosToDecimal(decimalToCentavos(params.certificadoVigente ?? "0")),
    bloqueadoSolicitudes: centavosToDecimal(decimalToCentavos(params.bloqueadoSolicitudes ?? "0")),
    modificado: centavosToDecimal(decimalToCentavos(params.modificado ?? "0")),
    liberadoModoA: centavosToDecimal(decimalToCentavos(params.liberadoModoA ?? "0")),
    retiradoModoB: centavosToDecimal(decimalToCentavos(params.retiradoModoB ?? "0")),
    porcentajeDisponible,
    estado: estadoSaldo(disponible, planificado),
  };
}
