import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "./config/env";
import { mapDomainErrorToHttp } from "./common/errors/http-error.map";
import { authGuard } from "./common/guards/auth.guard";

import { authRoutes } from "./modules/auth/presentation/routes/auth.routes";
import { usuariosRoutes } from "./modules/usuarios/presentation/routes/usuarios.routes";
import { rolesRoutes } from "./modules/roles/presentation/routes/roles.routes";
import { catalogosRoutes } from "./modules/catalogos/presentation/routes/catalogos.routes";
import { periodosFiscalesRoutes } from "./modules/periodos-fiscales/presentation/routes/periodos-fiscales.routes";
import cedulaMefRoutes from "./modules/cedula-mef/presentation/routes/cedula-mef.routes";
import poaRoutes from "./modules/poa/presentation/routes/poa.routes";
import certificacionesRoutes from "./modules/certificaciones/presentation/routes/certificaciones.routes";
import saldosRoutes from "./modules/saldos/presentation/routes/saldos.routes";
import modificacionesPoaRoutes from "./modules/modificaciones-poa/presentation/routes/modificaciones-poa.routes";
import liquidacionesRoutes from "./modules/liquidaciones/presentation/routes/liquidaciones.routes";
import anulacionesRoutes from "./modules/anulaciones/presentation/routes/anulaciones.routes";
import devolucionesFinancieroRoutes from "./modules/devoluciones-financiero/presentation/routes/devoluciones-financiero.routes";
import reportesRoutes from "./modules/reportes/presentation/routes/reportes.routes";

const app = new Hono();

app.use(logger());
app.use(cors({ origin: "*" }));

app.onError((err, c) => {
  const httpError = mapDomainErrorToHttp(err);
  console.error("[ERROR]", err);
  return c.json(
    {
      error: httpError.message,
      status: httpError.status,
    },
    httpError.status
  );
});

