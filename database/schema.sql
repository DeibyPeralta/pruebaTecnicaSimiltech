CREATE DATABASE IF NOT EXISTS parqueadero_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE parqueadero_db;

CREATE TABLE IF NOT EXISTS vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plate VARCHAR(10) NOT NULL,
  vehicle_type ENUM('Carro', 'Moto') NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_vehicles_plate UNIQUE (plate)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS parking_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT NOT NULL,
  entry_datetime DATETIME NOT NULL,
  exit_datetime DATETIME NULL,
  total_minutes INT NULL,
  total_amount INT NULL,
  tariff_per_minute INT NOT NULL DEFAULT 50,
  active_vehicle_id INT GENERATED ALWAYS AS (CASE WHEN exit_datetime IS NULL THEN vehicle_id ELSE NULL END) STORED,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_parking_records_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  CONSTRAINT chk_exit_after_entry CHECK (exit_datetime IS NULL OR exit_datetime >= entry_datetime),
  CONSTRAINT chk_total_minutes CHECK (total_minutes IS NULL OR total_minutes > 0),
  CONSTRAINT chk_total_amount CHECK (total_amount IS NULL OR total_amount >= 0),
  CONSTRAINT chk_tariff_per_minute CHECK (tariff_per_minute = 50),
  CONSTRAINT uq_one_active_record_per_vehicle UNIQUE (active_vehicle_id),
  INDEX idx_parking_vehicle (vehicle_id),
  INDEX idx_parking_exit_datetime (exit_datetime),
  INDEX idx_parking_vehicle_exit (vehicle_id, exit_datetime)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS email_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parking_record_id INT NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  status ENUM('SENT', 'FAILED') NOT NULL,
  response_message TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_email_notifications_record FOREIGN KEY (parking_record_id) REFERENCES parking_records(id),
  INDEX idx_email_notifications_record (parking_record_id)
) ENGINE=InnoDB;

-- Vehiculos activos
SELECT v.plate, v.vehicle_type, pr.entry_datetime
FROM parking_records pr
JOIN vehicles v ON v.id = pr.vehicle_id
WHERE pr.exit_datetime IS NULL
ORDER BY pr.entry_datetime ASC;
