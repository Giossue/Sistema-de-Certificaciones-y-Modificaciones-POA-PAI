# Importación desde ESIGEF

## Alcance

No existe integración API directa en la primera versión.

El administrador exporta Excel desde ESIGEF y lo carga manualmente.

## Reglas de importación

1. El archivo original debe conservarse.
2. Se debe calcular hash del archivo.
3. La importación debe crear versión inmutable.
4. La versión debe tener fecha de corte.
5. El sistema debe mostrar diferencias contra la versión anterior.

## Diferencias esperadas

- Ítems agregados.
- Ítems retirados.
- Montos modificados.
- Fuentes agregadas o retiradas.
- Combinaciones nuevas.
- Combinaciones eliminadas.

## Recordatorio diario

El sistema debe permitir recordatorio para cargar la cédula del día.
