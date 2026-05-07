FROM oven/bun:1.3-alpine AS builder

WORKDIR /app

COPY package.json bun.lockb* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/

RUN bun install --frozen-lockfile || bun install

COPY . .

RUN bun run --cwd apps/api prisma generate

EXPOSE 3001

CMD ["bun", "run", "--cwd", "apps/api", "start"]
