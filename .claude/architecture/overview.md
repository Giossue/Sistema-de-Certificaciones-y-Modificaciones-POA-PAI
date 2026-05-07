# Visión arquitectónica

## Tipo de arquitectura

La arquitectura será un monorepo con Bun workspaces, frontend en React + Vite + HeroUI y backend en Bun + Hono. El sistema se mantiene como monolito modular, separando claramente módulos de dominio, aplicación, infraestructura y presentación.

## Estilo interno

Aplicar arquitectura modular orientada por dominio.

Cada módulo debe separar:

- Dominio.
- Aplicación.
- Infraestructura.
- Presentación.

## Capas

### Dominio

Contiene entidades, value objects, reglas de negocio, contratos de repositorios y eventos de dominio.

No depende de frameworks.

### Aplicación

Contiene casos de uso, DTOs de entrada/salida y orquestación de reglas.

No contiene detalles de base de datos ni HTTP.

### Infraestructura

Contiene implementación de repositorios, adaptadores de PDF, Excel, almacenamiento, correo, notificaciones y persistencia.

### Presentación

Contiene controladores, rutas, validadores HTTP, middlewares y serializadores.

## Principio transaccional

Toda operación que afecte saldo, estado, versión o auditoría debe ejecutarse dentro de una transacción.

Ejemplos:

- Emitir certificación.
- Suscribir certificación.
- Liquidar.
- Anular.
- Aplicar modificación POA.
- Importar cédula MEF.

## Eventos internos recomendados

- `CedulaMefVersionImported`
- `CertificacionSolicitada`
- `CertificacionSuscrita`
- `CertificacionAnulada`
- `CertificacionLiquidada`
- `ModificacionPoaSolicitada`
- `ModificacionPoaAplicada`
- `DevolucionFinancieroRegistrada`
- `SaldoBajoDetectado`

Estos eventos pueden implementarse primero de forma interna, sin mensajería externa.
