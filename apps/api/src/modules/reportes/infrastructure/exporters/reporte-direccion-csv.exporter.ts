type ReporteDireccionData = any;

export function exportarReporteDireccionCsv(data: ReporteDireccionData) {
  const rows = [
    ["Indicador", "Valor"],
    ["Actividades", data.saldos.totalActividades],
    ["Saldo disponible", data.saldos.saldoDisponible],
    ["Certificado vigente", data.saldos.certificadoVigente],
    ["Certificaciones", data.certificaciones.total],
    ["Tiempo promedio suscripción (horas)", data.certificaciones.promedioSuscripcionHoras],
    ["Modificaciones", data.modificaciones.total],
    ["Devoluciones", data.devoluciones.total],
    ["Casos no cubiertos", data.devoluciones.noCubiertas],
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  return {
    body: csv,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"reporte-direccion.csv\"",
    },
  };
}
