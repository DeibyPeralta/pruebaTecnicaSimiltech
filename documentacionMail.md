# Documentacion API Email

Fuente analizada: `https://dev-sites.similtech.co/api-email/swagger/index.html`

OpenAPI: `3.0.1`
Titulo: `APISendEmail`
Version: `1.0`

## URL base

```text
https://dev-sites.similtech.co/api-email
```

En Swagger el servidor aparece como `/api-email`, por eso los endpoints completos se construyen usando el dominio anterior mas la ruta documentada.

## Flujo general de uso

1. Solicitar un token de autenticacion con `POST /api/token`.
2. Usar el token para consumir `POST /api/email/sendEmail`.
3. Enviar un `idMessage` unico por dia. Si se repite el mismo `idMessage` durante el dia, el servicio indica que no envia nuevamente el correo.

> Nota: el Swagger no declara explicitamente el esquema de seguridad, pero el endpoint de envio documenta respuesta `401 Unauthorized`. En la integracion se debe enviar el token recibido en el endpoint `/api/token`, normalmente mediante el encabezado `Authorization: Bearer <token>`, salvo que el proveedor indique otro formato.

## Endpoint: obtener token

Genera el token de autenticacion necesario para consumir los demas metodos expuestos.

```http
POST /api/token
Content-Type: application/json
```

URL completa:

```text
https://dev-sites.similtech.co/api-email/api/token
```

### Body

Objeto de tipo `User`.

| Campo | Tipo | Requerido | Descripcion |
| --- | --- | --- | --- |
| `username` | `string` | No especificado en Swagger | Usuario para autenticacion. |
| `password` | `string` | No especificado en Swagger | Contrasena para autenticacion. |

Ejemplo:

```json
{
  "username": "usuario",
  "password": "contrasena"
}
```

### Respuestas

| Codigo | Descripcion |
| --- | --- |
| `200` | Success. |

El Swagger no especifica el esquema exacto de la respuesta del token.

### Ejemplo cURL

```bash
curl -X POST "https://dev-sites.similtech.co/api-email/api/token" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "usuario",
    "password": "contrasena"
  }'
```

## Endpoint: enviar correo

Controlador para el envio generico de mensajes por correo electronico.

```http
POST /api/email/sendEmail
Content-Type: application/json
Authorization: Bearer <token>
```

URL completa:

```text
https://dev-sites.similtech.co/api-email/api/email/sendEmail
```

### Body

Objeto de tipo `Email`.

| Campo | Tipo | Requerido | Descripcion |
| --- | --- | --- | --- |
| `configParams` | `Configparams` | Si | Parametros de identificacion del consumo y del mensaje. |
| `receivers` | `Receivers` | Si | Destinatarios del correo. |
| `email` | `ConfigEmail` | Si | Configuracion y contenido del correo. |

### Modelo `Configparams`

| Campo | Tipo | Requerido | Descripcion |
| --- | --- | --- | --- |
| `idUser` | `string` | Si | Identificador del API desde donde se realiza el consumo. |
| `idMessage` | `string` | Si | Identificador unico del mensaje. Debe enviarse una sola vez en el dia; si se envia mas de una vez, no se envia el correo. |

### Modelo `Receivers`

| Campo | Tipo | Requerido | Descripcion |
| --- | --- | --- | --- |
| `emailOrigen` | `string` | No | Correo origen para enviar el correo. |
| `to` | `string[]` | Si | Lista de correos destinatarios. |
| `copyTo` | `string[]` | No | Lista de correos en copia. |
| `hiddenCopyTo` | `string[]` | No | Lista de correos en copia oculta. |

### Modelo `ConfigEmail`

| Campo | Tipo | Requerido | Descripcion |
| --- | --- | --- | --- |
| `subject` | `string` | Si | Asunto del correo electronico. |
| `urlHeader` | `string` | No | URL de la imagen que se envia en la parte inicial del correo. |
| `urlFooter` | `string` | No | URL de la imagen que se envia en la parte final del correo. |
| `message` | `string` | Si | Cuerpo del correo electronico. |
| `url_files` | `string[]` | No | Lista de URLs de archivos adjuntos o relacionados. |

### Ejemplo de body

```json
{
  "configParams": {
    "idUser": "parqueadero-api",
    "idMessage": "salida-vehiculo-20260525-0001"
  },
  "receivers": {
    "emailOrigen": "notificaciones@empresa.com",
    "to": [
      "cliente@correo.com"
    ],
    "copyTo": [],
    "hiddenCopyTo": []
  },
  "email": {
    "subject": "Comprobante de salida",
    "urlHeader": "https://example.com/header.png",
    "urlFooter": "https://example.com/footer.png",
    "message": "Su vehiculo ha salido del parqueadero. Total pagado: $12000.",
    "url_files": []
  }
}
```

### Respuestas

El endpoint puede responder un arreglo de objetos `CoreResponse`.

| Codigo | Descripcion | Body |
| --- | --- | --- |
| `200` | Retorna una respuesta valida. | `CoreResponse[]` |
| `401` | Unauthorized. | No especificado. |
| `500` | Server Error. | `CoreResponse[]` |

Modelo `CoreResponse`:

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `resultCode` | `integer` | Codigo de resultado de la operacion. |
| `message` | `string` | Mensaje descriptivo. |
| `data` | `any` | Datos adicionales, si aplica. |

Ejemplo posible de respuesta:

```json
[
  {
    "resultCode": 200,
    "message": "Correo enviado correctamente",
    "data": null
  }
]
```

### Ejemplo cURL

```bash
curl -X POST "https://dev-sites.similtech.co/api-email/api/email/sendEmail" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "configParams": {
      "idUser": "parqueadero-api",
      "idMessage": "salida-vehiculo-20260525-0001"
    },
    "receivers": {
      "emailOrigen": "notificaciones@empresa.com",
      "to": ["cliente@correo.com"],
      "copyTo": [],
      "hiddenCopyTo": []
    },
    "email": {
      "subject": "Comprobante de salida",
      "urlHeader": "https://example.com/header.png",
      "urlFooter": "https://example.com/footer.png",
      "message": "Su vehiculo ha salido del parqueadero. Total pagado: $12000.",
      "url_files": []
    }
  }'
```

## Recomendaciones de integracion

1. Generar un `idMessage` unico por evento de negocio, por ejemplo `salida-vehiculo-{fecha}-{idRegistro}`.
2. Validar localmente que `to`, `subject`, `message`, `idUser` e `idMessage` no esten vacios antes de llamar la API.
3. Manejar `401` solicitando un nuevo token o reportando credenciales invalidas.
4. Manejar `500` leyendo el arreglo `CoreResponse[]` para mostrar o registrar el mensaje devuelto por el servicio.
5. Evitar reenviar el mismo `idMessage` si se requiere que el correo sea enviado nuevamente; para un reintento real se debe confirmar con el proveedor si conserva idempotencia o bloqueo por dia.

## Resumen de rutas

| Metodo | Ruta | Uso |
| --- | --- | --- |
| `POST` | `/api/token` | Obtener token de autenticacion. |
| `POST` | `/api/email/sendEmail` | Enviar correo electronico. |
