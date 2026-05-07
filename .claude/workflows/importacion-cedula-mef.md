# Workflow — Importación de cédula MEF

## Objetivo

Cargar la cédula presupuestaria MEF exportada desde ESIGEF para que el sistema valide certificaciones y modificaciones contra una fuente vigente.

## Actores

- Administrador.
- Sistema.

## Flujo principal

1. Administrador descarga Excel desde ESIGEF.
2. Administrador sube archivo al sistema.
3. Sistema valida formato.
4. Sistema parsea columnas requeridas.
5. Sistema valida combinaciones presupuestarias.
6. Sistema calcula hash del archivo.
7. Sistema crea versión de cédula MEF.
8. Sistema compara contra versión anterior.
9. Sistema muestra diferencias.
10. Sistema marca la nueva versión como vigente.

## Validaciones

- Archivo debe ser Excel.
- Columnas obligatorias presentes.
- Programa no vacío.
- Actividad no vacía.
- Ítem no vacío.
- Fuente no vacía.
- Montos numéricos válidos.
- No usar `float` para montos.

## Resultado exitoso

- Nueva `CedulaMefVersion` creada.
- Entradas de cédula creadas.
- Versión disponible para validaciones.
- Auditoría registrada.

## Errores

- Archivo inválido.
- Columnas faltantes.
- Montos inválidos.
- Combinaciones duplicadas no permitidas.
- Error de persistencia.

## Transacción

La importación completa debe ser transaccional. Si falla una entrada, no debe quedar una versión parcial como vigente.
