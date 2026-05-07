# Convenciones de API

## Estilo

Usar REST JSON.

## Versionado

Prefijo recomendado:

```txt
/api/v1
```

## Nombres

Usar kebab-case para rutas.

Ejemplos:

```txt
GET /api/v1/cedula-mef/versions
POST /api/v1/cedula-mef/imports
GET /api/v1/certificaciones/:id
POST /api/v1/certificaciones
POST /api/v1/certificaciones/:id/submit
POST /api/v1/certificaciones/:id/approve
POST /api/v1/certificaciones/:id/sign
POST /api/v1/modificaciones-poa
POST /api/v1/modificaciones-poa/:id/apply
```

## Respuestas

Formato base exitoso:

```json
{
  "data": {},
  "meta": {}
}
```

Formato base de error:

```json
{
  "error": {
    "code": "SALDO_INSUFICIENTE",
    "message": "El saldo disponible es menor al monto solicitado.",
    "details": {}
  }
}
```

## Códigos de error de negocio

- `CEDULA_MEF_NO_VIGENTE`
- `ESTRUCTURA_MEF_INVALIDA`
- `SALDO_INSUFICIENTE`
- `CERTIFICACION_VIGENTE_DUPLICADA`
- `DOCUMENTOS_HABILITANTES_INCOMPLETOS`
- `FUENTE_NO_MODIFICABLE`
- `CERTIFICACION_CON_USO_NO_ANULABLE`
- `PERIODO_FISCAL_CERRADO`
- `PERMISO_DENEGADO`

## Paginación

Usar:

```txt
?page=1&pageSize=20
```

Respuesta:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```
