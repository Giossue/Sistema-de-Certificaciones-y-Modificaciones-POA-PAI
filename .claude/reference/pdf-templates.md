# Plantillas PDF

## Plantillas necesarias

```txt
certificacion-poa.hbs
certificacion-pai.hbs
memorando-respuesta.hbs
informe-modificacion-poa.hbs
liquidacion-anulacion.hbs
```

## Metadata de generación

Cada PDF debe guardar:

- tipo_documento
- plantilla
- version_plantilla
- entidad_origen
- entidad_origen_id
- generado_por
- fecha_generacion
- hash_documento
- path

## Datos mínimos — Certificación

- número
- tipo POA/PAI
- unidad requirente
- programa
- actividad
- ítem
- fuente
- monto
- incluye IVA
- fecha
- firmante
- versión de cédula MEF
- versión POA

## Datos mínimos — Informe técnico de modificación

- unidad requirente
- actividad origen
- valores anteriores
- valores nuevos
- motivo
- justificación
- validación contra cédula MEF
- aprobadores
- fecha
