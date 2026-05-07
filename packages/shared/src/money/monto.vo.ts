export class MontoInvalidoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MontoInvalidoError";
  }
}

export class Monto {
  private readonly _centavos: bigint;

  private constructor(centavos: bigint) {
    this._centavos = centavos;
  }

  static desdeCentavos(centavos: bigint): Monto {
    return new Monto(centavos);
  }

  static desdeString(valor: string): Monto {
    const normalizado = valor.trim().replace(",", ".");
    const partes = normalizado.split(".");

    if (partes.length > 2) {
      throw new MontoInvalidoError(`Formato inválido: ${valor}`);
    }

    const enteros = partes[0];
    const decimales = (partes[1] ?? "").padEnd(2, "0").slice(0, 2);

    if (!/^-?\d+$/.test(enteros + decimales)) {
      throw new MontoInvalidoError(`Valor no numérico: ${valor}`);
    }

    const signo = enteros.startsWith("-") ? -1n : 1n;
    const absEnteros = enteros.replace("-", "");
    const centavos = signo * (BigInt(absEnteros) * 100n + BigInt(decimales));

    return new Monto(centavos);
  }

  static desdeNumeroSeguro(valor: number): Monto {
    const str = valor.toFixed(2);
    return Monto.desdeString(str);
  }

  static cero(): Monto {
    return new Monto(0n);
  }

  get centavos(): bigint {
    return this._centavos;
  }

  get valor(): number {
    return Number(this._centavos) / 100;
  }

  toString(): string {
    const signo = this._centavos < 0n ? "-" : "";
    const abs = this._centavos < 0n ? -this._centavos : this._centavos;
    const entero = abs / 100n;
    const decimal = abs % 100n;
    return `${signo}${entero}.${decimal.toString().padStart(2, "0")}`;
  }

  toJSON(): string {
    return this.toString();
  }

  sumar(otro: Monto): Monto {
    return new Monto(this._centavos + otro._centavos);
  }

  restar(otro: Monto): Monto {
    return new Monto(this._centavos - otro._centavos);
  }

  multiplicar(factor: number): Monto {
    const factorCentavos = BigInt(Math.round(factor * 100));
    return new Monto((this._centavos * factorCentavos) / 100n);
  }

  esMayorQue(otro: Monto): boolean {
    return this._centavos > otro._centavos;
  }

  esMayorOIgualQue(otro: Monto): boolean {
    return this._centavos >= otro._centavos;
  }

  esMenorQue(otro: Monto): boolean {
    return this._centavos < otro._centavos;
  }

  esMenorOIgualQue(otro: Monto): boolean {
    return this._centavos <= otro._centavos;
  }

  esCero(): boolean {
    return this._centavos === 0n;
  }

  esNegativo(): boolean {
    return this._centavos < 0n;
  }

  abs(): Monto {
    return new Monto(this._centavos < 0n ? -this._centavos : this._centavos);
  }

  equals(otro: Monto): boolean {
    return this._centavos === otro._centavos;
  }
}
