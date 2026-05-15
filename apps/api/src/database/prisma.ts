import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  __poaPrisma?: PrismaClient;
};

export const prisma = globalForPrisma.__poaPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__poaPrisma = prisma;
}
