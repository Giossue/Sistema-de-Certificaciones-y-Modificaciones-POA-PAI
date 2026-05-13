import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { env } from "../config/env";

async function main() {
  if (!env.BACKUP_ENABLED) {
    console.log("BACKUP_ENABLED=false; respaldo omitido.");
    return;
  }

  await mkdir(env.BACKUP_PATH, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const output = join(env.BACKUP_PATH, `poa-pai-${stamp}.dump`);
  const proc = Bun.spawn(["pg_dump", env.DATABASE_URL, "-Fc", "-f", output], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);

  if (stdout.trim()) console.log(stdout.trim());
  if (code !== 0) {
    console.error(stderr.trim() || "pg_dump falló");
    process.exit(code);
  }
  console.log(`Respaldo PostgreSQL creado: ${output}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
