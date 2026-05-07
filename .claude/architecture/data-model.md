# Modelo conceptual de datos

## Entidades principales

### Universidad

Representa la institución que usa el sistema.

Campos sugeridos:

- id
- nombre
- ruc
- activo

### UnidadRequirente

Unidad que solicita certificaciones, modificaciones, liquidaciones o anulaciones.

Campos sugeridos:

- id
- universidad_id
- nombre
- codigo
- activo

### Usuario

Usuario del sistema.

Campos sugeridos:

- id
- unidad_id
- rol_id
- nombre
- email
- password_hash
- estado

### Rol

Rol funcional del usuario.

Campos sugeridos:

- id
- nombre
- descripcion

### PeriodoFiscal

Año fiscal de trabajo.

Campos sugeridos:

- id
- anio
- fecha_inicio
- fecha_fin
- estado

### CedulaMefVersion

Versión inmutable de la cédula MEF importada.

Campos sugeridos:

- id
- periodo_fiscal_id
- fecha_corte
- archivo_original_id
- hash_archivo
- importado_por
- created_at

### CedulaMefEntrada

Entrada individual de la cédula MEF.

Campos sugeridos:

- id
- cedula_mef_version_id
- programa_codigo
- programa_nombre
- actividad_codigo
- actividad_nombre
- item_codigo
- item_nombre
- fuente_codigo
- fuente_nombre
- monto_codificado
- monto_devengado
- saldo_disponible_mef

### PoaVersion

Versión del POA.

Campos sugeridos:

- id
- periodo_fiscal_id
- numero_version
- estado
- origen_modificacion_id
- created_at
- created_by

### ActividadPoa

Actividad presupuestaria dentro de una versión POA.

Campos sugeridos:

- id
- poa_version_id
- unidad_requirente_id
- programa_codigo
- actividad_codigo
- item_codigo
- fuente_codigo
- responsable_usuario_id
- monto_planificado
- estado

### Certificacion

Certificación POA/PAI.

Campos sugeridos:

- id
- tipo
- numero
- unidad_requirente_id
- actividad_poa_id
- poa_version_id
- cedula_mef_version_id
- programa_codigo
- actividad_codigo
- item_codigo
- fuente_codigo
- monto
- incluye_iva
- estado
- fecha_solicitud
- fecha_suscripcion
- solicitada_por
- aprobada_por
- suscrita_por

### DocumentoHabilitante

Archivo adjunto requerido.

Campos sugeridos:

- id
- certificacion_id
- tipo
- nombre_original
- path
- mime_type
- size_bytes
- uploaded_by
- created_at

### ModificacionPoa

Solicitud y aplicación de modificación POA.

Campos sugeridos:

- id
- actividad_poa_origen_id
- poa_version_origen_id
- poa_version_destino_id
- unidad_requirente_id
- motivo_id
- estado
- programa_codigo_anterior
- programa_codigo_nuevo
- actividad_codigo_anterior
- actividad_codigo_nueva
- item_codigo_anterior
- item_codigo_nuevo
- fuente_codigo
- responsable_anterior_id
- responsable_nuevo_id
- monto_anterior
- monto_nuevo
- cedula_mef_version_id
- created_by
- approved_by
- applied_at

### MotivoModificacion

Catálogo de motivos.

Valores base:

- Regulación SBYE.
- Discrepancia bienes.
- Valor real superior.
- Otro.

### Liquidacion

Liquidación de certificación.

Campos sugeridos:

- id
- certificacion_id
- tipo
- modo
- monto
- estado
- motivo
- solicitada_por
- aprobada_por
- created_at
- approved_at

### Anulacion

Anulación de certificación.

Campos sugeridos:

- id
- certificacion_id
- motivo
- estado
- solicitada_por
- aprobada_por
- created_at
- approved_at

### DevolucionFinanciero

Registro de devolución.

Campos sugeridos:

- id
- certificacion_id
- motivo
- descripcion
- fecha_devolucion
- registrada_por
- clasificacion

### Auditoria

Registro transversal.

Campos sugeridos:

- id
- usuario_id
- entidad
- entidad_id
- accion
- estado_anterior
- estado_nuevo
- payload_anterior
- payload_nuevo
- motivo
- ip
- created_at

## Relaciones clave

- Un periodo fiscal tiene muchas versiones de cédula MEF.
- Un periodo fiscal tiene muchas versiones POA.
- Una versión POA tiene muchas actividades.
- Una certificación pertenece a una actividad POA, una versión POA y una versión de cédula MEF.
- Una modificación POA parte de una versión POA y crea otra versión POA.
- Una certificación puede tener liquidaciones, anulaciones y devoluciones.
- Toda entidad crítica tiene auditoría.
