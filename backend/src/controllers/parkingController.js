const parkingService = require('../services/parkingService');

async function registerEntry(req, res, next) {
  try {
    const record = await parkingService.registerEntry(req.body);
    return res.status(201).json(record);
  } catch (error) {
    return next(error);
  }
}

async function registerExit(req, res, next) {
  try {
    const record = await parkingService.registerExit(req.params.plate);
    return res.json(record);
  } catch (error) {
    return next(error);
  }
}

async function listActive(req, res, next) {
  try {
    const records = await parkingService.listActive();
    return res.json(records);
  } catch (error) {
    return next(error);
  }
}

async function getRecord(req, res, next) {
  try {
    const record = await parkingService.getRecord(req.params.id);
    return res.json(record);
  } catch (error) {
    return next(error);
  }
}

module.exports = { registerEntry, registerExit, listActive, getRecord };
