# Convenciones de base de datos

## Motor

PostgreSQL.

## Dinero

Usar `numeric(14,2)` o una precisión mayor si se requiere.

No usar `float`, `real` ni `double precision` para dinero.

## Nombres

Usar snake_case.

Ejemplos:

```txt
cedula_mef_versions
cedula_mef_entries
poa_versions
actividades_poa
certificaciones
modificaciones_poa
```

## Campos estándar

Tablas principales deben incluir:

```txt
id
created_at
updated_at
created_by
updated_by
```

Cuando aplique:

```txt
deleted_at
status
```

## Inmutabilidad

Tablas inmutables:

- `cedula_mef_versions`
- `cedula_mef_entries`
- `poa_versions` después de aplicadas
- snapshots de auditoría

## Transacciones obligatorias

Usar transacción en:

- importación de cédula MEF
- emisión/suscripción de certificación
- liquidación
- anulación
- aplicación de modificación POA
- generación de versión POA

## Índices sugeridos

```sql
CREATE INDEX idx_certificaciones_estado ON certificaciones(status);
CREATE INDEX idx_certificaciones_actividad ON certificaciones(actividad_poa_id);
CREATE INDEX idx_cedula_mef_version ON cedula_mef_entries(cedula_mef_version_id);
CREATE INDEX idx_cedula_mef_combo ON cedula_mef_entries(programa_codigo, actividad_codigo, item_codigo, fuente_codigo);
CREATE INDEX idx_actividades_poa_version ON actividades_poa(poa_version_id);
CREATE INDEX idx_auditoria_entidad ON auditoria(entidad, entidad_id);
```

## Restricciones recomendadas

- Unicidad de número de certificación por periodo.
- Unicidad de versión de cédula por periodo y fecha de corte si aplica.
- Validación de montos no negativos.
- Foreign keys explícitas.
