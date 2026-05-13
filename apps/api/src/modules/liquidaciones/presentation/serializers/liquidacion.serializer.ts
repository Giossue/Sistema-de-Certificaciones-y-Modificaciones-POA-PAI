export function toLiquidacionItem(liquidacion: any) {
  return { ...liquidacion, monto: Number(liquidacion.monto) };
}
