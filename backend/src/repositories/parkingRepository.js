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

async function findActiveById(id, connection = pool) {
  const [rows] = await connection.execute(
    `SELECT pr.*, v.plate, v.vehicle_type
     FROM parking_records pr
     JOIN vehicles v ON v.id = pr.vehicle_id
     WHERE pr.id = :id AND pr.exit_datetime IS NULL
     LIMIT 1`,
    { id }
  );
  return rows[0] || null;
}

async function updateEntryDateTime(record, connection = pool) {
  await connection.execute(
    `UPDATE parking_records
     SET entry_datetime = :entryDateTime,
         updated_at = NOW()
     WHERE id = :id AND exit_datetime IS NULL`,
    record
  );
  return findById(record.id, connection);
}

async function getDashboard(connection = pool) {
  const currentDateTime = toMySqlDateTime(new Date());
  const [[activeSummary], [activeByType], [timeRanges], [revenueByType], [recentActive]] = await Promise.all([
    connection.execute(
      `SELECT COUNT(*) AS activeVehicles,
              SUM(CASE WHEN v.vehicle_type = 'Carro' THEN 1 ELSE 0 END) AS activeCars,
              SUM(CASE WHEN v.vehicle_type = 'Moto' THEN 1 ELSE 0 END) AS activeMotorcycles,
              COALESCE(ROUND(AVG(TIMESTAMPDIFF(MINUTE, pr.entry_datetime, :currentDateTime))), 0) AS averageActiveMinutes
       FROM parking_records pr
       JOIN vehicles v ON v.id = pr.vehicle_id
       WHERE pr.exit_datetime IS NULL`,
      { currentDateTime }
    ),
    connection.execute(
      `SELECT v.vehicle_type AS vehicleType, COUNT(*) AS total
       FROM parking_records pr
       JOIN vehicles v ON v.id = pr.vehicle_id
       WHERE pr.exit_datetime IS NULL
       GROUP BY v.vehicle_type`
    ),
    connection.execute(
      `SELECT CASE
                WHEN TIMESTAMPDIFF(MINUTE, pr.entry_datetime, :currentDateTime) <= 30 THEN '0 - 30 min'
                WHEN TIMESTAMPDIFF(MINUTE, pr.entry_datetime, :currentDateTime) <= 60 THEN '31 min - 1 h'
                WHEN TIMESTAMPDIFF(MINUTE, pr.entry_datetime, :currentDateTime) <= 120 THEN '1 h - 2 h'
                WHEN TIMESTAMPDIFF(MINUTE, pr.entry_datetime, :currentDateTime) <= 240 THEN '2 h - 4 h'
                ELSE '4 h+'
              END AS label,
              COUNT(*) AS total
       FROM parking_records pr
       WHERE pr.exit_datetime IS NULL
       GROUP BY label`,
      { currentDateTime }
    ),
    connection.execute(
      `SELECT v.vehicle_type AS vehicleType,
              COUNT(*) AS exitsToday,
              COALESCE(SUM(pr.total_amount), 0) AS revenue
       FROM parking_records pr
       JOIN vehicles v ON v.id = pr.vehicle_id
       WHERE pr.exit_datetime IS NOT NULL
         AND DATE(pr.exit_datetime) = CURDATE()
       GROUP BY v.vehicle_type`
    ),
    connection.execute(
      `SELECT pr.id,
              v.plate,
              v.vehicle_type AS vehicleType,
              pr.entry_datetime AS entryDateTime,
              TIMESTAMPDIFF(MINUTE, pr.entry_datetime, :currentDateTime) AS elapsedMinutes,
              TIMESTAMPDIFF(MINUTE, pr.entry_datetime, :currentDateTime) * pr.tariff_per_minute AS accumulatedAmount,
              pr.tariff_per_minute AS tariffPerMinute
       FROM parking_records pr
       JOIN vehicles v ON v.id = pr.vehicle_id
       WHERE pr.exit_datetime IS NULL
       ORDER BY pr.entry_datetime ASC
       LIMIT 5`,
      { currentDateTime }
    )
  ]);

  const [todayRows] = await connection.execute(
    `SELECT COUNT(*) AS entriesToday
     FROM parking_records
     WHERE DATE(entry_datetime) = CURDATE()`
  );

  return {
    summary: {
      activeVehicles: Number(activeSummary[0]?.activeVehicles || 0),
      activeCars: Number(activeSummary[0]?.activeCars || 0),
      activeMotorcycles: Number(activeSummary[0]?.activeMotorcycles || 0),
      averageActiveMinutes: Number(activeSummary[0]?.averageActiveMinutes || 0),
      entriesToday: Number(todayRows[0]?.entriesToday || 0),
      revenueToday: revenueByType.reduce((total, row) => total + Number(row.revenue || 0), 0),
      tariffPerMinute: 50
    },
    activeByType,
    timeRanges,
    revenueByType,
    recentActive
  };
}

function toMySqlDateTime(date) {
  const pad = (value) => value.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

module.exports = {
  findActiveByVehicleId,
  findActiveByPlate,
  create,
  close,
  listActive,
  findById,
  findActiveById,
  updateEntryDateTime,
  getDashboard
};
