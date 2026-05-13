-- Align migration history with the current institutional schema.
-- Safe on the real local DB: obsolete prototype tables/columns are dropped only
-- if present, defaults from the bridge are removed, and constraints are added
-- only when missing.

DROP TABLE IF EXISTS "actividades_presupuestarias" CASCADE;
DROP TABLE IF EXISTS "cedula_entradas" CASCADE;

ALTER TABLE "poa_versions" DROP COLUMN IF EXISTS "version";
ALTER TABLE "poa_versions" ALTER COLUMN "numero_version" DROP DEFAULT;
ALTER TABLE "poa_versions" ALTER COLUMN "created_by" DROP DEFAULT;

ALTER TABLE "cedula_mef_versions" ALTER COLUMN "archivo_nombre" DROP DEFAULT;
ALTER TABLE "cedula_mef_versions" ALTER COLUMN "archivo_hash" DROP DEFAULT;
ALTER TABLE "cedula_mef_versions" ALTER COLUMN "importado_por" DROP DEFAULT;

ALTER TABLE "modificaciones_poa" ALTER COLUMN "updated_at" DROP DEFAULT;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cedula_mef_versions_periodo_fiscal_id_fkey') THEN
    ALTER TABLE "cedula_mef_versions" ADD CONSTRAINT "cedula_mef_versions_periodo_fiscal_id_fkey" FOREIGN KEY ("periodo_fiscal_id") REFERENCES "periodos_fiscales"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cedula_mef_entradas_version_id_fkey') THEN
    ALTER TABLE "cedula_mef_entradas" ADD CONSTRAINT "cedula_mef_entradas_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "cedula_mef_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'actividades_poa_poa_version_id_fkey') THEN
    ALTER TABLE "actividades_poa" ADD CONSTRAINT "actividades_poa_poa_version_id_fkey" FOREIGN KEY ("poa_version_id") REFERENCES "poa_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'modificaciones_poa_periodo_fiscal_id_fkey') THEN
    ALTER TABLE "modificaciones_poa" ADD CONSTRAINT "modificaciones_poa_periodo_fiscal_id_fkey" FOREIGN KEY ("periodo_fiscal_id") REFERENCES "periodos_fiscales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'modificaciones_poa_actividad_origen_id_fkey') THEN
    ALTER TABLE "modificaciones_poa" ADD CONSTRAINT "modificaciones_poa_actividad_origen_id_fkey" FOREIGN KEY ("actividad_origen_id") REFERENCES "actividades_poa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'modificaciones_poa_solicitante_id_fkey') THEN
    ALTER TABLE "modificaciones_poa" ADD CONSTRAINT "modificaciones_poa_solicitante_id_fkey" FOREIGN KEY ("solicitante_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'modificaciones_poa_analista_id_fkey') THEN
    ALTER TABLE "modificaciones_poa" ADD CONSTRAINT "modificaciones_poa_analista_id_fkey" FOREIGN KEY ("analista_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'modificaciones_poa_director_id_fkey') THEN
    ALTER TABLE "modificaciones_poa" ADD CONSTRAINT "modificaciones_poa_director_id_fkey" FOREIGN KEY ("director_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'certificaciones_actividad_id_fkey') THEN
    ALTER TABLE "certificaciones" ADD CONSTRAINT "certificaciones_actividad_id_fkey" FOREIGN KEY ("actividad_id") REFERENCES "actividades_poa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'certificaciones_cedula_version_id_fkey') THEN
    ALTER TABLE "certificaciones" ADD CONSTRAINT "certificaciones_cedula_version_id_fkey" FOREIGN KEY ("cedula_version_id") REFERENCES "cedula_mef_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'liquidaciones_certificacion_certificacion_id_fkey') THEN
    ALTER TABLE "liquidaciones_certificacion" ADD CONSTRAINT "liquidaciones_certificacion_certificacion_id_fkey" FOREIGN KEY ("certificacion_id") REFERENCES "certificaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'liquidaciones_certificacion_usuario_id_fkey') THEN
    ALTER TABLE "liquidaciones_certificacion" ADD CONSTRAINT "liquidaciones_certificacion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'anulaciones_certificacion_certificacion_id_fkey') THEN
    ALTER TABLE "anulaciones_certificacion" ADD CONSTRAINT "anulaciones_certificacion_certificacion_id_fkey" FOREIGN KEY ("certificacion_id") REFERENCES "certificaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'anulaciones_certificacion_usuario_id_fkey') THEN
    ALTER TABLE "anulaciones_certificacion" ADD CONSTRAINT "anulaciones_certificacion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'devoluciones_financiero_certificacion_id_fkey') THEN
    ALTER TABLE "devoluciones_financiero" ADD CONSTRAINT "devoluciones_financiero_certificacion_id_fkey" FOREIGN KEY ("certificacion_id") REFERENCES "certificaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'devoluciones_financiero_usuario_id_fkey') THEN
    ALTER TABLE "devoluciones_financiero" ADD CONSTRAINT "devoluciones_financiero_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
