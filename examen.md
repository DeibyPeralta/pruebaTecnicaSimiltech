Objetivo
Diseñar e implementar una aplicación para la gestión de un parqueadero que permita
registrar el ingreso y salida de vehículos (carros y motos), calcular el valor a pagar
según el tiempo de permanencia, notificar la salida vía correo electrónico mediante un
API externo (Ver documentación) y diseñar el esquema de una base de datos
relacional.
Alcance General
La solución debe contar con un Frontend desarrollado en Angular y un backend node,
incluyendo el diseño e implementación de una base de datos relacional.
Requerimientos Funcionales
1. Gestión de Vehículos
• Registrar el ingreso de vehículos con la siguiente información:
o Tipo de vehículo (Carro / Moto)
o Placa
o Fecha y hora de ingreso
• Registrar la salida de vehículos:
o Fecha y hora de salida (automática)
o Cálculo del tiempo total de permanencia en minutos

2. Cálculo de Tarifa
• El valor por pagar debe calcularse con base en:
o Tiempo total de permanencia en minutos
o Tarifa fija de $50 por minuto
• El sistema debe permitir visualizar:
o Tiempo total
o Valor total por pagar

3. Envío de Correo Electrónico
• Al registrar la salida del vehículo:
o Se debe consumir un API externo de envío de correo electrónico
(documentación y endpoint serán proporcionados).
o El correo debe incluir como mínimo:
▪ Placa del vehículo
▪ Tipo de vehículo
▪ Tiempo total
▪ Valor pagado
Documentación API Email
- https://dev-sites.similtech.co/api-email/swagger/index.html
- Usuario: proceso_pruebas
- Contraseña: das487d32_*
Requerimientos Técnicos
Frontend
• Tecnología: Angular
• Requisitos:
o Interfaz clara
o Formularios para ingreso y salida de vehículos
o Listar carros activos en el parqueadero
o Consumo de API REST

Backend
• Tecnología a elección:
o .NET Framework / .NET Core / Python / Lenguaje que prefieras
• Requisitos:
o API REST

o Integración con API externa de correo
o Manejo adecuado de errores

Base de Datos Relacional
• Base de datos relacional:
o MySQL
o Entrega de scripts SQL para la creación de la base de datos y sus
respectivas tablas
Requerimientos No Funcionales
• Código limpio y mantenible
• Aplicación de principios SOLID
Criterios de Evaluación
• Arquitectura y organización del proyecto
• Buenas prácticas de desarrollo
• Manejo de errores
• Calidad del código
• Uso de principios SOLID
• Diseño de base de datos
• Manejo de APIs
• Experiencia de usuario
• Uso correcto de Git
Entregables
• Código fuente frontend y backend
• Script SQL
• Colección Postman o Swagger
• Repositorio Git