app.get("/api/v1/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

// Public download route (no auth required)
app.get("/api/v1/poa/plantilla", async (c) => {
  const XLSX = require("xlsx");

  const ACC_FMT = "_ * #,##0.00_ ;_ * \\-#,##0.00_ ;_ * \"-\"??_ ;_ @_ ";
  const headerFill = { fgColor: { rgb: "132C41" }, patternType: "solid" };
  const headerFont = { bold: true, color: { rgb: "FFFFFF" }, sz: 11 };
  const headerAlign = { horizontal: "center", vertical: "middle", wrapText: true };
  const titleFont = { bold: true, sz: 16, color: { rgb: "132C41" } };
  const subtitleFont = { bold: true, sz: 12 };

  // Headers exactos del Excel original
  const headers = [
    "No", "OBJETIVOS ESTRATÉGICOS", "OBJETIVO OPERATIVO", "PROGRAMAS",
    "PROYECTO", "RESPONSABLE",
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",
    "PRESUPUESTO", "ASIGNADO REFORMA INTEGRAL", "CERTIFICACIONES", "MODIFICACIONES", "SALDO",
    "Descripción de la actividad",
    "PROGRAMA", "ACTIVIDAD", "FUENTE", "Item Presupuestario", "Grupo de Gasto", "Detalle Item", "OBSERVACION",
  ];

  // Estructura igual al Excel original:
  // Row 0: PLAN OPERATIVO ANUAL 2026 (A merged)
  // Row 1: empty
  // Row 2: UNIVERSIDAD ESTATAL DE BOLÍVAR (A merged)
  // Row 3-4: empty
  // Row 5: "Misión" (col 4) | empty F-H | "Visión" (col 18) | visión text (cols 23-30)
  // Row 6: empty (merged with row 5 for the label cells)
  // Row 7-8: empty
  // Row 9: headers
  // Row 10: example data
  // Row 11: empty template

  const wsData = [
    ["PLAN  OPERATIVO ANUAL 2026"],
    [],
    ["UNIVERSIDAD ESTATAL DE BOLÍVAR"],
    [],
    [],
    ["", "", "", "", "Misión", "", "", "", "", "", "", "", "", "", "", "", "", "", "Visión"],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "“Al 2029 ser una Universidad referente a nivel nacional, reconocida por el rigor académico, la pertinencia de su oferta educativa y la innovación en investigación impulsando la sostenibilidad, el desarrollo social y productivo del país.”."],
    [],
    [],
    headers,
    [
      1,
      "OE 4: Incrementar la gestión de las actividades de apoyo para la optimización de las capacidades  de las funciones sustantivas.",
      "O.O. 4.1: Optimizar la gestión administrativa y financiera.",
      "P.4.1. Modernización Institucional",
      "Programa integral de bienestar estudiantil y servicios de apoyo al éxito académico",
      "BIENESTAR UNIVERSITARIO",
      "", "", "", "", "", "", "", "", "", "", "",
      10000, 10000, 0, 0, 10000,
      "COMPRA DE MEDICAMENTOS PARA CAMPUS MATRIZ- LAGUACOTO",
      "01", "001", "001", 530809, 53, "Medicamentos", "",
    ],
    Array(31).fill(""),
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Merges tal como el original
  ws["!merges"] = [
    { s: { c: 0, r: 0 }, e: { c: 30, r: 0 } },
    { s: { c: 0, r: 2 }, e: { c: 30, r: 2 } },
    { s: { c: 4, r: 5 }, e: { c: 4, r: 6 } },
    { s: { c: 5, r: 5 }, e: { c: 7, r: 6 } },
    { s: { c: 18, r: 5 }, e: { c: 18, r: 6 } },
    { s: { c: 23, r: 5 }, e: { c: 30, r: 6 } },
  ];

  // Style title rows
  ws["A1"].s = titleFont;
  ws["A3"].s = subtitleFont;
  ws["E6"].s = { font: { bold: true } };
  ws["S6"].s = { font: { bold: true } };

  // Style header row (row 9) - BLUE FILL + white bold centered text
  headers.forEach((_, colIdx) => {
    const ref = XLSX.utils.encode_cell({ r: 9, c: colIdx });
    if (!ws[ref]) ws[ref] = { v: headers[colIdx] };
    ws[ref].s = {
      fill: headerFill,
      font: headerFont,
      alignment: headerAlign,
      border: {
        top: { style: "thin", color: { rgb: "FFFFFF" } },
        bottom: { style: "thin", color: { rgb: "FFFFFF" } },
        left: { style: "thin", color: { rgb: "FFFFFF" } },
        right: { style: "thin", color: { rgb: "FFFFFF" } },
      },
    };
    if (colIdx >= 6 && colIdx <= 17) ws[ref].z = "@";
  });

  // Style data row (row 10) - BLUE FILL + white text + centered
  const dataFill = { fgColor: { rgb: "132C41" }, patternType: "solid" };
  const dataFont = { bold: true, color: { rgb: "FFFFFF" }, sz: 11 };
  const dataAlign = { horizontal: "center", vertical: "middle" };
  for (let c = 0; c < 31; c++) {
    const ref = XLSX.utils.encode_cell({ r: 10, c });
    if (ws[ref]) {
      ws[ref].s = {
        fill: dataFill,
        font: dataFont,
        alignment: dataAlign,
        border: {
          top: { style: "thin", color: { rgb: "FFFFFF" } },
          bottom: { style: "thin", color: { rgb: "FFFFFF" } },
          left: { style: "thin", color: { rgb: "FFFFFF" } },
          right: { style: "thin", color: { rgb: "FFFFFF" } },
        },
      };
      if (c >= 18 && c <= 22) {
        ws[ref].z = ACC_FMT;
      } else if (c >= 6 && c <= 17) {
        ws[ref].z = "@";
      }
    }
  }

  // Row heights
  ws["!rows"] = [
    { hpt: 31.5 }, null, { hpt: 21 }, null, null,
    null, null, null, null,
    { hpt: 30 },
    { hpt: 60 },
    { hpt: 20 },
  ];

  // Column widths exactas (px matching original)
  ws["!cols"] = [
    { wpx: 68,  wch: 5  },  // 0  No
    { wpx: 444, wch: 32 },  // 1  OBJETIVOS ESTRATÉGICOS
    { wpx: 410, wch: 29 },  // 2  OBJETIVO OPERATIVO
    { wpx: 288, wch: 20 },  // 3  PROGRAMAS
    { wpx: 308, wch: 22 },  // 4  PROYECTO
    { wpx: 348, wch: 24 },  // 5  RESPONSABLE
    { wpx: 52,  wch: 3, hidden: true },  // 6  1
    { wpx: 52,  wch: 3, hidden: true },  // 7  2
    { wpx: 52,  wch: 3, hidden: true },  // 8  3
    { wpx: 52,  wch: 3, hidden: true },  // 9  4
    { wpx: 52,  wch: 3, hidden: true },  // 10 5
    { wpx: 52,  wch: 3, hidden: true },  // 11 6
    { wpx: 52,  wch: 3, hidden: true },  // 12 7
    { wpx: 52,  wch: 3, hidden: true },  // 13 8
    { wpx: 52,  wch: 3, hidden: true },  // 14 9
    { wpx: 52,  wch: 3, hidden: true },  // 15 10
    { wpx: 52,  wch: 3, hidden: true },  // 16 11
    { wpx: 52,  wch: 3, hidden: true },  // 17 12
    { wpx: 292, wch: 21 },  // 18 PRESUPUESTO
    { wpx: 292, wch: 21 },  // 19 ASIGNADO
    { wpx: 292, wch: 21 },  // 20 CERTIFICACIONES
    { wpx: 292, wch: 21 },  // 21 MODIFICACIONES
    { wpx: 292, wch: 21 },  // 22 SALDO
    { wpx: 410, wch: 29 },  // 23 Descripción
    { wpx: 188, wch: 13 },  // 24 PROGRAMA
    { wpx: 162, wch: 11 },  // 25 ACTIVIDAD
    { wpx: 144, wch: 9  },  // 26 FUENTE
    { wpx: 312, wch: 22 },  // 27 Item
    { wpx: 162, wch: 11 },  // 28 Grupo
    { wpx: 478, wch: 34 },  // 29 Detalle Item
    { wpx: 322, wch: 22 },  // 30 OBSERVACION
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "POA-BASE");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
  return c.body(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=\"plantilla-poa-definitivo.xlsx\"",
    },
  });
});

