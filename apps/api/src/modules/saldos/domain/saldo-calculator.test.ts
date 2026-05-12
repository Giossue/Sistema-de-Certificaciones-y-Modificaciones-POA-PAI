import { describe, expect, test } from "bun:test";
import { calcularBreakdown, centavosToDecimal, decimalToCentavos, estadoSaldo } from "./saldo-calculator";

describe("saldo-calculator", () => {
  test("normaliza montos a centavos sin punto flotante", () => {
    expect(decimalToCentavos("10.05")).toBe(1005n);
    expect(decimalToCentavos("0.1")).toBe(10n);
    expect(centavosToDecimal(5n)).toBe("0.05");
  });

  test("clasifica semáforo de saldo", () => {
    expect(estadoSaldo(5000n, 10000n)).toBe("ok");
    expect(estadoSaldo(2500n, 10000n)).toBe("bajo");
    expect(estadoSaldo(999n, 10000n)).toBe("critico");
    expect(estadoSaldo(0n, 10000n)).toBe("agotado");
  });

  test("calcula desglose con valores monetarios exactos", () => {
    const saldo = calcularBreakdown({
      montoPlanificado: "100.00",
      saldoDisponible: "29.99",
      certificadoVigente: "70.01",
      bloqueadoSolicitudes: "0.10",
    });

    expect(saldo.saldoDisponible).toBe("29.99");
    expect(saldo.certificadoVigente).toBe("70.01");
    expect(saldo.bloqueadoSolicitudes).toBe("0.10");
    expect(saldo.estado).toBe("bajo");
    expect(saldo.porcentajeDisponible).toBe(29.99);
  });
});
