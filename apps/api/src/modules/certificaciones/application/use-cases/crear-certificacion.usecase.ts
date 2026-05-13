import { PrismaClient } from "@prisma/client";
import { CertificacionEntity, CertificacionEstado } from "../../domain/entities/certificacion.entity";
import { ValidationError } from "../../../../common/errors/http-error.map";
import { decimalToCentavos } from "../../../saldos/domain/saldo-calculator";
import { SaldosMotorService } from "../../../saldos/application/use-cases/saldos-motor.service";

interface CrearCertificacionDto {
  tipo: string;
  periodoFiscalId: string;
  programaCodigo: string;
  actividadCodigo: string;
  itemCodigo: string;
  fuenteCodigo: string;
  monto: string;
  conIva: boolean;
  solicitanteId: string;
}

export class CrearCertificacionUseCase {
  private readonly saldosMotor: SaldosMotorService;

  constructor(private readonly prisma: PrismaClient) {
    this.saldosMotor = new SaldosMotorService(prisma);
  }

  async execute(dto: CrearCertificacionDto): Promise<CertificacionEntity> {
    const tipo = String(dto.tipo || "").toUpperCase();
    if (!["POA", "PAI"].includes(tipo)) {
      throw new ValidationError("tipo debe ser POA o PAI");
    }

    const montoDecimal = this.normalizarMonto(dto.monto);
    if (!montoDecimal || decimalToCentavos(montoDecimal) <= 0n) {
      throw new ValidationError("monto debe ser mayor a 0");
    }

    // 1. Obtener versión POA vigente para el periodo
    const poaVersion = await this.prisma.poaVersion.findFirst({
      where: { periodoFiscalId: dto.periodoFiscalId, vigente: true },
    });
    if (!poaVersion) throw new ValidationError("No existe versión POA vigente para este periodo fiscal");

    // 2. Buscar la actividad en el POA por los códigos
    const actividad = await this.prisma.actividadesPoa.findFirst({
      where: {
        poaVersionId: poaVersion.id,
        programaCodigo: dto.programaCodigo,
        actividadCodigo: dto.actividadCodigo,
        itemCodigo: dto.itemCodigo,
        fuenteCodigo: dto.fuenteCodigo,
      },
    });
    if (!actividad) throw new ValidationError("Actividad no encontrada en el POA vigente");

    // 3. Obtener cédula MEF vigente para el periodo
    const cedulaVersion = await this.prisma.cedulaMefVersion.findFirst({
      where: { periodoFiscalId: dto.periodoFiscalId, vigente: true },
    });
    if (!cedulaVersion) {
      throw new ValidationError("No existe cédula MEF vigente para validar la solicitud");
    }

    // 4. Validar que la combinación exista en cédula MEF vigente (RN-04)
    const existeEnCedula = await this.prisma.cedulaMefEntrada.findFirst({
      where: {
        versionId: cedulaVersion.id,
        programaCodigo: actividad.programaCodigo,
        actividadCodigo: actividad.actividadCodigo,
        itemCodigo: actividad.itemCodigo,
        fuenteCodigo: actividad.fuenteCodigo,
      },
    });
    if (!existeEnCedula) {
      throw new ValidationError("La combinación programa+actividad+ítem+fuente no existe en la cédula MEF vigente");
    }

    // 5. Validar saldo suficiente (RN-05)
    await this.saldosMotor.validarDisponible(actividad.id, montoDecimal);

    // 6. Validar que no exista certificación vigente sin liquidar (RN-02)
    const estadosActivos: CertificacionEstado[] = ["solicitada", "observada", "generada", "suscrita", "en_uso"];
    const certificacionExistente = await this.prisma.certificacion.findFirst({
      where: {
        actividadId: actividad.id,
        estado: { in: estadosActivos },
      },
    });
    if (certificacionExistente) {
      throw new ValidationError("Ya existe una certificación vigente para esta actividad sin liquidar");
    }

    // 7. Crear la certificación en estado solicitada
    const cert = await this.prisma.certificacion.create({
      data: {
        tipo,
        actividadId: actividad.id,
        unidadRequirenteId: actividad.unidadId || dto.solicitanteId,
        poaVersionId: actividad.poaVersionId,
        solicitanteId: dto.solicitanteId,
        monto: montoDecimal,
        conIva: dto.conIva,
        estado: "solicitada",
        cedulaVersionId: cedulaVersion.id,
      },
    });

    return {
      id: cert.id,
      tipo: cert.tipo,
      numero: cert.numero,
      actividadId: cert.actividadId,
      unidadRequirenteId: cert.unidadRequirenteId,
      poaVersionId: cert.poaVersionId,
      solicitanteId: cert.solicitanteId,
      analistaId: cert.analistaId,
      directorId: cert.directorId,
      monto: Number(cert.monto),
      conIva: cert.conIva,
      estado: cert.estado as CertificacionEstado,
      observaciones: cert.observaciones,
      cedulaVersionId: cert.cedulaVersionId,
      fechaSolicitud: cert.fechaSolicitud,
      fechaSuscripcion: cert.fechaSuscripcion,
      fechaUso: cert.fechaUso,
      devueltaPorFinanciero: cert.devueltaPorFinanciero,
      createdAt: cert.createdAt,
      updatedAt: cert.updatedAt,
    };
  }

  private normalizarMonto(value: string): string | null {
    const raw = String(value ?? "").trim();
    if (!/^\d+(\.\d{1,2})?$/.test(raw)) return null;
    const [integerPart, decimalPart = ""] = raw.split(".");
    return `${integerPart}.${decimalPart.padEnd(2, "0")}`;
  }
}