app.route("/api/v1/auth", authRoutes);
app.use("/api/v1/usuarios/*", authGuard);
app.route("/api/v1/usuarios", usuariosRoutes);
app.use("/api/v1/roles/*", authGuard);
app.route("/api/v1/roles", rolesRoutes);
app.use("/api/v1/catalogos/*", authGuard);
app.route("/api/v1/catalogos", catalogosRoutes);
app.use("/api/v1/periodos-fiscales/*", authGuard);
app.route("/api/v1/periodos-fiscales", periodosFiscalesRoutes);
app.use("/api/v1/cedula-mef/*", authGuard);
app.route("/api/v1/cedula-mef", cedulaMefRoutes);
app.use("/api/v1/poa/*", authGuard);
app.route("/api/v1/poa", poaRoutes);
app.use("/api/v1/saldos/*", authGuard);
app.route("/api/v1/saldos", saldosRoutes);
app.use("/api/v1/certificaciones/*", authGuard);
app.route("/api/v1/certificaciones", certificacionesRoutes);
app.use("/api/v1/modificaciones-poa/*", authGuard);
app.route("/api/v1/modificaciones-poa", modificacionesPoaRoutes);
app.use("/api/v1/liquidaciones/*", authGuard);
app.route("/api/v1/liquidaciones", liquidacionesRoutes);
app.use("/api/v1/anulaciones/*", authGuard);
app.route("/api/v1/anulaciones", anulacionesRoutes);
app.use("/api/v1/devoluciones-financiero/*", authGuard);
app.route("/api/v1/devoluciones-financiero", devolucionesFinancieroRoutes);
app.use("/api/v1/reportes/*", authGuard);
app.route("/api/v1/reportes", reportesRoutes);

const port = parseInt(env.API_PORT, 10);
const host = env.API_HOST;

Bun.serve({
  port,
  hostname: host,
  fetch: app.fetch,
});

console.log(`🚀 API corriendo en http://${host}:${port}`);

export { app };
