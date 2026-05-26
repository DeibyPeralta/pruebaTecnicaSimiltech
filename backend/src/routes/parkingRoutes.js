const { Router } = require('express');
const parkingController = require('../controllers/parkingController');
const { validate } = require('../middlewares/validate');
const { entrySchema } = require('../validators/parkingValidators');

const router = Router();

router.post('/entries', validate(entrySchema), parkingController.registerEntry);
router.post('/exits/:plate', parkingController.registerExit);
router.get('/active', parkingController.listActive);
router.get('/records/:id', parkingController.getRecord);

module.exports = { parkingRoutes: router };
