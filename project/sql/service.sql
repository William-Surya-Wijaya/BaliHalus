DROP TABLE IF EXISTS services;

CREATE TABLE services (
  id_service INT AUTO_INCREMENT PRIMARY KEY,
  `service` VARCHAR(50) NOT NULL,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME,
  deleted_at DATETIME
);