import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const API = process.env.SMOKE_API_URL || "http://localhost:3001/api/v1";

const users = {
  unidad: ["unidad@ueb.edu.ec", "unidad123"],
  analista: ["analista@ueb.edu.ec", "analista123"],
  director: ["director@ueb.edu.ec", "director123"],
  financiero: ["financiero@ueb.edu.ec", "financiero123"],
} as const;

type Role = keyof typeof users;

async function json<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const response = await fetch(`${API}${path}`, { ...init, headers });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(`${init.method || "GET"} ${path}: ${data.error || response.statusText}`);
  return data;
}

async function login(role: Role) {
  const [email, password] = users[role];
  const response = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`login ${role}: ${data.error || response.statusText}`);
  return data.token as string;
}

async function setupActivity(tag: string, amount = "1500.00") {
  const [periodo, admin, unidad] = await Promise.all([
    prisma.periodoFiscal.findFirst({ where: { activo: true }, orderBy: { anio: "desc" } }),
    prisma.usuario.findUnique({ where: { email: "admin@ueb.edu.ec" } }),
    prisma.usuario.findUnique({ where: { email: "unidad@ueb.edu.ec" } }),
  ]);
  if (!periodo || !admin || !unidad) throw new Error("Faltan datos seed base");

  let cedula = await prisma.cedulaMefVersion.findFirst({ where: { periodoFiscalId: periodo.id, vigente: true } });
  if (!cedula) {
    cedula = await prisma.cedulaMefVersion.create({
      data: {
        periodoFiscalId: periodo.id,
        archivoNombre: "smoke-cedula.xlsx",
        archivoHash: `smoke-${Date.now()}`,
        corteFecha: new Date(),
        vigente: true,
        importadoPor: admin.id,
      },
    });
  }

  let poa = await prisma.poaVersion.findFirst({ where: { periodoFiscalId: periodo.id, vigente: true } });
  if (!poa) {
    poa = await prisma.poaVersion.create({
      data: { periodoFiscalId: periodo.id, numeroVersion: 1, estado: "vigente", vigente: true, createdBy: admin.id },
    });
  }

  const suffix = `${tag}${Date.now().toString().slice(-7)}`;
  const data = {
    programaCodigo: `S${suffix.slice(0, 5)}`,
    programaNombre: `Smoke Programa ${tag}`,
    actividadCodigo: `A${suffix.slice(0, 6)}`,
    actividadNombre: `Smoke Actividad ${tag}`,
    itemCodigo: `I${suffix.slice(0, 6)}`,
    itemNombre: `Smoke Ítem ${tag}`,
    fuenteCodigo: `F${suffix.slice(0, 5)}`,
    fuenteNombre: `Smoke Fuente ${tag}`,
  };

  await prisma.cedulaMefEntrada.create({
    data: {
      versionId: cedula.id,
      ...data,
      montoCodificado: amount,
      montoDevengado: "0.00",
      saldoDisponible: amount,
    },
  });
  await prisma.actividadesPoa.create({
    data: {
      poaVersionId: poa.id,
      unidadId: unidad.id,
      responsableNombre: unidad.nombre,
      ...data,
      montoPlanificado: amount,
      saldoDisponible: amount,
    },
  });
  return { periodoFiscalId: periodo.id, ...data };
}

async function createCert(token: string, activity: Awaited<ReturnType<typeof setupActivity>>, tipo: "POA" | "PAI" = "POA", monto = "100.00") {
  const form = new FormData();
  form.set("tipo", tipo);
  form.set("periodoFiscalId", activity.periodoFiscalId);
  form.set("programaCodigo", activity.programaCodigo);
  form.set("actividadCodigo", activity.actividadCodigo);
  form.set("itemCodigo", activity.itemCodigo);
  form.set("fuenteCodigo", activity.fuenteCodigo);
  form.set("monto", monto);
  form.set("conIva", "false");
  form.append("documentos", new File([new Blob(["%PDF-1.4\n% smoke\n"], { type: "application/pdf" })], `smoke-${tipo}.pdf`, { type: "application/pdf" }));
  return json<any>("/certificaciones", token, { method: "POST", body: form });
}

