# Variables de entorno sugeridas

```txt
NODE_ENV=development
APP_NAME=sistema-poa-pai
APP_URL=http://localhost:3000
API_URL=http://localhost:4000

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/poa_pai

JWT_SECRET=change-me
JWT_EXPIRES_IN=8h

UPLOAD_MAX_SIZE_MB=20
UPLOAD_STORAGE_PATH=./storage/uploads
GENERATED_STORAGE_PATH=./storage/generated

PDF_TEMPLATE_PATH=./packages/pdf-templates

BACKUP_ENABLED=true
BACKUP_CRON=0 2 * * *
BACKUP_PATH=./backups

CEDULA_MEF_REMINDER_ENABLED=true
CEDULA_MEF_REMINDER_CRON=0 8 * * 1-5

LOG_LEVEL=info
```

## Comandos Bun

```bash
bun install
bun run dev
bun run build
bun test
```

## Estructura de archivos esperada

El monorepo usa Bun workspaces configurados en:

```txt
bunfig.toml
package.json
```

## Paquetes compartidos

El paquete `packages/ui/` contiene componentes reutilizables basados en HeroUI, no un sistema UI propio desde cero.
