# Deploy en Dokploy

Este proyecto puede desplegarse en Dokploy sin enlazar la cuenta de GitHub.

## Recomendacion

Usar el provider **Git**, no **Github**.

- Si el repositorio es publico: pegar la URL HTTPS del repo.
- Si el repositorio es privado: usar una deploy key SSH de solo lectura, o publicar una imagen Docker y usar el provider Docker.

La opcion mas simple para este proyecto es:

- Provider: `Git`
- Repository URL: URL HTTPS o SSH del repo
- Branch: `main`
- Build Type: `Dockerfile`
- Dockerfile Path: `Dockerfile`
- Exposed Port: `80`
- Volume persistente: `/app/storage`

## Arquitectura del contenedor

El `Dockerfile` raiz construye frontend y backend en una sola imagen:

- Nginx sirve `apps/web/dist`.
- Nginx proxyea `/api/*` hacia el API Bun en `127.0.0.1:3001`.
- El API guarda uploads y documentos generados en `/app/storage`.
- Al iniciar, ejecuta `prisma migrate deploy` si `RUN_MIGRATIONS=true`.

## Variables de entorno

Configurar en Dokploy:

```env
NODE_ENV=production
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB?schema=public
JWT_SECRET=poner-un-secreto-largo-minimo-32-caracteres
JWT_EXPIRES_IN=8h
API_HOST=0.0.0.0
API_PORT=3001
CORS_ORIGINS=https://tu-dominio.com
UPLOAD_DIR=/app/storage/uploads
GENERATED_DIR=/app/storage/generated
RUN_MIGRATIONS=true
```

Si usas la app con frontend y API en el mismo dominio por Nginx, el frontend llama a `/api/v1` y no necesita `VITE_API_URL`.

## Base de datos

Crear PostgreSQL como servicio separado en Dokploy o usar una base externa.

Recomendado:

- PostgreSQL 15+
- volumen persistente para la base
- backups programados
- usuario y password distintos a los de desarrollo

## Storage

Montar un volumen persistente en:

```text
/app/storage
```

No usar storage efimero para produccion: los PDFs y adjuntos dependen de las rutas guardadas en la base de datos.

## Sin enlazar GitHub

Opciones de despliegue sin OAuth de GitHub:

1. Repo publico + provider `Git` con URL HTTPS.
2. Repo privado + provider `Git` con URL SSH y deploy key read-only.
3. Build fuera de Dokploy + push a registry + provider `Docker`.

Para tu caso, recomiendo opcion 1 si el repo puede ser publico; opcion 2 si debe quedar privado.
