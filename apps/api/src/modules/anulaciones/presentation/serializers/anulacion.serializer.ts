export function toAnulacionItem(anulacion: any) {
  return { ...anulacion, montoLiberado: Number(anulacion.montoLiberado) };
}
