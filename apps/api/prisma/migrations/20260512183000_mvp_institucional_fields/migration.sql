ALTER TABLE "actividades_poa"
  ADD COLUMN IF NOT EXISTS "responsable_usuario_id" UUID,
  ADD COLUMN IF NOT EXISTS "responsable_nombre" TEXT;

ALTER TABLE "certificaciones"
  ADD COLUMN IF NOT EXISTS "tipo" TEXT NOT NULL DEFAULT 'POA',
  ADD COLUMN IF NOT EXISTS "unidad_requirente_id" UUID,
  ADD COLUMN IF NOT EXISTS "poa_version_id" UUID,
  ADD COLUMN IF NOT EXISTS "fecha_solicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "fecha_suscripcion" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "fecha_uso" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "devuelta_por_financiero" BOOLEAN NOT NULL DEFAULT false;

UPDATE "certificaciones" c
SET "poa_version_id" = a."poa_version_id",
    "unidad_requirente_id" = COALESCE(a."unidad_id", c."solicitante_id")
FROM "actividades_poa" a
WHERE c."actividad_id" = a."id"
  AND (c."poa_version_id" IS NULL OR c."unidad_requirente_id" IS NULL);

CREATE INDEX IF NOT EXISTS "certificaciones_tipo_numero_idx" ON "certificaciones"("tipo", "numero");
CREATE INDEX IF NOT EXISTS "certificaciones_unidad_requirente_id_estado_idx" ON "certificaciones"("unidad_requirente_id", "estado");

ALTER TABLE "modificaciones_poa"
  ADD COLUMN IF NOT EXISTS "observacion_bienes" TEXT,
  ADD COLUMN IF NOT EXISTS "tipo_discrepancia" TEXT,
  ADD COLUMN IF NOT EXISTS "responsable_anterior_id" UUID,
  ADD COLUMN IF NOT EXISTS "responsable_anterior_nombre" TEXT,
  ADD COLUMN IF NOT EXISTS "responsable_nuevo_id" UUID,
  ADD COLUMN IF NOT EXISTS "responsable_nuevo_nombre" TEXT;

ALTER TABLE "liquidaciones_certificacion"
  ADD COLUMN IF NOT EXISTS "aprobada_por_id" UUID,
  ADD COLUMN IF NOT EXISTS "estado" TEXT NOT NULL DEFAULT 'solicitada',
  ADD COLUMN IF NOT EXISTS "motivo_rechazo" TEXT,
  ADD COLUMN IF NOT EXISTS "approved_at" TIMESTAMP(3);

UPDATE "liquidaciones_certificacion"
SET "estado" = 'aprobada',
    "approved_at" = COALESCE("approved_at", "created_at")
WHERE "approved_at" IS NULL;

ALTER TABLE "anulaciones_certificacion"
  ADD COLUMN IF NOT EXISTS "aprobada_por_id" UUID,
  ADD COLUMN IF NOT EXISTS "estado" TEXT NOT NULL DEFAULT 'solicitada',
  ADD COLUMN IF NOT EXISTS "motivo_rechazo" TEXT,
  ADD COLUMN IF NOT EXISTS "approved_at" TIMESTAMP(3);

UPDATE "anulaciones_certificacion"
SET "estado" = 'aprobada',
    "approved_at" = COALESCE("approved_at", "created_at")
WHERE "approved_at" IS NULL;

ALTER TABLE "devoluciones_financiero"
  ADD COLUMN IF NOT EXISTS "clasificacion" TEXT,
  ADD COLUMN IF NOT EXISTS "estado_correccion" TEXT NOT NULL DEFAULT 'pendiente',
  ADD COLUMN IF NOT EXISTS "reenviada_en" TIMESTAMP(3);

ALTER TABLE "documentos_habilitantes"
  ADD COLUMN IF NOT EXISTS "plantilla" TEXT,
  ADD COLUMN IF NOT EXISTS "version_plantilla" TEXT,
  ADD COLUMN IF NOT EXISTS "entidad_origen" TEXT,
  ADD COLUMN IF NOT EXISTS "entidad_origen_id" TEXT,
  ADD COLUMN IF NOT EXISTS "hash_documento" TEXT;

ALTER TABLE "auditoria"
  ADD COLUMN IF NOT EXISTS "rol" TEXT,
  ADD COLUMN IF NOT EXISTS "payload_anterior" JSONB,
  ADD COLUMN IF NOT EXISTS "payload_nuevo" JSONB,
  ADD COLUMN IF NOT EXISTS "ip" TEXT,
  ADD COLUMN IF NOT EXISTS "user_agent" TEXT;
