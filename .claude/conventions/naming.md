# Convenciones de nombres

## General

- Carpetas: kebab-case.
- Archivos TypeScript: kebab-case.
- Clases: PascalCase.
- Variables y funciones: camelCase.
- Constantes: UPPER_SNAKE_CASE.
- Tablas: snake_case plural.
- Columnas: snake_case.

## Módulos

Usar nombres de dominio en español cuando el dominio institucional sea español.

Ejemplos:

```txt
cedula-mef
certificaciones
modificaciones-poa
liquidaciones
anulaciones
devoluciones-financiero
```

## Estados

En código, usar enums en mayúsculas.

Ejemplo:

```ts
enum EstadoCertificacion {
  BORRADOR = 'BORRADOR',
  SOLICITADA = 'SOLICITADA',
  OBSERVADA = 'OBSERVADA',
  GENERADA = 'GENERADA',
  SUSCRITA = 'SUSCRITA',
  EN_USO = 'EN_USO',
  LIQUIDADA_A = 'LIQUIDADA_A',
  LIQUIDADA_B = 'LIQUIDADA_B',
  ANULADA = 'ANULADA'
}
```

## Identificadores de documentos

Certificaciones:

```txt
POA-{UNIDAD}-{ANIO}-{SECUENCIA}
PAI-{UNIDAD}-{ANIO}-{SECUENCIA}
```

Ajustar `{UNIDAD}` según código institucional real.
