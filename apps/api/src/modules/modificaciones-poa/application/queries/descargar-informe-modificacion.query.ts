import { PrismaClient } from "@prisma/client";
import { NotFoundError } from "../../../../common/errors/http-error.map";

export async function descargarInformeModificacion(prisma: PrismaClient, id: string) {
  const mod = await prisma.modificacionPoa.findUnique({ where: { id } });
  if (!mod?.informeRuta) throw new NotFoundError("Informe técnico", id);
  const file = Bun.file(mod.informeRuta);
  if (!(await file.exists())) throw new NotFoundError("Archivo", id);
  return {
    body: await file.arrayBuffer(),
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="informe-${mod.numero}.pdf"`,
    },
  };
}
