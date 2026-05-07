# ADR 0001 — Monolito modular

## Estado

Aceptado.

## Contexto

El sistema tiene procesos altamente conectados: certificaciones, saldos, cédula MEF, modificaciones POA, liquidaciones, anulaciones, documentos y auditoría.

## Decisión

Usar monolito modular dentro de un monorepo.

## Consecuencias

- Menor complejidad inicial.
- Transacciones más simples.
- Mejor consistencia de datos.
- Posibilidad de extraer módulos en el futuro si existe necesidad real.

## Restricción

No crear microservicios en la primera versión.
