# Workflows principales

Los workflows detallados están en `.claude/workflows/`.

## Lista de procesos

1. Importación de cédula MEF.
2. Solicitud y emisión de certificación POA/PAI.
3. Modificación POA.
4. Flujo combinado bienes → modificación → certificación.
5. Liquidación.
6. Anulación.
7. Devolución del financiero.

## Estados transversales recomendados

### Estados de solicitud

- Borrador.
- Solicitada.
- Observada.
- Aprobada.
- Rechazada.
- Aplicada o emitida.

### Estados documentales

- Pendiente de generación.
- Generado.
- Firmado o suscrito.
- Anulado.

## Regla general

Cada transición de estado debe:

1. Validar permisos.
2. Validar reglas de negocio.
3. Ejecutarse en transacción si cambia datos críticos.
4. Registrar auditoría.
5. Notificar al siguiente actor cuando corresponda.
