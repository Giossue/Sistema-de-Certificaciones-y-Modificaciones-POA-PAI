# Workflow — Modificación POA

## Objetivo

Permitir cambios controlados a una actividad POA existente, generando una nueva versión del POA al aprobarse.

## Estados

- Borrador.
- Solicitada.
- Observada.
- Suscrita.
- Aprobada.
- Aplicada.
- Rechazada.

## Campos modificables

- Programa institucional.
- Actividad presupuestaria.
- Responsable.
- Ítem presupuestario.
- Monto planificado.

## Campo no modificable

- Fuente de financiamiento.

## Flujo principal

1. Unidad inicia solicitud de modificación.
2. Unidad selecciona actividad POA origen.
3. Unidad registra cambios propuestos.
4. Unidad selecciona motivo.
5. Sistema verifica que la fuente no cambie.
6. Sistema valida nueva estructura contra cédula MEF vigente.
7. Sistema genera informe técnico de modificación.
8. Analista revisa.
9. Director suscribe.
10. Órgano aprobador aprueba.
11. Sistema crea nueva versión POA.
12. Sistema reasocia certificaciones vigentes relacionadas.
13. Sistema notifica a la unidad.

## Motivos base

- Regulación SBYE.
- Discrepancia detectada por bienes.
- Valor real superior al planeado.
- Otro.

## Bloqueos automáticos

- Intento de cambiar fuente.
- Nueva estructura no consta en cédula MEF.
- Motivo faltante.
- Monto inválido.
- Actividad origen inexistente.
- Periodo fiscal cerrado.

## Reglas críticas

- La versión POA anterior no se modifica.
- La nueva versión es una copia controlada con cambios aprobados.
- La modificación conserva valores anteriores y nuevos.
- Las certificaciones vigentes no pierden estado ni saldo.
