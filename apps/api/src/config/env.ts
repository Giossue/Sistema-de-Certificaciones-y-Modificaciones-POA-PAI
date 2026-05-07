import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, "JWT_SECRET debe tener al menos 32 caracteres"),
  JWT_EXPIRES_IN: z.string().default("8h"),
  API_PORT: z.string().default("3001"),
  API_HOST: z.string().default("0.0.0.0"),
  UPLOAD_DIR: z.string().default("./storage/uploads"),
  GENERATED_DIR: z.string().default("./storage/generated"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Variables de entorno inválidas:\n${issues}`);
  }
  return parsed.data;
}

export const env = loadEnv();
