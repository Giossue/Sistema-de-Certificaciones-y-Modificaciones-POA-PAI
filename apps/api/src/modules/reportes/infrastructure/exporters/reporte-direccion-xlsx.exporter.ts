type ReporteDireccionData = any;

export function exportarReporteDireccionXlsx(data: ReporteDireccionData) {
  const XLSX = require("xlsx");
  const rows = [
    ["Indicador", "Valor"],
    ["Actividades", data.saldos.totalActividades],
    ["Saldo disponible", data.saldos.saldoDisponible],
    ["Certificado vigente", data.saldos.certificadoVigente],
    ["Devoluciones", data.devoluciones.total],
    ["Casos no cubiertos", data.devoluciones.noCubiertas],
  ];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Direccion");
  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
  return {
    body: buffer,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=\"reporte-direccion.xlsx\"",
    },
  };
}
