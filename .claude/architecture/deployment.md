# Despliegue

## Estrategia recomendada

Despliegue con Docker Compose para la primera versión.

Servicios mínimos:

- web
- api
- postgres
- reverse-proxy opcional

## Ambientes

- local
- staging
- production

## Variables de entorno base

Ver `.claude/reference/env.md`.

## Persistencia

La base de datos PostgreSQL debe tener volumen persistente.

Los archivos cargados y PDFs generados deben almacenarse en volumen persistente o storage institucional.

## Backups

Debe configurarse respaldo automático diario de PostgreSQL.

## Migraciones

Toda modificación de base de datos debe pasar por migración versionada.

## Seguridad mínima

- HTTPS en producción.
- Contraseñas hasheadas.
- JWT o sesión segura.
- Validación de permisos en backend.
- Tamaño máximo de archivos.
- Validación de extensión y MIME type.
- Logs sin datos sensibles.
