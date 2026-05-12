import { PrismaClient } from "@prisma/client";
import { PoaRepository, CrearPoaVersionDto, ImportarDesdeCedulaDto } from "../../domain/repositories/poa.repository";
import { PoaRepositoryImpl } from "../../infrastructure/persistence/poa.repository.impl";
import { ImportarPoaBaseUseCase, ImportarPoaBaseDto } from "./importar-poa-base.usecase";

export class CrearPoaVersionUseCase {
  private repo: PoaRepository;

  constructor(private readonly prisma: PrismaClient) {
    this.repo = new PoaRepositoryImpl(prisma);
  }

  async execute(dto: CrearPoaVersionDto) {
    return this.repo.crearVersion(dto);
  }
}

export class ConsultarPoaVigenteUseCase {
  private repo: PoaRepository;

  constructor(private readonly prisma: PrismaClient) {
    this.repo = new PoaRepositoryImpl(prisma);
  }

  async execute(periodoFiscalId: string) {
    return this.repo.consultarVigente(periodoFiscalId);
  }
}

export class ImportarDesdeCedulaUseCase {
  private repo: PoaRepository;

  constructor(private readonly prisma: PrismaClient) {
    this.repo = new PoaRepositoryImpl(prisma);
  }

  async execute(dto: ImportarDesdeCedulaDto, createdBy: string) {
    // Verificar que la versión de cédula existe y está vigente
    const cedulaVersion = await this.prisma.cedulaMefVersion.findUnique({
      where: { id: dto.cedulaVersionId },
    });

    if (!cedulaVersion) {
      throw new Error("Versión de cédula MEF no encontrada");
    }

    if (!cedulaVersion.vigente) {
      throw new Error("La versión de cédula MEF no está vigente");
    }

    // Verificar que no exista ya un POA para este periodo
    const poaExistente = await this.repo.consultarVigente(cedulaVersion.periodoFiscalId!);
    if (poaExistente) {
      throw new Error("Ya existe un POA vigente para este periodo fiscal");
    }

    // Crear nueva versión de POA
    const poaVersion = await this.repo.crearVersion({
      periodoFiscalId: cedulaVersion.periodoFiscalId!,
      createdBy,
    });

    // Obtener entradas de la cédula MEF
    const entradas = await this.prisma.cedulaMefEntrada.findMany({
      where: { versionId: dto.cedulaVersionId },
    });

    // Importar actividades desde la cédula
    const actividades = entradas.map((e) => ({
      programaCodigo: e.programaCodigo,
      programaNombre: e.programaNombre,
      actividadCodigo: e.actividadCodigo,
      actividadNombre: e.actividadNombre,
      itemCodigo: e.itemCodigo,
      itemNombre: e.itemNombre,
      fuenteCodigo: e.fuenteCodigo,
      fuenteNombre: e.fuenteNombre,
      montoPlanificado: Number(e.montoCodificado),
    }));

    await this.repo.agregarActividades(poaVersion.id, actividades);

    // Retornar versión completa con actividades
    return this.repo.getById(poaVersion.id);
  }
}

export class ListarActividadesPoaUseCase {
  private repo: PoaRepository;

  constructor(private readonly prisma: PrismaClient) {
    this.repo = new PoaRepositoryImpl(prisma);
  }

  async execute(versionId: string) {
    return this.repo.getActividades(versionId);
  }
}

export class ConsultarPoaPorIdUseCase {
  private repo: PoaRepository;

  constructor(private readonly prisma: PrismaClient) {
    this.repo = new PoaRepositoryImpl(prisma);
  }

  async execute(id: string) {
    return this.repo.getById(id);
  }
}

export { ImportarPoaBaseUseCase } from "./importar-poa-base.usecase";
export {
  ListarProgramasPoaUseCase,
  ListarActividadesPorProgramaPoaUseCase,
  ListarItemsPoaUseCase,
  ListarFuentesPoaUseCase,
  ConsultarSaldoActividadUseCase,
} from "./listar-catalogos-poa.usecase";