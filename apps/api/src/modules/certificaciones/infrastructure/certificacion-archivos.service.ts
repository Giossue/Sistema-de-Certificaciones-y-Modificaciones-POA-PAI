import { createHash } from "node:crypto";
import { ValidationError } from "../../../common/errors/http-error.map";
import { env } from "../../../config/env";
import { allowedUploadTypes } from "./constants/certificacion-archivos.constants";

export function hashFile(path: string): Promise<string> {
  return Bun.file(path).arrayBuffer().then((buffer) => createHash("sha256").update(Buffer.from(buffer)).digest("hex"));
}

export function validarArchivo(archivo: File) {
  const maxBytes = env.UPLOAD_MAX_SIZE_MB * 1024 * 1024;
  if (archivo.size <= 0) throw new ValidationError(`El archivo ${archivo.name} está vacío`);
  if (archivo.size > maxBytes) throw new ValidationError(`El archivo ${archivo.name} supera ${env.UPLOAD_MAX_SIZE_MB}MB`);
  if (archivo.type && !allowedUploadTypes.has(archivo.type)) {
    throw new ValidationError(`Tipo de archivo no permitido: ${archivo.type}`);
  }
}
