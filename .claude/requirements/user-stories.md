# Historias de usuario

## HU-01 — Importar cédula MEF

Como administrador, quiero importar la cédula MEF desde Excel para que el sistema valide solicitudes contra datos oficiales.

Criterios:

- El sistema acepta archivo Excel.
- El sistema valida columnas requeridas.
- El sistema crea una versión nueva si el archivo es válido.
- El sistema muestra errores si el archivo es inválido.

## HU-02 — Solicitar certificación

Como unidad requirente, quiero solicitar una certificación POA/PAI para respaldar un trámite presupuestario.

Criterios:

- Puedo seleccionar actividad, ítem, fuente y monto.
- Puedo adjuntar documentos habilitantes.
- El sistema bloquea si la estructura no existe en la cédula.
- El sistema bloquea si el saldo es insuficiente.

## HU-03 — Revisar certificación

Como analista, quiero revisar solicitudes para aprobarlas u observarlas.

Criterios:

- Puedo ver validaciones ejecutadas.
- Puedo observar con motivo.
- Puedo aprobar si cumple requisitos.

## HU-04 — Suscribir certificación

Como director de planificación, quiero suscribir certificaciones aprobadas para emitir documentos oficiales.

Criterios:

- El sistema genera número automático.
- El sistema genera PDF.
- El sistema descuenta saldo.
- El sistema notifica a la unidad.

## HU-05 — Solicitar modificación POA

Como unidad requirente, quiero solicitar una modificación POA cuando bienes detecta un ítem incorrecto o valor superior.

Criterios:

- Puedo cambiar programa, actividad, responsable, ítem y monto.
- No puedo cambiar fuente.
- Debo seleccionar motivo.
- La nueva estructura se valida contra cédula MEF.

## HU-06 — Aplicar modificación POA

Como planificación, quiero aprobar modificaciones para crear una nueva versión del POA.

Criterios:

- Se genera informe técnico.
- Se registra trazabilidad.
- Se crea nueva versión.
- Se reasocian certificaciones vigentes.

## HU-07 — Liquidar certificación

Como unidad, quiero liquidar total o parcialmente una certificación para liberar saldo.

Criterios:

- Puedo elegir modo A o modo B.
- El director aprueba.
- El saldo se actualiza según modo.

## HU-08 — Anular certificación

Como unidad, quiero anular una certificación no utilizada para liberar su saldo.

Criterios:

- El sistema verifica que no tenga uso.
- Si tiene uso, bloquea la anulación.
- Si no tiene uso, permite aprobación y libera saldo.

## HU-09 — Registrar devolución

Como unidad o financiero, quiero registrar una devolución para identificar causas recurrentes.

Criterios:

- Se registra motivo.
- Se asocia a la certificación.
- Alimenta panel de causas.

## HU-10 — Consultar panel de Dirección

Como director, quiero ver indicadores para detectar riesgos y tomar decisiones.

Criterios:

- Veo devoluciones.
- Veo saldos bajos.
- Veo modificaciones por motivo.
- Veo tiempos de trámite.
