# ADR 0006 — PDFs desde plantillas

## Estado

Aceptado.

## Contexto

El sistema debe generar certificaciones, memorandos e informes técnicos.

## Decisión

Usar plantillas versionadas para generar PDFs.

## Consecuencias

- Los documentos son consistentes.
- Se puede cambiar diseño sin modificar lógica de negocio.
- Cada documento debe registrar plantilla y versión usada.
