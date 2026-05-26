const { pool } = require('../config/database');

async function findActiveByVehicleId(vehicleId, connection = pool) {
  const [rows] = await connection.execute(
    'SELECT * FROM parking_records WHERE vehicle_id = :vehicleId AND exit_datetime IS NULL LIMIT 1',
    { vehicleId }
  );
  return rows[0] || null;
}

async function findActiveByPlate(plate, connection = pool) {
  const [rows] = await connection.execute(
    `SELECT pr.*, v.plate, v.vehicle_type
     FROM parking_records pr
     JOIN vehicles v ON v.id = pr.vehicle_id
     WHERE v.plate = :plate AND pr.exit_datetime IS NULL
     LIMIT 1`,
    { plate }
  );
  return rows[0] || null;
}

async function create(record, connection = pool) {
  const [result] = await connection.execute(
    `INSERT INTO parking_records (vehicle_id, entry_datetime, tariff_per_minute, created_at)
     VALUES (:vehicleId, :entryDateTime, :tariffPerMinute, NOW())`,
    record
  );
  return findById(result.insertId, connection);
}

async function close(record, connection = pool) {
  await connection.execute(
    `UPDATE parking_records
     SET exit_datetime = :exitDateTime,
         total_minutes = :totalMinutes,
         total_amount = :totalAmount,
         updated_at = NOW()
     WHERE id = :id`,
    record
  );
  return findById(record.id, connection);
}

async function listActive(connection = pool) {
  const [rows] = await connection.execute(
    `SELECT pr.id, v.plate, v.vehicle_type AS vehicleType, pr.entry_datetime AS entryDateTime, pr.tariff_per_minute AS tariffPerMinute
     FROM parking_records pr
     JOIN vehicles v ON v.id = pr.vehicle_id
     WHERE pr.exit_datetime IS NULL
     ORDER BY pr.entry_datetime ASC`
  );
  return rows;
}

async function findById(id, connection = pool) {
  const [rows] = await connection.execute(
    `SELECT pr.id,
            v.plate,
            v.vehicle_type AS vehicleType,
            pr.entry_datetime AS entryDateTime,
            pr.exit_datetime AS exitDateTime,
            pr.total_minutes AS totalMinutes,
            pr.total_amount AS totalAmount,
            pr.tariff_per_minute AS tariffPerMinute
     FROM parking_records pr
     JOIN vehicles v ON v.id = pr.vehicle_id
     WHERE pr.id = :id
     LIMIT 1`,
    { id }
  );
  return rows[0] || null;
}

module.exports = { findActiveByVehicleId, findActiveByPlate, create, close, listActive, findById };
