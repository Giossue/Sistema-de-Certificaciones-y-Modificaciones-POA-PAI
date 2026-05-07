# ADR 0004 — Cédula MEF versionada

## Estado

Aceptado.

## Contexto

La cédula MEF puede cambiar diariamente y las certificaciones deben saber contra qué versión fueron validadas.

## Decisión

Cada importación válida crea una versión inmutable de cédula MEF.

## Consecuencias

- Las certificaciones quedan ancladas a la versión vigente al momento de emitirse.
- Se puede comparar una cédula contra la anterior.
- Se evita sobrescribir datos históricos.
