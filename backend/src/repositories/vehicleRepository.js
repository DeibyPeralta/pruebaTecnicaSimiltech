const { pool } = require('../config/database');

async function findByPlate(plate, connection = pool) {
  const [rows] = await connection.execute('SELECT * FROM vehicles WHERE plate = :plate LIMIT 1', { plate });
  return rows[0] || null;
}

async function create(vehicle, connection = pool) {
  const [result] = await connection.execute(
    'INSERT INTO vehicles (plate, vehicle_type, created_at) VALUES (:plate, :vehicleType, NOW())',
    vehicle
  );
  return { id: result.insertId, plate: vehicle.plate, vehicle_type: vehicle.vehicleType };
}

async function update(vehicle, connection = pool) {
  await connection.execute(
    'UPDATE vehicles SET plate = :plate, vehicle_type = :vehicleType WHERE id = :id',
    vehicle
  );
}

module.exports = { findByPlate, create, update };
