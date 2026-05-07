# Estados de modificación POA

## BORRADOR

La unidad prepara la modificación.

## SOLICITADA

La modificación fue enviada y pasó validaciones automáticas.

## OBSERVADA

Planificación observó la solicitud.

## SUSCRITA

Director de Planificación suscribió.

## APROBADA

Órgano aprobador aprobó.

## APLICADA

El sistema creó nueva versión POA.

## RECHAZADA

La modificación fue rechazada.

## Transiciones permitidas

```txt
BORRADOR -> SOLICITADA
SOLICITADA -> OBSERVADA
OBSERVADA -> SOLICITADA
SOLICITADA -> SUSCRITA
SUSCRITA -> APROBADA
APROBADA -> APLICADA
SOLICITADA -> RECHAZADA
```
