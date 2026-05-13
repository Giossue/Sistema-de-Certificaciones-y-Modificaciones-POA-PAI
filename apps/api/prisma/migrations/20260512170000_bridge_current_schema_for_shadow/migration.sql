-- Bridge migration.
-- The first migration in this local project is an older prototype schema.
-- This idempotent bridge lets Prisma rebuild a shadow database from migrations
-- before applying later MVP migrations. On the real local database these objects
-- already exist, so statements are no-ops or harmless column backfills.

ALTER TABLE "cedula_mef_versions"
  ADD COLUMN IF NOT EXISTS "periodo_fiscal_id" UUID,
  ADD COLUMN IF NOT EXISTS "archivo_nombre" TEXT NOT NULL DEFAULT 'legacy.xlsx',
  ADD COLUMN IF NOT EXISTS "archivo_hash" TEXT NOT NULL DEFAULT 'legacy',
  ADD COLUMN IF NOT EXISTS "importado_por" TEXT NOT NULL DEFAULT 'system';

CREATE TABLE IF NOT EXISTS "cedula_mef_entradas" (
  "id" UUID NOT NULL,
  "version_id" UUID NOT NULL,
  "programa_codigo" TEXT NOT NULL,
  "programa_nombre" TEXT NOT NULL,
  "actividad_codigo" TEXT NOT NULL,
  "actividad_nombre" TEXT NOT NULL,
  "item_codigo" TEXT NOT NULL,
  "item_nombre" TEXT NOT NULL,
  "fuente_codigo" TEXT NOT NULL,
  "fuente_nombre" TEXT NOT NULL,
  "monto_codificado" DECIMAL(18,2) NOT NULL,
  "monto_devengado" DECIMAL(18,2) NOT NULL,
  "saldo_disponible" DECIMAL(18,2) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cedula_mef_entradas_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "poa_versions"
  ADD COLUMN IF NOT EXISTS "numero_version" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "estado" TEXT NOT NULL DEFAULT 'borrador',
  ADD COLUMN IF NOT EXISTS "origen_modificacion_id" UUID,
  ADD COLUMN IF NOT EXISTS "created_by" TEXT NOT NULL DEFAULT 'system';

CREATE TABLE IF NOT EXISTS "actividades_poa" (
  "id" UUID NOT NULL,
  "poa_version_id" UUID NOT NULL,
  "unidad_id" UUID,
  "responsable_usuario_id" UUID,
  "responsable_nombre" TEXT,
  "programa_codigo" TEXT NOT NULL,
  "programa_nombre" TEXT NOT NULL,
  "actividad_codigo" TEXT NOT NULL,
  "actividad_nombre" TEXT NOT NULL,
  "item_codigo" TEXT NOT NULL,
  "item_nombre" TEXT NOT NULL,
  "fuente_codigo" TEXT NOT NULL,
  "fuente_nombre" TEXT NOT NULL,
  "monto_planificado" DECIMAL(18,2) NOT NULL,
  "saldo_disponible" DECIMAL(18,2) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "actividades_poa_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "modificaciones_poa" (
  "id" UUID NOT NULL,
  "numero" TEXT,
  "periodo_fiscal_id" UUID NOT NULL,
  "actividad_origen_id" UUID NOT NULL,
  "solicitante_id" UUID NOT NULL,
  "analista_id" UUID,
  "director_id" UUID,
  "estado" TEXT NOT NULL,
  "motivo" TEXT NOT NULL,
  "observaciones" TEXT,
  "programa_codigo_anterior" TEXT NOT NULL,
  "programa_nombre_anterior" TEXT NOT NULL,
  "actividad_codigo_anterior" TEXT NOT NULL,
  "actividad_nombre_anterior" TEXT NOT NULL,
  "item_codigo_anterior" TEXT NOT NULL,
  "item_nombre_anterior" TEXT NOT NULL,
  "fuente_codigo" TEXT NOT NULL,
  "fuente_nombre" TEXT NOT NULL,
  "monto_planificado_anterior" DECIMAL(18,2) NOT NULL,
  "programa_codigo_nuevo" TEXT NOT NULL,
  "programa_nombre_nuevo" TEXT NOT NULL,
  "actividad_codigo_nuevo" TEXT NOT NULL,
  "actividad_nombre_nuevo" TEXT NOT NULL,
  "item_codigo_nuevo" TEXT NOT NULL,
  "item_nombre_nuevo" TEXT NOT NULL,
  "monto_planificado_nuevo" DECIMAL(18,2) NOT NULL,
  "informe_ruta" TEXT,
  "nueva_poa_version_id" UUID,
  "nueva_actividad_id" UUID,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "modificaciones_poa_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "certificaciones"
  ADD COLUMN IF NOT EXISTS "cedula_version_id" UUID;

CREATE TABLE IF NOT EXISTS "liquidaciones_certificacion" (
  "id" UUID NOT NULL,
  "certificacion_id" UUID NOT NULL,
  "usuario_id" UUID NOT NULL,
  "tipo" TEXT NOT NULL,
  "modo" TEXT NOT NULL,
  "monto" DECIMAL(18,2) NOT NULL,
  "motivo" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "liquidaciones_certificacion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "anulaciones_certificacion" (
  "id" UUID NOT NULL,
  "certificacion_id" UUID NOT NULL,
  "usuario_id" UUID NOT NULL,
  "motivo" TEXT NOT NULL,
  "monto_liberado" DECIMAL(18,2) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "anulaciones_certificacion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "devoluciones_financiero" (
  "id" UUID NOT NULL,
  "certificacion_id" UUID,
  "usuario_id" UUID NOT NULL,
  "causa" TEXT NOT NULL,
  "descripcion" TEXT NOT NULL,
  "regla_asociada" TEXT,
  "cubierta_por_sistema" BOOLEAN NOT NULL DEFAULT false,
  "improcedente" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "devoluciones_financiero_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "poa_versions_periodo_fiscal_id_numero_version_key" ON "poa_versions"("periodo_fiscal_id", "numero_version");
CREATE INDEX IF NOT EXISTS "cedula_mef_versions_periodo_fiscal_id_vigente_idx" ON "cedula_mef_versions"("periodo_fiscal_id", "vigente");
CREATE INDEX IF NOT EXISTS "cedula_mef_entradas_version_id_idx" ON "cedula_mef_entradas"("version_id");
CREATE INDEX IF NOT EXISTS "cedula_mef_entradas_programa_codigo_actividad_codigo_item_c_idx" ON "cedula_mef_entradas"("programa_codigo", "actividad_codigo", "item_codigo", "fuente_codigo");
CREATE INDEX IF NOT EXISTS "actividades_poa_poa_version_id_unidad_id_idx" ON "actividades_poa"("poa_version_id", "unidad_id");
CREATE UNIQUE INDEX IF NOT EXISTS "modificaciones_poa_numero_key" ON "modificaciones_poa"("numero");
CREATE INDEX IF NOT EXISTS "modificaciones_poa_periodo_fiscal_id_estado_idx" ON "modificaciones_poa"("periodo_fiscal_id", "estado");
CREATE INDEX IF NOT EXISTS "modificaciones_poa_actividad_origen_id_estado_idx" ON "modificaciones_poa"("actividad_origen_id", "estado");
CREATE INDEX IF NOT EXISTS "liquidaciones_certificacion_certificacion_id_idx" ON "liquidaciones_certificacion"("certificacion_id");
CREATE UNIQUE INDEX IF NOT EXISTS "anulaciones_certificacion_certificacion_id_key" ON "anulaciones_certificacion"("certificacion_id");
CREATE INDEX IF NOT EXISTS "devoluciones_financiero_causa_created_at_idx" ON "devoluciones_financiero"("causa", "created_at");
