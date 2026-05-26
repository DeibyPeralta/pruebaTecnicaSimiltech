const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const { env } = require('./config/env');
const { parkingRoutes } = require('./routes/parkingRoutes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const { swaggerDocument } = require('./swagger');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.frontendOrigin }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/parking', parkingRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = { app };
