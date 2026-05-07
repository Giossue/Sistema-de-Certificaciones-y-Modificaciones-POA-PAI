# Workflow — Devolución del financiero

## Objetivo

Registrar devoluciones del financiero para corregir casos y alimentar mejora continua de validaciones.

## Flujo principal

1. Financiero devuelve una certificación.
2. Unidad o usuario autorizado registra la devolución.
3. Sistema almacena motivo y descripción.
4. Analista clasifica la causa.
5. Si la cédula cambió, se importa nueva versión.
6. Si falta una regla, se documenta nueva validación.
7. Si fue error operativo externo, se marca como improcedente.
8. Unidad reenvía solicitud corregida si aplica.

## Clasificaciones sugeridas

- Estructura presupuestaria inválida.
- Saldo insuficiente.
- Ítem incorrecto.
- Fuente incorrecta.
- Documento incompleto.
- Cambio de cédula posterior.
- Error operativo externo.
- Otro.

## Reportes

El panel de Dirección debe mostrar:

- Devoluciones por mes.
- Causas principales.
- Unidades con más devoluciones.
- Reglas automáticas asociadas.
- Casos no cubiertos por validación.
