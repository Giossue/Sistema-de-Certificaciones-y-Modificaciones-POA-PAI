import { PrismaClient } from "@prisma/client";
import { PoaRepository, CrearPoaVersionDto, ActividadPoaEntity } from "../../domain/repositories/poa.repository";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function esUuidValido(str: string): boolean {
  return UUID_REGEX.test(str);
}

export class PoaRepositoryImpl implements PoaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async crearVersion(dto: CrearPoaVersionDto): Promise<any> {
    if (!esUuidValido(dto.periodoFiscalId)) throw new Error("periodoFiscalId inválido");
    // Marcar vigentes anteriores como no vigentes
    await this.prisma.poaVersion.updateMany({
      where: { periodoFiscalId: dto.periodoFiscalId, vigente: true },
      data: { vigente: false },
    });

    // Obtener siguiente número de versión
    const ultimaVersion = await this.prisma.poaVersion.findFirst({
      where: { periodoFiscalId: dto.periodoFiscalId },
      orderBy: { numeroVersion: "desc" },
    });

    const siguienteVersion = (ultimaVersion?.numeroVersion ?? 0) + 1;

    const poaVersion = await this.prisma.poaVersion.create({
      data: {
        periodoFiscalId: dto.periodoFiscalId,
        numeroVersion: siguienteVersion,
        estado: "borrador",
        vigente: true,
        createdBy: dto.createdBy,
      },
    });

    // Si hay actividades, crearlas
    if (dto.actividades && dto.actividades.length > 0) {
      await this.prisma.actividadesPoa.createMany({
        data: dto.actividades.map((a) => ({
          poaVersionId: poaVersion.id,
          unidadId: a.unidadId,
          programaCodigo: a.programaCodigo,
          programaNombre: a.programaNombre,
          actividadCodigo: a.actividadCodigo,
          actividadNombre: a.actividadNombre,
          itemCodigo: a.itemCodigo,
          itemNombre: a.itemNombre,
          fuenteCodigo: a.fuenteCodigo,
          fuenteNombre: a.fuenteNombre,
          montoPlanificado: a.montoPlanificado,
          saldoDisponible: a.montoPlanificado,
        })),
      });
    }

    return this.getById(poaVersion.id);
  }

  async consultarVigente(periodoFiscalId: string): Promise<any> {
    if (!esUuidValido(periodoFiscalId)) return null;
    const version = await this.prisma.poaVersion.findFirst({
      where: { periodoFiscalId, vigente: true },
    });
    if (!version) return null;
    const [totalActividades, total] = await Promise.all([
      this.prisma.actividadesPoa.count({ where: { poaVersionId: version.id } }),
      this.prisma.actividadesPoa.aggregate({
        where: { poaVersionId: version.id },
        _sum: { montoPlanificado: true },
      }),
    ]);
    return {
      ...version,
      totalActividades,
      montoTotal: Number(total._sum.montoPlanificado || 0),
      actividades: [],
    };
  }

  async getById(id: string): Promise<any> {
    if (!esUuidValido(id)) return null;
    const version = await this.prisma.poaVersion.findUnique({
      where: { id },
      include: { actividades: true },
    });
    if (!version) return null;
    return {
      ...version,
      actividades: version.actividades.map((a) => ({
        id: a.id,
        poaVersionId: a.poaVersionId,
        unidadId: a.unidadId,
        programaCodigo: a.programaCodigo,
        programaNombre: a.programaNombre,
        actividadCodigo: a.actividadCodigo,
        actividadNombre: a.actividadNombre,
        itemCodigo: a.itemCodigo,
        itemNombre: a.itemNombre,
        fuenteCodigo: a.fuenteCodigo,
        fuenteNombre: a.fuenteNombre,
        montoPlanificado: Number(a.montoPlanificado),
        saldoDisponible: Number(a.saldoDisponible),
        createdAt: a.createdAt,
      })),
    };
  }

  async marcarNoVigente(periodoFiscalId: string): Promise<void> {
    if (!esUuidValido(periodoFiscalId)) return;
    await this.prisma.poaVersion.updateMany({
      where: { periodoFiscalId, vigente: true },
      data: { vigente: false },
    });
  }

  async agregarActividades(versionId: string, actividades: any[]): Promise<ActividadPoaEntity[]> {
    if (!esUuidValido(versionId)) return [];
    const created = await this.prisma.actividadesPoa.createMany({
      data: actividades.map((a) => ({
        poaVersionId: versionId,
        unidadId: a.unidadId,
        programaCodigo: a.programaCodigo,
        programaNombre: a.programaNombre,
        actividadCodigo: a.actividadCodigo,
        actividadNombre: a.actividadNombre,
        itemCodigo: a.itemCodigo,
        itemNombre: a.itemNombre,
        fuenteCodigo: a.fuenteCodigo,
        fuenteNombre: a.fuenteNombre,
        montoPlanificado: a.montoPlanificado,
        saldoDisponible: a.montoPlanificado,
      })),
    });

    const actividadesCreadas = await this.prisma.actividadesPoa.findMany({
      where: { poaVersionId: versionId },
      orderBy: { createdAt: "desc" },
      take: created.count,
    });

    return actividadesCreadas.map((a) => ({
      id: a.id,
      poaVersionId: a.poaVersionId,
      unidadId: a.unidadId,
      programaCodigo: a.programaCodigo,
      programaNombre: a.programaNombre,
      actividadCodigo: a.actividadCodigo,
      actividadNombre: a.actividadNombre,
      itemCodigo: a.itemCodigo,
      itemNombre: a.itemNombre,
      fuenteCodigo: a.fuenteCodigo,
      fuenteNombre: a.fuenteNombre,
      montoPlanificado: Number(a.montoPlanificado),
      saldoDisponible: Number(a.saldoDisponible),
      createdAt: a.createdAt,
    }));
  }

  async getActividades(versionId: string): Promise<ActividadPoaEntity[]> {
    if (!esUuidValido(versionId)) return [];
    const actividades = await this.prisma.actividadesPoa.findMany({
      where: { poaVersionId: versionId },
    });
    return actividades.map((a) => ({
      id: a.id,
      poaVersionId: a.poaVersionId,
      unidadId: a.unidadId,
      programaCodigo: a.programaCodigo,
      programaNombre: a.programaNombre,
      actividadCodigo: a.actividadCodigo,
      actividadNombre: a.actividadNombre,
      itemCodigo: a.itemCodigo,
      itemNombre: a.itemNombre,
      fuenteCodigo: a.fuenteCodigo,
      fuenteNombre: a.fuenteNombre,
      montoPlanificado: Number(a.montoPlanificado),
      saldoDisponible: Number(a.saldoDisponible),
      createdAt: a.createdAt,
    }));
  }
}