async function main() {
  const tokens = {
    unidad: await login("unidad"),
    analista: await login("analista"),
    director: await login("director"),
    financiero: await login("financiero"),
  };

  const certActivity = await setupActivity("CERT");
  const cert = (await createCert(tokens.unidad, certActivity, "POA")).data;
  const generated = (await json<any>(`/certificaciones/${cert.id}/aprobar`, tokens.analista, { method: "POST" })).data;
  if (!String(generated.numero || "").startsWith("POA-")) throw new Error(`Número inválido: ${generated.numero}`);
  await json(`/certificaciones/${cert.id}/suscribir`, tokens.director, { method: "POST" });
  await json(`/certificaciones/${cert.id}/marcar-uso`, tokens.financiero, { method: "POST" });

  const liquidacion = (await json<any>("/liquidaciones", tokens.unidad, {
    method: "POST",
    body: JSON.stringify({ certificacionId: cert.id, tipo: "total", modo: "A", motivo: "Smoke liquidación" }),
  })).data;
  await json(`/liquidaciones/${liquidacion.id}/aprobar`, tokens.director, { method: "POST" });

  const anulActivity = await setupActivity("ANUL");
  const anulCert = (await createCert(tokens.unidad, anulActivity, "PAI")).data;
  const anulGenerated = (await json<any>(`/certificaciones/${anulCert.id}/aprobar`, tokens.analista, { method: "POST" })).data;
  if (!String(anulGenerated.numero || "").startsWith("PAI-")) throw new Error(`Número PAI inválido: ${anulGenerated.numero}`);
  await json(`/certificaciones/${anulCert.id}/suscribir`, tokens.director, { method: "POST" });
  const anulacion = (await json<any>("/anulaciones", tokens.unidad, {
    method: "POST",
    body: JSON.stringify({ certificacionId: anulCert.id, motivo: "Smoke anulación" }),
  })).data;
  await json(`/anulaciones/${anulacion.id}/aprobar`, tokens.director, { method: "POST" });

  const modActivity = await setupActivity("MOD", "1800.00");
  const modificacion = (await json<any>("/modificaciones-poa", tokens.unidad, {
    method: "POST",
    body: JSON.stringify({
      actividadId: (await prisma.actividadesPoa.findFirstOrThrow({
        where: {
          programaCodigo: modActivity.programaCodigo,
          actividadCodigo: modActivity.actividadCodigo,
          itemCodigo: modActivity.itemCodigo,
          fuenteCodigo: modActivity.fuenteCodigo,
        },
      })).id,
      motivo: "Otro",
      programaCodigo: modActivity.programaCodigo,
      actividadCodigo: modActivity.actividadCodigo,
      itemCodigo: modActivity.itemCodigo,
      fuenteCodigo: modActivity.fuenteCodigo,
      responsableNuevoNombre: "Responsable smoke",
      montoPlanificadoNuevo: "1900.00",
    }),
  })).data;
  await json(`/modificaciones-poa/${modificacion.id}/suscribir`, tokens.director, { method: "POST" });
  await json(`/modificaciones-poa/${modificacion.id}/aprobar`, tokens.analista, { method: "POST" });
  await json(`/modificaciones-poa/${modificacion.id}/aplicar`, tokens.analista, { method: "POST" });

  const devActivity = await setupActivity("DEV");
  const devCert = (await createCert(tokens.unidad, devActivity, "POA")).data;
  await json(`/certificaciones/${devCert.id}/aprobar`, tokens.analista, { method: "POST" });
  await json(`/certificaciones/${devCert.id}/suscribir`, tokens.director, { method: "POST" });
  const devolucion = (await json<any>("/devoluciones-financiero", tokens.financiero, {
    method: "POST",
    body: JSON.stringify({
      certificacionId: devCert.id,
      causa: "Documento incompleto",
      descripcion: "Smoke devolución financiero",
      clasificacion: "Subsanable",
    }),
  })).data;
  await json(`/devoluciones-financiero/${devolucion.id}/clasificar`, tokens.financiero, {
    method: "POST",
    body: JSON.stringify({ clasificacion: "Subsanable", reglaAsociada: "DOC-01", cubiertaPorSistema: true }),
  });
  await json(`/devoluciones-financiero/${devolucion.id}/reenviar`, tokens.unidad, { method: "POST" });

  await json(`/reportes/direccion/${certActivity.periodoFiscalId}`, tokens.director);
  await json("/certificaciones", tokens.unidad);
  await json("/modificaciones-poa", tokens.analista);
  await json("/devoluciones-financiero", tokens.financiero);

  console.log("✓ Smoke MVP institucional OK");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
