# Workflow — Liquidación

## Objetivo

Liberar total o parcialmente el saldo de una certificación, con dos modos operativos.

## Tipos

- Total.
- Parcial.

## Modos

### Modo A

El monto liberado vuelve al saldo de la misma actividad.

### Modo B

El monto liberado queda retirado para reubicación mediante reforma.

## Flujo principal

1. Unidad solicita liquidación.
2. Unidad selecciona certificación.
3. Unidad indica tipo: total o parcial.
4. Unidad indica monto si es parcial.
5. Unidad selecciona modo A o B.
6. Sistema valida estado de certificación.
7. Sistema valida monto.
8. Director aprueba.
9. Sistema registra liquidación.
10. Sistema actualiza saldo según modo.
11. Sistema registra auditoría.

## Validaciones

- Certificación debe estar en estado compatible.
- Monto debe ser mayor a cero.
- Monto no puede superar saldo certificado restante.
- Modo obligatorio.

## Efectos de saldo

- Modo A: suma al saldo disponible de actividad origen.
- Modo B: resta del monto vigente certificado y marca como disponible para reforma, no como saldo libre de actividad.
