# ADR 0005 — Fuente no modificable

## Estado

Aceptado.

## Contexto

La Dirección indicó que en modificaciones POA se pueden cambiar actividad, programa, responsable e ítem presupuestario, pero no la fuente de financiamiento.

## Decisión

El sistema bloqueará cualquier intento de cambiar la fuente.

## Consecuencias

- La UI no debe ofrecer edición de fuente.
- El backend debe validar de todos modos.
- La base de datos debe conservar la fuente anterior y verificar que no cambie.
- El bloqueo debe mostrar mensaje claro.
