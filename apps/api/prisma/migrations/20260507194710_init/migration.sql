-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('admin', 'director', 'analista', 'unidad');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'unidad',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periodos_fiscales" (
    "id" UUID NOT NULL,
    "anio" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "periodos_fiscales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cedula_mef_versions" (
    "id" UUID NOT NULL,
    "corte_fecha" TIMESTAMP(3) NOT NULL,
    "vigente" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cedula_mef_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cedula_entradas" (
    "id" UUID NOT NULL,
    "version_id" UUID NOT NULL,
    "programa" TEXT NOT NULL,
    "actividad" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "fuente" TEXT NOT NULL,
    "monto_asignado" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "cedula_entradas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poa_versions" (
    "id" UUID NOT NULL,
    "periodo_fiscal_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "vigente" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poa_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actividades_presupuestarias" (
    "id" UUID NOT NULL,
    "poa_version_id" UUID NOT NULL,
    "periodo_fiscal_id" UUID NOT NULL,
    "unidad_id" UUID,
    "programa" TEXT NOT NULL,
    "actividad" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "fuente" TEXT NOT NULL,
    "monto_asignado" DECIMAL(18,2) NOT NULL,
    "saldo_disponible" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "actividades_presupuestarias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificaciones" (
    "id" UUID NOT NULL,
    "numero" TEXT,
    "actividad_id" UUID NOT NULL,
    "solicitante_id" UUID NOT NULL,
    "analista_id" UUID,
    "director_id" UUID,
    "monto" DECIMAL(18,2) NOT NULL,
    "con_iva" BOOLEAN NOT NULL DEFAULT false,
    "estado" TEXT NOT NULL,
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_habilitantes" (
    "id" UUID NOT NULL,
    "certificacion_id" UUID NOT NULL,
    "tipo" TEXT NOT NULL,
    "ruta" TEXT NOT NULL,
    "nombre_original" TEXT NOT NULL,
    "tamano" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documentos_habilitantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidad_id" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "estado_anterior" TEXT,
    "estado_nuevo" TEXT,
    "motivo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo_programas" (
    "id" UUID NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalogo_programas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo_actividades" (
    "id" UUID NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "programa_codigo" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalogo_actividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo_items" (
    "id" UUID NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalogo_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo_fuentes" (
    "id" UUID NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalogo_fuentes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "periodos_fiscales_anio_key" ON "periodos_fiscales"("anio");

-- CreateIndex
CREATE INDEX "cedula_mef_versions_corte_fecha_idx" ON "cedula_mef_versions"("corte_fecha" DESC);

-- CreateIndex
CREATE INDEX "cedula_entradas_programa_actividad_item_fuente_idx" ON "cedula_entradas"("programa", "actividad", "item", "fuente");

-- CreateIndex
CREATE INDEX "actividades_presupuestarias_unidad_id_poa_version_id_idx" ON "actividades_presupuestarias"("unidad_id", "poa_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificaciones_numero_key" ON "certificaciones"("numero");

-- CreateIndex
CREATE INDEX "certificaciones_actividad_id_estado_idx" ON "certificaciones"("actividad_id", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_programas_codigo_key" ON "catalogo_programas"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_actividades_codigo_key" ON "catalogo_actividades"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_items_codigo_key" ON "catalogo_items"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_fuentes_codigo_key" ON "catalogo_fuentes"("codigo");

-- AddForeignKey
ALTER TABLE "cedula_entradas" ADD CONSTRAINT "cedula_entradas_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "cedula_mef_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poa_versions" ADD CONSTRAINT "poa_versions_periodo_fiscal_id_fkey" FOREIGN KEY ("periodo_fiscal_id") REFERENCES "periodos_fiscales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades_presupuestarias" ADD CONSTRAINT "actividades_presupuestarias_poa_version_id_fkey" FOREIGN KEY ("poa_version_id") REFERENCES "poa_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades_presupuestarias" ADD CONSTRAINT "actividades_presupuestarias_periodo_fiscal_id_fkey" FOREIGN KEY ("periodo_fiscal_id") REFERENCES "periodos_fiscales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades_presupuestarias" ADD CONSTRAINT "actividades_presupuestarias_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificaciones" ADD CONSTRAINT "certificaciones_actividad_id_fkey" FOREIGN KEY ("actividad_id") REFERENCES "actividades_presupuestarias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificaciones" ADD CONSTRAINT "certificaciones_solicitante_id_fkey" FOREIGN KEY ("solicitante_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificaciones" ADD CONSTRAINT "certificaciones_analista_id_fkey" FOREIGN KEY ("analista_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificaciones" ADD CONSTRAINT "certificaciones_director_id_fkey" FOREIGN KEY ("director_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_habilitantes" ADD CONSTRAINT "documentos_habilitantes_certificacion_id_fkey" FOREIGN KEY ("certificacion_id") REFERENCES "certificaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
