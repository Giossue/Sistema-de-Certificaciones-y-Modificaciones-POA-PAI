CREATE TABLE IF NOT EXISTS "correlativos" (
  "tipo" TEXT NOT NULL,
  "anio" INTEGER NOT NULL,
  "ultimo_numero" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "correlativos_pkey" PRIMARY KEY ("tipo", "anio")
);

INSERT INTO "correlativos" ("tipo", "anio", "ultimo_numero")
SELECT
  'MOD' AS "tipo",
  p."anio",
  COALESCE(MAX(split_part(m."numero", '-', 3)::INTEGER), 0) AS "ultimo_numero"
FROM "modificaciones_poa" m
JOIN "periodos_fiscales" p ON p."id" = m."periodo_fiscal_id"
WHERE m."numero" ~ ('^MOD-' || p."anio" || '-[0-9]+$')
GROUP BY p."anio"
ON CONFLICT ("tipo", "anio") DO UPDATE
SET
  "ultimo_numero" = GREATEST("correlativos"."ultimo_numero", EXCLUDED."ultimo_numero"),
  "updated_at" = CURRENT_TIMESTAMP;
