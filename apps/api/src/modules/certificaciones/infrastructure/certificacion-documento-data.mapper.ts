export function crearDocumentoData(cert: any, actividad: any, solicitanteNombre: string) {
  return {
    id: cert.id,
    tipo: cert.tipo,
    numero: cert.numero,
    monto: cert.monto.toString(),
    conIva: cert.conIva,
    solicitanteNombre,
    programaCodigo: actividad.programaCodigo,
    programaNombre: actividad.programaNombre,
    actividadCodigo: actividad.actividadCodigo,
    actividadNombre: actividad.actividadNombre,
    itemCodigo: actividad.itemCodigo,
    itemNombre: actividad.itemNombre,
    fuenteCodigo: actividad.fuenteCodigo,
    fuenteNombre: actividad.fuenteNombre,
    fecha: new Date(),
  };
}
