# Arquitectura objetivo de carpetas

Este archivo describe la estructura que el agente debe crear cuando el usuario solicite iniciar el desarrollo.

No crear estas carpetas mientras el usuario solo pida documentación `.claude`.

## Estructura objetivo

```txt
sistema-poa-pai/
│
├── CLAUDE.md
├── .claude/
│   ├── README.md
│   ├── architecture/
│   ├── product/
│   ├── requirements/
│   ├── workflows/
│   ├── conventions/
│   ├── decisions/
│   └── reference/
│
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── routes/
│   │   │   ├── layouts/
│   │   │   ├── pages/
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── cedula-mef/
│   │   │   │   ├── poa/
│   │   │   │   ├── certificaciones/
│   │   │   │   ├── modificaciones-poa/
│   │   │   │   ├── saldos/
│   │   │   │   ├── liquidaciones/
│   │   │   │   ├── anulaciones/
│   │   │   │   ├── devoluciones/
│   │   │   │   ├── reportes/
│   │   │   │   └── usuarios/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── stores/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   └── package.json
│   │
│   └── api/
│       ├── src/
│       │   ├── main.ts
│       │   ├── config/
│       │   ├── common/
│       │   │   ├── errors/
│       │   │   ├── guards/
│       │   │   ├── interceptors/
│       │   │   ├── decorators/
│       │   │   ├── validators/
│       │   │   └── utils/
│       │   │
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── usuarios/
│       │   │   ├── roles-permisos/
│       │   │   ├── catalogos/
│       │   │   ├── periodos-fiscales/
│       │   │   ├── cedula-mef/
│       │   │   ├── poa/
│       │   │   ├── certificaciones/
│       │   │   ├── modificaciones-poa/
│       │   │   ├── saldos/
│       │   │   ├── liquidaciones/
│       │   │   ├── anulaciones/
│       │   │   ├── devoluciones-financiero/
│       │   │   ├── documentos/
│       │   │   ├── reportes/
│       │   │   ├── auditoria/
│       │   │   └── notificaciones/
│       │   │
│       │   ├── database/
│       │   │   ├── migrations/
│       │   │   ├── seeds/
│       │   │   └── schema/
│       │   │
│       │   └── jobs/
│       │       ├── daily-backup.job.ts
│       │       ├── cedula-mef-reminder.job.ts
│       │       └── saldo-alerts.job.ts
│       │
│       ├── test/
│       └── package.json
│
├── packages/
│   ├── shared/
│   │   ├── src/
│   │   │   ├── types/
│   │   │   ├── enums/
│   │   │   ├── constants/
│   │   │   ├── schemas/
│   │   │   └── money/
│   │   └── package.json
│   │
│   ├── ui/
│   │   ├── src/
│   │   │   ├── buttons/
│   │   │   ├── forms/
│   │   │   ├── tables/
│   │   │   ├── modals/
│   │   │   ├── badges/
│   │   │   └── layout/
│   │   └── package.json
│   │
│   └── pdf-templates/
│       ├── certificacion-poa.hbs
│       ├── certificacion-pai.hbs
│       ├── memorando-respuesta.hbs
│       ├── informe-modificacion-poa.hbs
│       └── liquidacion-anulacion.hbs
│
├── storage/
│   ├── uploads/
│   │   ├── cedulas-mef/
│   │   ├── documentos-habilitantes/
│   │   └── devoluciones-financiero/
│   │
│   └── generated/
│       ├── certificaciones/
│       ├── memorandos/
│       ├── informes-modificacion/
│       └── reportes/
│
├── docs/
│   ├── api/
│   ├── database/
│   ├── diagrams/
│   └── manuals/
│
├── docker/
│   ├── api.Dockerfile
│   ├── web.Dockerfile
│   └── postgres/
│
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── README.md
└── .env.example
```

## Estructura interna estándar de módulo backend

Todo módulo dentro de `apps/api/src/modules/` debe seguir esta forma:

```txt
module-name/
│
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── enums/
│   ├── rules/
│   ├── events/
│   └── repositories/
│
├── application/
│   ├── use-cases/
│   ├── dto/
│   └── services/
│
├── infrastructure/
│   ├── persistence/
│   ├── external/
│   └── mappers/
│
├── presentation/
│   ├── controllers/
│   ├── routes/
│   └── presenters/
│
└── module-name.module.ts
```

## Ejemplo específico: certificaciones

```txt
certificaciones/
│
├── domain/
│   ├── entities/
│   │   └── certificacion.entity.ts
│   ├── value-objects/
│   │   ├── monto.vo.ts
│   │   └── numero-certificacion.vo.ts
│   ├── enums/
│   │   └── estado-certificacion.enum.ts
│   ├── rules/
│   │   ├── validar-estructura-mef.rule.ts
│   │   ├── validar-saldo-disponible.rule.ts
│   │   ├── validar-certificacion-vigente.rule.ts
│   │   └── validar-documentos-habilitantes.rule.ts
│   └── repositories/
│       └── certificaciones.repository.ts
│
├── application/
│   ├── use-cases/
│   │   ├── crear-solicitud-certificacion.usecase.ts
│   │   ├── aprobar-certificacion.usecase.ts
│   │   ├── observar-certificacion.usecase.ts
│   │   ├── suscribir-certificacion.usecase.ts
│   │   ├── marcar-en-uso.usecase.ts
│   │   └── consultar-certificacion.usecase.ts
│   └── dto/
│       ├── crear-certificacion.dto.ts
│       ├── aprobar-certificacion.dto.ts
│       └── observar-certificacion.dto.ts
│
├── infrastructure/
│   ├── persistence/
│   │   └── certificaciones.repository.impl.ts
│   ├── pdf/
│   │   └── certificacion-pdf.service.ts
│   └── numbering/
│       └── numero-certificacion.service.ts
│
├── presentation/
│   ├── controllers/
│   │   └── certificaciones.controller.ts
│   └── routes/
│       └── certificaciones.routes.ts
│
└── certificaciones.module.ts
```
