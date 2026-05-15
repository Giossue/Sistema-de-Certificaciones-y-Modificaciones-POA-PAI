#!/bin/sh
set -e

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  bunx prisma migrate deploy --schema apps/api/prisma/schema.prisma
fi

bun run --cwd apps/api start &
API_PID=$!

trap 'kill "$API_PID" 2>/dev/null || true' INT TERM

nginx -g "daemon off;"
