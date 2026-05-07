# Permisos y autorización

## Modelo recomendado

Usar RBAC con permisos explícitos.

Un rol agrupa permisos. Cada endpoint valida permisos, no solo rol.

## Roles base

- ADMIN
- DIRECTOR_PLANIFICACION
- ANALISTA_PLANIFICACION
- UNIDAD_REQUIRENTE
- FINANCIERO
- BIENES

## Permisos sugeridos

### Cédula MEF

- `cedula.importar`
- `cedula.ver`
- `cedula.comparar`

### POA

- `poa.ver`
- `poa.versionar`
- `poa.actividad.ver`

### Certificaciones

- `certificacion.crear`
- `certificacion.ver`
- `certificacion.aprobar`
- `certificacion.observar`
- `certificacion.suscribir`
- `certificacion.marcar_uso`

### Modificaciones POA

- `modificacion.crear`
- `modificacion.ver`
- `modificacion.revisar`
- `modificacion.suscribir`
- `modificacion.aplicar`

### Liquidaciones

- `liquidacion.crear`
- `liquidacion.aprobar`
- `liquidacion.ver`

### Anulaciones

- `anulacion.crear`
- `anulacion.aprobar`
- `anulacion.ver`

### Devoluciones

- `devolucion.registrar`
- `devolucion.ver`
- `devolucion.clasificar`

### Reportes

- `reporte.ver_unidad`
- `reporte.ver_direccion`
- `reporte.exportar`

### Auditoría

- `auditoria.ver`

## Restricciones por unidad

Las unidades requirentes solo deben ver sus propios trámites y saldos, salvo permisos administrativos o de dirección.

## Restricción crítica

El frontend puede ocultar acciones, pero la autorización real siempre debe ejecutarse en backend.
