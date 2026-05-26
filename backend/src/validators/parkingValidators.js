const Joi = require('joi');

const entrySchema = Joi.object({
  vehicleType: Joi.string().valid('Carro', 'Moto').required().messages({
    'any.only': 'El tipo de vehiculo debe ser Carro o Moto',
    'any.required': 'El tipo de vehiculo es obligatorio'
  }),
  plate: Joi.string().trim().min(3).max(10).required().messages({
    'string.empty': 'La placa es obligatoria',
    'any.required': 'La placa es obligatoria'
  }),
  entryDateTime: Joi.date().iso().optional()
});

module.exports = { entrySchema };
