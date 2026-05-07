# Esquema esperado de cédula MEF

## Origen

Archivo Excel exportado desde ESIGEF.

## Columnas mínimas esperadas

| Campo lógico | Tipo | Requerido |
|---|---|---:|
| programa_codigo | texto | sí |
| programa_nombre | texto | sí |
| actividad_codigo | texto | sí |
| actividad_nombre | texto | sí |
| item_codigo | texto | sí |
| item_nombre | texto | sí |
| fuente_codigo | texto | sí |
| fuente_nombre | texto | sí |
| monto_codificado | decimal | sí |
| monto_devengado | decimal | no |
| saldo_disponible | decimal | sí |

## Normalización

- Trim de espacios.
- Códigos como texto, no número.
- Mantener ceros a la izquierda.
- Montos con dos decimales.
- Fechas en formato ISO interno.

## Validación de combinación

La combinación válida mínima es:

```txt
programa_codigo + actividad_codigo + item_codigo + fuente_codigo
```

La certificación y modificación deben validarse contra esa combinación.

## Errores comunes

- Ítem inexistente.
- Fuente no asociada al ítem.
- Actividad no asociada al programa.
- Código tratado como número y pérdida de ceros a la izquierda.
- Montos con separadores locales mal parseados.
