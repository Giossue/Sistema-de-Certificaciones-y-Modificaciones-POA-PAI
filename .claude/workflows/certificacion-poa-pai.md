# Workflow — Certificación POA/PAI

## Objetivo

Emitir una certificación POA/PAI validada contra cédula MEF, con saldo suficiente, documentos habilitantes y trazabilidad.

## Estados

- Borrador.
- Solicitada.
- Observada.
- Generada.
- Suscrita.
- EnUso.
- LiquidadaA.
- LiquidadaB.
- Anulada.
- Cancelada.

## Flujo principal

1. Unidad crea borrador.
2. Sistema muestra actividades vigentes y saldo disponible.
3. Unidad selecciona programa, actividad, ítem, fuente y monto.
4. Unidad indica si el monto incluye IVA.
5. Unidad adjunta documentos habilitantes.
6. Sistema valida estructura contra cédula MEF vigente.
7. Sistema valida saldo al centavo.
8. Sistema valida que no exista certificación vigente duplicada.
9. Sistema valida adjuntos.
10. Solicitud pasa a estado `Solicitada`.
11. Analista revisa.
12. Analista observa o aprueba.
13. Si aprueba, sistema genera número y PDF.
14. Director revisa y suscribe.
15. Sistema descuenta saldo y notifica a la unidad.

## Bloqueos automáticos

- Programa inválido.
- Actividad inválida.
- Ítem inválido.
- Fuente inválida.
- Fuente no asociada al ítem.
- Combinación programa + actividad + ítem + fuente inexistente.
- Saldo insuficiente.
- Certificación vigente duplicada.
- Adjuntos faltantes.

## Reglas críticas

- El descuento de saldo ocurre al suscribir, no al crear borrador.
- La certificación queda asociada a la versión de cédula MEF usada.
- La certificación queda asociada a la versión POA vigente.
- Todo cambio de estado registra auditoría.

## Salida

- Certificación suscrita.
- Número automático.
- PDF generado.
- Memorando generado.
- Saldo actualizado.
