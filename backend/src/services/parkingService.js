const { pool } = require('../config/database');
const { AppError } = require('../errors/AppError');
const vehicleRepository = require('../repositories/vehicleRepository');
const parkingRepository = require('../repositories/parkingRepository');
const emailNotificationRepository = require('../repositories/emailNotificationRepository');
const emailClient = require('../clients/emailClient');
const { normalizePlate } = require('../utils/plate');
const { env } = require('../config/env');

const TARIFF_PER_MINUTE = 50;

async function registerEntry(data) {
  const plate = normalizePlate(data.plate);
  const entryDateTime = data.entryDateTime ? new Date(data.entryDateTime) : new Date();

  if (Number.isNaN(entryDateTime.getTime())) {
    throw new AppError('La fecha de ingreso no es valida', 400);
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    let vehicle = await vehicleRepository.findByPlate(plate, connection);
    if (!vehicle) {
      vehicle = await vehicleRepository.create({ plate, vehicleType: data.vehicleType }, connection);
    }

    const activeRecord = await parkingRepository.findActiveByVehicleId(vehicle.id, connection);
    if (activeRecord) {
      throw new AppError('El vehiculo ya tiene un ingreso activo', 409);
    }

    const record = await parkingRepository.create(
      { vehicleId: vehicle.id, entryDateTime, tariffPerMinute: TARIFF_PER_MINUTE },
      connection
    );

    await connection.commit();
    return record;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function registerExit(plateInput) {
  const plate = normalizePlate(plateInput);
  const connection = await pool.getConnection();
  let record;

  try {
    await connection.beginTransaction();
    const activeRecord = await parkingRepository.findActiveByPlate(plate, connection);
    if (!activeRecord) {
      throw new AppError('No existe un ingreso activo para la placa indicada', 404);
    }

    const exitDateTime = new Date();
    const entryDateTime = new Date(activeRecord.entry_datetime);
    const totalMinutes = Math.max(1, Math.ceil((exitDateTime.getTime() - entryDateTime.getTime()) / 60000));
    const totalAmount = totalMinutes * activeRecord.tariff_per_minute;

    record = await parkingRepository.close(
      { id: activeRecord.id, exitDateTime, totalMinutes, totalAmount },
      connection
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  const emailResult = await emailClient.sendExitNotification(record);
  try {
    await emailNotificationRepository.create({
      parkingRecordId: record.id,
      recipient: env.email.to.join(',') || 'sin-destinatario-configurado',
      status: emailResult.sent ? 'SENT' : 'FAILED',
      responseMessage: emailResult.message
    });
  } catch (error) {
    console.error('No fue posible auditar el envio de correo', error);
  }

  return {
    ...record,
    email: emailResult.sent
      ? { sent: true, message: emailResult.message }
      : { sent: false, warning: `Salida registrada, pero el correo no fue enviado: ${emailResult.message}` }
  };
}

async function updateActiveRecord(id, data) {
  const plate = normalizePlate(data.plate);
  const entryDateTime = new Date(data.entryDateTime);

  if (Number.isNaN(entryDateTime.getTime())) {
    throw new AppError('La fecha de ingreso no es valida', 400);
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const activeRecord = await parkingRepository.findActiveById(id, connection);
    if (!activeRecord) {
      throw new AppError('No existe un registro activo para editar', 404);
    }

    const vehicleWithPlate = await vehicleRepository.findByPlate(plate, connection);
    if (vehicleWithPlate && vehicleWithPlate.id !== activeRecord.vehicle_id) {
      const duplicateActive = await parkingRepository.findActiveByVehicleId(vehicleWithPlate.id, connection);
      if (duplicateActive) {
        throw new AppError('La placa indicada ya tiene un ingreso activo', 409);
      }
      throw new AppError('La placa indicada ya esta registrada en otro vehiculo', 409);
    }

    await vehicleRepository.update(
      { id: activeRecord.vehicle_id, plate, vehicleType: data.vehicleType },
      connection
    );

    const record = await parkingRepository.updateEntryDateTime({ id, entryDateTime }, connection);
    await connection.commit();
    return record;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function listActive() {
  return parkingRepository.listActive();
}

async function getRecord(id) {
  const record = await parkingRepository.findById(id);
  if (!record) {
    throw new AppError('Registro de parqueadero no encontrado', 404);
  }
  return record;
}

async function getDashboard() {
  return parkingRepository.getDashboard();
}

module.exports = { registerEntry, registerExit, updateActiveRecord, listActive, getRecord, getDashboard };
