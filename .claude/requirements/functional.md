# Requerimientos funcionales

## RF-01 — Importar cédula MEF

El administrador puede subir un archivo Excel exportado de ESIGEF.

## RF-02 — Parsear cédula MEF

El sistema parsea programas, actividades, ítems, fuentes, montos y combinaciones presupuestarias.

## RF-03 — Versionar cédula MEF

Cada carga válida crea una versión de cédula con corte a la fecha de importación.

## RF-04 — Comparar versiones de cédula

El sistema muestra diferencias entre la cédula vigente y la versión anterior: agregados, modificados y retirados.

## RF-05 — Solicitar certificación

La unidad requirente crea solicitudes seleccionando programa, actividad, ítem, fuente, monto y tipo POA/PAI.

## RF-06 — Validar estructura presupuestaria

El sistema bloquea solicitudes cuya estructura no conste en la cédula MEF vigente.

Validaciones mínimas:

- Programa válido.
- Actividad válida.
- Ítem válido.
- Fuente válida.
- Fuente asociada al ítem.
- Combinación programa + actividad + ítem + fuente registrada.

## RF-07 — Validar saldo

El sistema bloquea solicitudes si el saldo disponible es menor al monto solicitado.

## RF-08 — Validar certificación vigente duplicada

El sistema bloquea si ya existe una certificación vigente sobre la misma actividad sin liquidar.

## RF-09 — Validar documentos habilitantes

El sistema exige adjuntos habilitantes según el tipo de solicitud.

## RF-10 — Emitir certificación

Tras aprobación y suscripción, el sistema asigna número automático, genera PDF, genera memorando y descuenta saldo.

## RF-11 — Registrar devolución del financiero

El sistema permite registrar motivos de devolución, reenviar y alimentar panel de causas.

## RF-12 — Consultar saldos

Cada actividad muestra asignado, certificado, modificado, liberado y saldo disponible.

## RF-13 — Solicitar liquidación

La unidad puede solicitar liquidación total o parcial.

## RF-14 — Liquidación modo A

El monto liquidado vuelve al saldo de la actividad origen.

## RF-15 — Liquidación modo B

El monto liquidado queda marcado como disponible para reforma.

## RF-16 — Solicitar anulación

La unidad puede solicitar anulación de una certificación no utilizada.

## RF-17 — Bloquear anulación con uso

Una certificación ya usada no puede anularse; solo liquidarse.

## RF-18 — Solicitar modificación POA

La unidad puede solicitar cambios de programa, actividad, responsable, ítem y monto planificado.

## RF-19 — Bloquear cambio de fuente

El sistema bloquea cualquier intento de modificar la fuente de financiamiento.

## RF-20 — Validar modificación contra cédula MEF

La nueva estructura propuesta debe existir en la cédula MEF vigente.

## RF-21 — Registrar motivo de modificación

El motivo es obligatorio y debe venir de catálogo.

Motivos base:

- Regulación SBYE.
- Discrepancia detectada por bienes.
- Valor real superior al planeado.
- Otro.

## RF-22 — Generar informe técnico

El sistema genera informe técnico de modificación POA en PDF.

## RF-23 — Aplicar modificación POA

Tras aprobación, el sistema crea una nueva versión del POA.

## RF-24 — Reasociar certificaciones vigentes

Las certificaciones vigentes asociadas a una actividad modificada se reasocian a la nueva versión, manteniendo saldo y estado.

## RF-25 — Panel de Dirección

El sistema muestra indicadores de certificaciones, modificaciones, devoluciones y saldos bajos.

## RF-26 — Exportar reportes

El sistema exporta reportes a Excel y PDF.
