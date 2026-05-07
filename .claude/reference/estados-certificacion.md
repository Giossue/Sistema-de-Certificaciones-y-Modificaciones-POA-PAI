# Estados de certificación

## BORRADOR

La unidad está preparando la solicitud.

## SOLICITADA

La unidad envió la solicitud y pasó validaciones automáticas.

## OBSERVADA

El analista o director devolvió la solicitud para corrección.

## GENERADA

El analista aprobó y el sistema generó número/documentos preliminares.

## SUSCRITA

El director suscribió la certificación. El saldo queda descontado.

## EN_USO

Financiero emitió certificación presupuestaria o marcó uso.

## LIQUIDADA_A

Liquidada con devolución de saldo a actividad origen.

## LIQUIDADA_B

Liquidada con retiro para reforma.

## ANULADA

Anulada por no haber sido utilizada.

## CANCELADA

Cancelada por la unidad antes de enviarse o antes de aprobación.

## Transiciones permitidas

```txt
BORRADOR -> SOLICITADA
BORRADOR -> CANCELADA
SOLICITADA -> OBSERVADA
OBSERVADA -> SOLICITADA
SOLICITADA -> GENERADA
GENERADA -> SUSCRITA
SUSCRITA -> EN_USO
SUSCRITA -> ANULADA
EN_USO -> LIQUIDADA_A
EN_USO -> LIQUIDADA_B
```
