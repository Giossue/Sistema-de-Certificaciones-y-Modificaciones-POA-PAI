# Reglas de negocio

## RN-01 — Monto con o sin IVA

El monto a certificar puede ser con o sin IVA según indique la unidad.

## RN-02 — Una certificación vigente por actividad

No se permite más de una certificación vigente sobre la misma actividad sin liquidar.

## RN-03 — Anulación solo sin uso

Una certificación con uso presupuestario no se puede anular; solo se puede liquidar.

## RN-04 — Validación contra cédula MEF vigente

Toda solicitud debe validarse contra la cédula MEF vigente al momento de la solicitud o emisión, según corresponda.

## RN-05 — Saldo al centavo

El saldo disponible se controla con precisión de 0,01.

## RN-06 — Liquidación modo A

El saldo liberado vuelve a la actividad origen.

## RN-07 — Liquidación modo B

El saldo liberado queda disponible para una reforma posterior.

## RN-08 — Cédula MEF inmutable

El histórico de versiones de cédula MEF es inmutable.

## RN-09 — Certificación anclada a cédula

Cada certificación queda anclada a la versión de cédula MEF vigente al momento de emitirse.

## RN-10 — Fuente no modificable

En una modificación POA se pueden cambiar programa, actividad, responsable, ítem presupuestario y monto, pero nunca la fuente de financiamiento.

## RN-11 — POA versionado

Cada modificación aprobada genera una nueva versión del POA.

## RN-12 — Trazabilidad de modificación

Toda modificación debe conservar historial: valor anterior, valor nuevo, usuario, fecha, motivo y aprobadores.

## RN-13 — Reasociación de certificaciones

Las certificaciones vigentes sobre una actividad modificada se reasocian automáticamente a la nueva versión sin perder saldo ni trazabilidad.

## RN-14 — Motivo obligatorio

El motivo de modificación es obligatorio y debe seleccionarse desde catálogo.

## RN-15 — Documentos habilitantes obligatorios

Una certificación no puede pasar a estado solicitada sin los documentos habilitantes requeridos.

## RN-16 — Bloqueo con motivo explícito

Todo bloqueo automático debe indicar una causa clara, accionable y visible para el usuario.

## RN-17 — Numeración automática

La certificación debe usar numeración automática por tipo, año y secuencia.

Formato base:

- `POA-XXXX-YYYY-NNN`
- `PAI-XXXX-YYYY-NNN`
