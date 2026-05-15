# Politica de storage

`apps/api/storage` contiene archivos de runtime. No debe versionarse en git,
salvo los `.gitkeep` que conservan la estructura base.

## Carpetas

- `storage/uploads/certificaciones/<certificacionId>/`: adjuntos subidos por usuarios.
- `storage/generated/certificaciones/<certificacionId>/`: PDFs generados para certificaciones y memorandos.
- `storage/generated/modificaciones-poa/<modificacionId>/`: informes tecnicos generados para modificaciones POA.

## Reglas de versionado

- No subir a git archivos dentro de `apps/api/storage/**`.
- No guardar archivos fuente, plantillas ni codigo dentro de `storage`.
- Las plantillas deben permanecer en `apps/api/src/**/templates`.
- Solo se versionan `.gitkeep` para que existan `storage`, `storage/uploads` y `storage/generated`.

## Limpieza segura

Antes de eliminar archivos, cruzar rutas fisicas contra la base de datos:

- `DocumentoHabilitante.ruta`
- `ModificacionPoa.informeRuta`

Solo se puede eliminar un archivo si no esta referenciado por esas columnas, o si
primero se eliminaron de forma controlada el registro funcional, auditorias y
documentos asociados.

Para datos de prueba:

1. Registrar IDs creados durante la prueba.
2. Eliminar auditorias y registros funcionales asociados.
3. Eliminar documentos en BD.
4. Eliminar archivos fisicos y carpetas vacias.
5. Restaurar POA/cedula vigentes y correlativos si la prueba los altero.

## Produccion

En produccion, `storage` debe vivir en almacenamiento persistente y respaldado:

- volumen persistente del servidor o contenedor;
- backup periodico junto con la base de datos;
- restauracion validada para que las rutas guardadas sigan resolviendo.

Recomendacion futura: mover documentos a S3, MinIO o un disco persistente
administrado, guardando en BD la clave del objeto y metadatos de integridad.
