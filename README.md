# Solucion Parqueadero

Proyecto generado con base en `examen.md`: frontend Angular, backend Node/Express, script MySQL, Swagger y coleccion Postman.

## Estructura

- `backend`: API REST para ingresos, salidas, calculo de tarifa y envio de correo.
- `frontend`: aplicacion Angular para operar el parqueadero.
- `database/schema.sql`: creacion de base de datos y tablas MySQL.
- `postman/parqueadero.postman_collection.json`: coleccion para probar endpoints.

## Requisitos

- Node.js 20 o superior.
- MySQL 8 o superior.
- Angular CLI opcional, o usar `npx ng serve` desde `frontend`.

## Base de Datos

Ejecutar el script:

```bash
mysql -u root -p < database/schema.sql
```

## Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Configura `.env` con los datos reales de MySQL, las credenciales del API de correo y el destinatario `EMAIL_TO`. Opcionalmente puedes definir `EMAIL_FROM`, `EMAIL_COPY_TO` y `EMAIL_HIDDEN_COPY_TO`.

La documentacion Swagger queda en:

```text
http://localhost:3000/docs
```

## Frontend

```bash
cd frontend
npm install
npm start
```

La aplicacion queda en:

```text
http://localhost:4200
```

## Endpoints Principales

- `POST /api/parking/entries`: registra ingreso.
- `POST /api/parking/exits/:plate`: registra salida y calcula el pago.
- `GET /api/parking/active`: lista vehiculos activos.
- `GET /api/parking/records/:id`: consulta un registro.

## Reglas Implementadas

- Placas normalizadas en mayusculas.
- Tipos permitidos: `Carro` y `Moto`.
- Un vehiculo no puede tener dos ingresos activos.
- La salida calcula minutos y valor total con tarifa fija de `$50` por minuto.
- El correo se intenta enviar despues de persistir la salida; si falla, la salida no se revierte y se guarda el intento.
