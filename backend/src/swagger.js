const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Parqueadero API',
    version: '1.0.0',
    description: 'API REST para registrar ingreso y salida de vehiculos'
  },
  servers: [{ url: 'http://localhost:3000' }],
  paths: {
    '/api/parking/entries': {
      post: {
        summary: 'Registrar ingreso de vehiculo',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['vehicleType', 'plate'],
                properties: {
                  vehicleType: { type: 'string', enum: ['Carro', 'Moto'] },
                  plate: { type: 'string', example: 'ABC123' },
                  entryDateTime: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Ingreso registrado' }, 409: { description: 'Vehiculo ya activo' } }
      }
    },
    '/api/parking/exits/{plate}': {
      post: {
        summary: 'Registrar salida de vehiculo y enviar correo',
        description: 'Calcula el tiempo y valor a pagar, persiste la salida y luego intenta enviar la notificacion por correo. Si el correo falla, la salida no se revierte y la respuesta incluye una advertencia.',
        parameters: [{ name: 'plate', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Salida registrada con resultado del intento de correo' },
          404: { description: 'Vehiculo activo no encontrado' }
        }
      }
    },
    '/api/parking/active': {
      get: {
        summary: 'Listar vehiculos activos',
        responses: { 200: { description: 'Listado de vehiculos activos' } }
      }
    },
    '/api/parking/dashboard': {
      get: {
        summary: 'Consultar metricas del dashboard',
        description: 'Retorna conteos de vehiculos activos, distribucion por tipo, rangos de permanencia, ingresos del dia y ultimos vehiculos activos.',
        responses: { 200: { description: 'Metricas del dashboard' } }
      }
    },
    '/api/parking/records/{id}': {
      get: {
        summary: 'Consultar registro por id',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Registro encontrado' }, 404: { description: 'Registro no encontrado' } }
      },
      put: {
        summary: 'Editar informacion de un vehiculo activo',
        description: 'Permite corregir placa, tipo de vehiculo y fecha/hora de ingreso antes de registrar la salida.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['vehicleType', 'plate', 'entryDateTime'],
                properties: {
                  vehicleType: { type: 'string', enum: ['Carro', 'Moto'] },
                  plate: { type: 'string', example: 'ABC123' },
                  entryDateTime: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Registro activo actualizado' },
          404: { description: 'Registro activo no encontrado' },
          409: { description: 'Placa duplicada' }
        }
      }
    }
  }
};

module.exports = { swaggerDocument };
