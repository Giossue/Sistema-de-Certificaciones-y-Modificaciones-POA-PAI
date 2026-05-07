FROM oven/bun:1.3-alpine AS builder

WORKDIR /app

COPY package.json bun.lockb* ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/

RUN bun install --frozen-lockfile || bun install

COPY . .

RUN bun run --cwd apps/web build

FROM nginx:alpine AS runner

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
