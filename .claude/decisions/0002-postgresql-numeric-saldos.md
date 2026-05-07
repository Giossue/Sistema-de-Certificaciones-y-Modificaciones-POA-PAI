# ADR 0002 — PostgreSQL numeric para saldos

## Estado

Aceptado.

## Contexto

El sistema debe controlar saldos al centavo.

## Decisión

Usar PostgreSQL y tipo `numeric` para montos.

## Consecuencias

- Evita errores de punto flotante.
- Permite cálculos exactos de dinero.
- Requiere value objects en backend para no introducir errores antes de persistir.

## Regla

No usar `float`, `double precision`, `real` ni cálculos monetarios directos con `number`.
