export function matchesQuery(item: any, query: string) {
  if (!query) return true;
  const normalized = query.toLowerCase();
  return [item.numero, item.titulo, item.detalle, item.unidad].join(" ").toLowerCase().includes(normalized);
}

export function compareTramites(a: any, b: any, key: string, direction: "asc" | "desc") {
  const multiplier = direction === "asc" ? 1 : -1;
  if (key === "monto") return (Number(a.monto || 0) - Number(b.monto || 0)) * multiplier;
  if (key === "fecha") return String(a.createdAt || "").localeCompare(String(b.createdAt || "")) * multiplier;
  const valueA = sortValue(a, key);
  const valueB = sortValue(b, key);
  return valueA.localeCompare(valueB, "es", { numeric: true, sensitivity: "base" }) * multiplier;
}

function sortValue(item: any, key: string) {
  if (key === "numero") return item.numero || "";
  if (key === "titulo") return `${item.titulo || ""} ${item.detalle || ""}`;
  if (key === "unidad") return item.unidad || "";
  if (key === "estado") return item.estado || "";
  return "";
}

export function normalizarCertificacion(item: any) {
  return {
    id: item.id,
    kind: "certificacion",
    numero: item.numero || `${item.tipo || "POA"} pendiente`,
    estado: item.estado,
    titulo: `${item.tipo || "POA"} ${item.actividad?.actividadCodigo || ""} / ${item.actividad?.itemCodigo || ""}`,
    detalle: item.observaciones || item.actividad?.actividadNombre || "Solicitud de certificación",
    unidad: item.solicitante?.nombre,
    monto: Number(item.monto || 0),
    createdAt: item.createdAt,
    raw: item,
  };
}

export function normalizarModificacion(item: any) {
  const raw = {
    ...item,
    anterior: {
      programaCodigo: item.programaCodigoAnterior,
      actividadCodigo: item.actividadCodigoAnterior,
      itemCodigo: item.itemCodigoAnterior,
      fuenteCodigo: item.fuenteCodigo,
      responsableNombre: item.responsableAnteriorNombre,
      montoPlanificado: Number(item.montoPlanificadoAnterior || 0),
    },
    nuevo: {
      programaCodigo: item.programaCodigoNuevo,
      actividadCodigo: item.actividadCodigoNuevo,
      itemCodigo: item.itemCodigoNuevo,
      fuenteCodigo: item.fuenteCodigo,
      responsableNombre: item.responsableNuevoNombre,
      montoPlanificado: Number(item.montoPlanificadoNuevo || 0),
    },
  };
  return {
    id: item.id,
    kind: "modificacion",
    numero: item.numero || "MOD pendiente",
    estado: item.estado,
    titulo: item.motivo,
    detalle: `${item.programaCodigoAnterior}/${item.actividadCodigoAnterior}/${item.itemCodigoAnterior} -> ${item.programaCodigoNuevo}/${item.actividadCodigoNuevo}/${item.itemCodigoNuevo}`,
    unidad: item.solicitante?.nombre,
    monto: Number(item.montoPlanificadoNuevo || 0),
    createdAt: item.createdAt,
    raw,
  };
}

export function normalizarLiquidacion(item: any) {
  return {
    id: item.id,
    kind: "liquidacion",
    numero: item.certificacion?.numero || "Liquidación",
    estado: item.estado,
    titulo: `Modo ${item.modo} · ${item.tipo}`,
    detalle: item.motivo || item.certificacion?.actividad?.actividadNombre || "Solicitud de liquidación",
    unidad: item.usuario?.nombre,
    monto: Number(item.monto || 0),
    createdAt: item.createdAt,
    raw: item,
  };
}

export function normalizarAnulacion(item: any) {
  return {
    id: item.id,
    kind: "anulacion",
    numero: item.certificacion?.numero || "Anulación",
    estado: item.estado,
    titulo: "Anulación de certificación",
    detalle: item.motivo,
    unidad: item.usuario?.nombre,
    monto: Number(item.montoLiberado || 0),
    createdAt: item.createdAt,
    raw: item,
  };
}

export function normalizarDevolucion(item: any) {
  return {
    id: item.id,
    kind: "devolucion",
    numero: item.certificacion?.numero || "Devolución",
    estado: item.estadoCorreccion || "pendiente",
    titulo: item.clasificacion || item.causa,
    detalle: item.descripcion,
    unidad: item.usuario?.nombre,
    createdAt: item.createdAt,
    raw: item,
  };
}
