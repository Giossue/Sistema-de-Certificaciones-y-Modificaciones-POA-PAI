# Convenciones de archivos

## Almacenamiento

Separar archivos subidos de archivos generados.

```txt
storage/uploads/
storage/generated/
```

## Archivos subidos

- Cédulas MEF.
- Documentos habilitantes.
- Archivos de devoluciones.

## Archivos generados

- Certificaciones.
- Memorandos.
- Informes de modificación POA.
- Reportes.

## Metadata obligatoria

Guardar en base de datos:

- nombre original
- nombre interno
- ruta
- tipo MIME
- tamaño
- hash
- usuario que subió o generó
- fecha de creación

## Seguridad

- Validar extensión.
- Validar MIME type.
- Limitar tamaño.
- No servir archivos sin autorización.
- No confiar en el nombre original.
- Generar nombres internos únicos.

## Nombres generados

Formato recomendado:

```txt
{tipo}-{anio}-{secuencia}-{uuid}.pdf
```

Ejemplo:

```txt
certificacion-poa-2026-000123-8f3a.pdf
```
