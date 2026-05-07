# Requerimientos no funcionales

## RNF-01 — Aplicación web responsive

La aplicación debe funcionar en computador y tableta.

## RNF-02 — Idioma

La interfaz debe estar en español.

## RNF-03 — Autenticación

Debe existir autenticación con usuario y contraseña.

## RNF-04 — Control por rol

Cada endpoint y vista debe verificar permisos.

## RNF-05 — Auditoría

Toda operación crítica debe quedar registrada.

## RNF-06 — Precisión monetaria

Los saldos se calculan con precisión decimal de dos dígitos y sin errores de punto flotante.

## RNF-07 — Disponibilidad

Disponibilidad mínima del 95% en horario laboral.

## RNF-08 — Capacidad

El sistema debe soportar al menos:

- 200 usuarios concurrentes.
- 50.000 actividades por periodo fiscal.

## RNF-09 — Respaldo

Debe existir respaldo automático diario de base de datos.

## RNF-10 — Despliegue

El sistema debe poder desplegarse con Docker en servidor institucional o nube.

## RNF-11 — Seguridad de archivos

Los documentos habilitantes y PDFs generados deben guardarse con rutas controladas, permisos y metadatos.

## RNF-12 — Observabilidad

Registrar errores, tiempos de respuesta y eventos críticos del sistema.
