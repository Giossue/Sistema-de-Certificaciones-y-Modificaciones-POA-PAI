# Workflow — Bienes → Modificación POA → Certificación

## Objetivo

Cubrir el caso donde bienes detecta discrepancias antes de que la unidad pueda solicitar la certificación presupuestaria.

## Disparadores

- El ítem presupuestario del POA no corresponde al bien real.
- El valor real del bien es mayor al planificado.
- Regulaciones SBYE modifican asignación de ítems.

## Flujo principal

1. Unidad necesita ejecutar una actividad.
2. Unidad solicita certificación de existencia a bienes.
3. Bienes revisa.
4. Si bienes aprueba, la unidad solicita certificación POA/PAI.
5. Si bienes observa por ítem o valor, la unidad crea modificación POA.
6. Sistema valida modificación.
7. Planificación aprueba modificación.
8. Sistema crea nueva versión POA.
9. Unidad reintenta proceso con bienes si corresponde.
10. Unidad solicita certificación POA/PAI.

## Reglas

- La modificación debe quedar conectada al origen de bienes.
- La unidad no debe reiniciar el trámite desde cero después de una modificación aprobada.
- El sistema debe permitir continuar hacia certificación desde el flujo de modificación.

## Datos sugeridos

- observacion_bienes
- tipo_discrepancia
- item_observado
- monto_observado
- documento_bienes_id
- modificacion_poa_id
- certificacion_id
