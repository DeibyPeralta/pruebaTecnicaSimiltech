const { AppError } = require('../errors/AppError');

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const details = error.details.map((item) => item.message);
      return next(new AppError('Datos de entrada invalidos', 400, details));
    }
    req.body = value;
    return next();
  };
}

module.exports = { validate };
