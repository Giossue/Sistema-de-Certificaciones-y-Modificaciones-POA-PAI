export enum RolUsuario {
  ADMIN = "admin",
  DIRECTOR = "director",
  ANALISTA = "analista",
  UNIDAD = "unidad",
}

export enum EstadoCertificacion {
  BORRADOR = "Borrador",
  SOLICITADA = "Solicitada",
  OBSERVADA = "Observada",
  GENERADA = "Generada",
  SUSCRITA = "Suscrita",
  EN_USO = "EnUso",
  LIQUIDADA_A = "LiquidadaA",
  LIQUIDADA_B = "LiquidadaB",
  ANULADA = "Anulada",
}

export enum EstadoModificacionPoa {
  BORRADOR = "Borrador",
  SOLICITADA = "Solicitada",
  OBSERVADA = "Observada",
  SUSCRITA = "Suscrita",
  APROBADA = "Aprobada",
  APLICADA = "Aplicada",
  RECHAZADA = "Rechazada",
}

export enum ModoLiquidacion {
  A = "A",
  B = "B",
}

export enum MotivoModificacionPoa {
  REGULACION_SBYE = "RegulacionSBYE",
  DISCREPANCIA_BIENES = "DiscrepanciaBienes",
  VALOR_REAL_SUPERIOR = "ValorRealSuperior",
  OTRO = "Otro",
}
