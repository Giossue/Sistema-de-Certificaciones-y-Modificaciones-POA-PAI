# Convenciones de pruebas

## Tipos de pruebas

### Unitarias

Obligatorias para:

- Reglas de negocio.
- Value objects de dinero.
- Cálculo de saldos.
- Transiciones de estado.

### Integración

Obligatorias para:

- Repositorios.
- Importación de cédula MEF.
- Emisión de certificación.
- Aplicación de modificación POA.

### End-to-end

Obligatorias para flujos críticos:

- Certificación completa.
- Modificación POA completa.
- Liquidación.
- Anulación.

## Casos mínimos de saldo

- Certificación descuenta saldo.
- Certificación con saldo insuficiente bloquea.
- Liquidación modo A devuelve saldo.
- Liquidación modo B no devuelve saldo a actividad.
- Anulación libera saldo.
- Certificación duplicada bloquea.

## Casos mínimos de modificación POA

- Cambiar ítem válido.
- Cambiar monto válido.
- Intentar cambiar fuente bloquea.
- Nueva estructura inexistente en cédula bloquea.
- Aprobación crea nueva versión POA.

## Casos mínimos de cédula MEF

- Excel válido importa.
- Excel sin columnas obligatorias falla.
- Versión anterior permanece inmutable.
- Certificación queda anclada a versión vigente.
