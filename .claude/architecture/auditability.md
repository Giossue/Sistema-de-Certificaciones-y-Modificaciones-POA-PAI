# Auditoría y trazabilidad

## Principio

El sistema debe poder responder:

- Quién hizo qué.
- Cuándo lo hizo.
- Desde qué estado hacia qué estado.
- Qué datos cambiaron.
- Por qué se hizo, si aplica.

## Eventos auditables obligatorios

### Cédula MEF

- Importación iniciada.
- Importación fallida.
- Importación exitosa.
- Creación de nueva versión.

### Certificaciones

- Creación de borrador.
- Envío de solicitud.
- Bloqueo por validación.
- Observación.
- Aprobación.
- Generación de número.
- Generación de PDF.
- Suscripción.
- Marcado de uso.
- Liquidación.
- Anulación.
- Devolución del financiero.

### Modificaciones POA

- Creación de solicitud.
- Bloqueo por intento de cambio de fuente.
- Bloqueo por estructura inválida.
- Observación.
- Suscripción.
- Aprobación.
- Creación de nueva versión POA.
- Reasociación de certificaciones vigentes.

### Saldos

- Descuento por certificación.
- Liberación por anulación.
- Liberación por liquidación modo A.
- Retiro por liquidación modo B.

## Modelo de auditoría

Guardar como mínimo:

- usuario_id
- rol
- accion
- entidad
- entidad_id
- estado_anterior
- estado_nuevo
- payload_anterior
- payload_nuevo
- motivo
- ip
- user_agent
- created_at

## Regla

No usar auditoría como sustituto del modelo de dominio. La auditoría registra hechos; las entidades mantienen el estado actual y relaciones operativas.
