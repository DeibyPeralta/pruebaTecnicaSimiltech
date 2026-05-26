const { app } = require('./app');
const { env } = require('./config/env');

app.listen(env.port, () => {
  console.log(`Parqueadero API ejecutandose en http://localhost:${env.port}`);
  console.log(`Swagger disponible en http://localhost:${env.port}/docs`);
});
