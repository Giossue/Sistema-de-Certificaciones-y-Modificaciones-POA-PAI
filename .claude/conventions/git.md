# Convenciones Git

## Ramas

```txt
main
develop
feature/{nombre}
fix/{nombre}
chore/{nombre}
```

## Commits

Usar Conventional Commits.

Ejemplos:

```txt
feat(certificaciones): crear solicitud de certificacion
fix(saldos): corregir liquidacion modo a
chore(db): agregar migracion de cedula mef
```

## Pull requests

Cada PR debe indicar:

- Qué cambia.
- Por qué cambia.
- Módulos afectados.
- Pruebas ejecutadas.
- Riesgos.

## Regla

No mezclar cambios de formato, refactor y funcionalidad en un mismo commit si se puede evitar.
