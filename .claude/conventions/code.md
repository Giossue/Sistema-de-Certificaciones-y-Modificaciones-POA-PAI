# Convenciones de código

## Convenciones de stack

- Usar Bun como runtime, package manager y test runner.
- Usar Hono para la API HTTP.
- Usar React + Vite en el frontend.
- Usar HeroUI como sistema principal de componentes. Ver `.claude/reference/heroui.md` para guía completa de componentes y mejores prácticas.
- No introducir Material UI, Chakra UI, Ant Design ni shadcn/ui salvo autorización explícita.
- Usar TypeScript estricto en frontend, backend y paquetes compartidos.

## Lenguaje

Usar TypeScript estricto.

## Reglas generales

- No usar `any` salvo justificación puntual.
- No poner lógica de negocio en controladores.
- No acceder a base de datos desde controladores.
- No calcular dinero con `number` sin value object.
- No duplicar reglas de negocio entre módulos.
- Escribir pruebas para reglas críticas.

## Nombres de archivos

Usar kebab-case.

Ejemplos:

```txt
crear-certificacion.usecase.ts
validar-saldo-disponible.rule.ts
certificacion.entity.ts
monto.vo.ts
```

## Casos de uso

Sufijo:

```txt
.usecase.ts
```

Cada caso de uso debe tener una única responsabilidad.

## Reglas de dominio

Sufijo:

```txt
.rule.ts
```

## Value objects

Sufijo:

```txt
.vo.ts
```

## Entidades

Sufijo:

```txt
.entity.ts
```

## DTOs

Sufijo:

```txt
.dto.ts
```

## Repositorios

Los contratos viven en dominio.

Las implementaciones viven en infraestructura.

## Errores

Usar errores de dominio para reglas de negocio y errores de aplicación para orquestación.

## Dinero

Crear un value object `Money` o `Monto`.

Debe soportar:

- suma
- resta
- comparación
- validación de escala 2
- serialización segura
