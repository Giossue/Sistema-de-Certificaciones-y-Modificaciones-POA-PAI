FROM oven/bun:1.3-alpine AS builder

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/ui/package.json ./packages/ui/package.json

RUN bun install --frozen-lockfile

COPY apps ./apps
COPY packages ./packages
COPY eslint.config.mjs ./eslint.config.mjs

ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=${VITE_API_URL}

RUN bun run --cwd apps/api prisma generate
RUN bun run --cwd apps/web build
RUN bun run --cwd apps/api build

FROM oven/bun:1.3-alpine AS runner

RUN apk add --no-cache nginx

WORKDIR /app

ENV NODE_ENV=production
ENV API_HOST=0.0.0.0
ENV API_PORT=3001
ENV UPLOAD_DIR=/app/storage/uploads
ENV GENERATED_DIR=/app/storage/generated
ENV RUN_MIGRATIONS=true

COPY --from=builder /app ./
COPY docker/dokploy-nginx.conf /etc/nginx/http.d/default.conf
COPY docker/dokploy-entrypoint.sh /usr/local/bin/dokploy-entrypoint

RUN chmod +x /usr/local/bin/dokploy-entrypoint \
  && mkdir -p /run/nginx /app/storage/uploads /app/storage/generated

EXPOSE 80

CMD ["dokploy-entrypoint"]
