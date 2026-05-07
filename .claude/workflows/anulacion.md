# Workflow — Anulación

## Objetivo

Cancelar una certificación no utilizada y liberar su saldo.

## Flujo principal

1. Unidad solicita anulación.
2. Sistema verifica si la certificación tiene uso.
3. Si tiene uso, bloquea e indica que solo puede liquidarse.
4. Si no tiene uso, unidad registra motivo.
5. Director aprueba.
6. Sistema marca certificación como anulada.
7. Sistema libera saldo completo.
8. Sistema registra auditoría.

## Validaciones

- Certificación existente.
- Certificación sin uso.
- Motivo obligatorio.
- Usuario con permiso.

## Reglas

- Una certificación con certificación presupuestaria emitida no se anula.
- Una anulación siempre libera el saldo completo.
- No se permite anular dos veces.
