# Módulos del sistema

## auth

Autenticación, sesiones, tokens, recuperación de contraseña y control de acceso inicial.

## usuarios

Gestión de usuarios institucionales y relación con unidades.

## roles-permisos

Roles, permisos y autorización granular.

## catalogos

Catálogos base:

- Programas institucionales.
- Actividades presupuestarias de referencia.
- Ítems presupuestarios.
- Fuentes.
- Unidades.
- Motivos de modificación.
- Modos de liquidación.
- Estados.

## periodos-fiscales

Años fiscales, periodo activo, bloqueo de periodos cerrados y configuración anual.

## cedula-mef

Importación, validación, versionado y consulta de cédula presupuestaria MEF.

Responsabilidades:

- Parsear Excel.
- Validar columnas.
- Crear versión inmutable.
- Comparar versiones.
- Exponer combinaciones válidas.

## poa

POA versionado, actividades, responsables, montos planificados y relación con periodo fiscal.

Responsabilidades:

- Crear versión inicial.
- Consultar actividades vigentes.
- Crear nuevas versiones tras modificación.
- Mantener historial.

## certificaciones

Solicitud, validación, aprobación, generación, suscripción, estados y numeración de certificaciones POA/PAI.

## modificaciones-poa

Solicitud, validación, aprobación y aplicación de modificaciones POA.

Regla crítica:

- Nunca modificar fuente de financiamiento.

## saldos

Motor central de cálculo de saldos.

Este módulo debe ser la única fuente para cálculos de saldo.

## liquidaciones

Liquidaciones parciales o totales, modo A y modo B.

## anulaciones

Anulación de certificaciones sin uso.

## devoluciones-financiero

Registro de devoluciones, causas, reenvío y análisis para mejora de validaciones.

## documentos

Generación, almacenamiento y recuperación de PDFs.

Documentos base:

- Certificación POA.
- Certificación PAI.
- Memorando.
- Informe técnico de modificación.
- Documento de liquidación/anulación.

## reportes

Paneles, indicadores y exportaciones.

## auditoria

Registro transversal de acciones críticas.

## notificaciones

Notificaciones internas, recordatorios y alertas de saldo bajo.
