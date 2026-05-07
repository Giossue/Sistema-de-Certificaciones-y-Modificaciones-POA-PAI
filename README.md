# Sistema de Certificaciones y Modificaciones POA/PAI

## Stack

- **Runtime**: Bun
- **Frontend**: React + Vite + HeroUI + Tailwind CSS v4
- **Backend**: Bun + Hono + TypeScript
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Validation**: Zod
- **Monorepo**: Bun workspaces

## Quick Start

```bash
# 1. Instalar dependencias
bun install

# 2. Levantar base de datos
docker-compose up -d db

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con valores locales

# 4. Migrar base de datos
bun run db:migrate

# 5. Seed inicial (opcional)
bun run db:seed

# 6. Levantar dev servers
bun run dev
```

## Estructura

```
├── apps/
│   ├── api/         # Backend Hono
│   └── web/         # Frontend React + Vite
├── packages/
│   ├── shared/      # Tipos, enums, utilidades
│   └── ui/          # Componentes compartidos HeroUI
├── docker/
│   ├── api.Dockerfile
│   └── web.Dockerfile
└── docker-compose.yml
```
