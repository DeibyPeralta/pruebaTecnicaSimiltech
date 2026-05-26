const { pool } = require('../config/database');

async function create(notification, connection = pool) {
  await connection.execute(
    `INSERT INTO email_notifications (parking_record_id, recipient, status, response_message, created_at)
     VALUES (:parkingRecordId, :recipient, :status, :responseMessage, NOW())`,
    notification
  );
}

module.exports = { create };
