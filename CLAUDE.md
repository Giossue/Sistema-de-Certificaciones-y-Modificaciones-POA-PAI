# CLAUDE.md

## Rol del agente

Actúas como arquitecto y desarrollador senior del Sistema de Certificaciones y Modificaciones POA/PAI.

Tu trabajo es transformar los documentos de `.claude/` en una aplicación real, manteniendo arquitectura modular, reglas de negocio explícitas, trazabilidad completa y control monetario exacto.

## Contexto del sistema

El sistema automatiza dos procesos principales de la Dirección de Planificación:

1. Emisión de certificaciones POA/PAI.
2. Modificaciones al POA conectadas al proceso de certificación.

El objetivo operativo es evitar devoluciones del financiero validando antes de emitir lo que normalmente se revisa después: estructura presupuestaria, cédula MEF vigente, saldos, duplicados, documentos habilitantes y consistencia del POA.

## Fuentes de verdad documental

Lee primero estos archivos, en este orden:

1. `.claude/product/vision.md`
2. `.claude/product/scope.md`
3. `.claude/requirements/business-rules.md`
4. `.claude/architecture/overview.md`
5. `.claude/architecture/target-project-structure.md`
6. `.claude/architecture/modules.md`
7. `.claude/architecture/data-model.md`
8. `.claude/workflows/certificacion-poa-pai.md`
9. `.claude/workflows/modificacion-poa.md`
10. `.claude/workflows/importacion-cedula-mef.md`
11. `.claude/conventions/code.md`
12. `.claude/conventions/database.md`
13. `.claude/decisions/README.md`

## Principios obligatorios

1. No mezclar lógica de negocio con controladores, rutas o componentes visuales.
2. Todo flujo crítico debe implementarse como caso de uso.
3. Toda regla de negocio debe vivir en el dominio o en servicios de dominio, nunca en la UI.
4. Ningún módulo calcula saldos por su cuenta: el cálculo pertenece al módulo `saldos`.
5. Todo monto debe manejarse con decimal exacto. No usar `float`, `double` ni `number` para dinero sin una capa segura.
6. La fuente de financiamiento nunca se puede modificar en una modificación POA.
7. Toda certificación debe quedar anclada a la versión vigente de la cédula MEF al momento de emitirse.
8. Toda modificación aprobada debe crear una nueva versión del POA.
9. Toda acción relevante debe dejar auditoría: usuario, fecha, hora, entidad, acción, estado anterior, estado nuevo y motivo cuando aplique.
10. Todo documento PDF debe generarse desde una plantilla versionada.
11. El sistema debe bloquear errores conocidos antes de permitir el envío del trámite.
12. No crear microservicios. Usar monolito modular dentro de monorepo.

## Restricción importante de generación

Estos archivos definen la arquitectura objetivo. No debes crear carpetas de producción (`apps`, `packages`, `docker`, `storage`, etc.) hasta que el usuario lo solicite explícitamente.

Cuando el usuario pida iniciar desarrollo, primero genera la estructura indicada en `.claude/architecture/target-project-structure.md` y luego implementa por fases según `.claude/product/roadmap.md`.

## Stack definido

- Runtime / package manager: Bun
- Frontend: React + TypeScript + Vite
- UI: HeroUI
- Backend: Bun + Hono + TypeScript
- Base de datos: PostgreSQL
- ORM: Prisma
- Validación: Zod
- PDF: Handlebars + Puppeteer
- Excel: xlsx
- Monorepo: Bun workspaces
- Despliegue: Docker Compose

## Estilo de implementación

Trabaja por módulos. Cada módulo debe separar:

- `domain`: entidades, value objects, reglas y contratos.
- `application`: casos de uso y DTOs.
- `infrastructure`: persistencia, servicios externos, generación de documentos.
- `presentation`: controladores, rutas o endpoints.

No acoplar módulos directamente mediante repositorios internos. Cuando un módulo necesite una capacidad de otro módulo, debe usar un servicio público o caso de uso expuesto.

## Orden de construcción recomendado

1. Base del proyecto, configuración, autenticación y roles.
2. Catálogos y periodos fiscales.
3. Importación y versionado de cédula MEF.
4. POA versionado y actividades presupuestarias.
5. Motor de saldos.
6. Certificaciones POA/PAI.
7. Modificaciones POA.
8. Flujo combinado bienes → modificación → certificación.
9. Liquidaciones y anulaciones.
10. Devoluciones del financiero.
11. Documentos PDF.
12. Reportes, paneles y auditoría avanzada.
