import { PrismaClient } from "@prisma/client";
import { NotFoundError } from "../../../../common/errors/http-error.map";

export async function descargarDocumentoCertificacion(prisma: PrismaClient, id: string, documentoId: string) {
  const documento = await prisma.documentoHabilitante.findFirst({
    where: { id: documentoId, certificacionId: id },
  });
  if (!documento) throw new NotFoundError("Documento", documentoId);
  const file = Bun.file(documento.ruta);
  if (!(await file.exists())) throw new NotFoundError("Archivo", documentoId);
  return {
    body: await file.arrayBuffer(),
    headers: {
      "Content-Type": documento.mimeType,
      "Content-Disposition": `attachment; filename="${documento.nombreOriginal}"`,
    },
  };
}
