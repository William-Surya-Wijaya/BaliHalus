DROP TABLE IF EXISTS rooms;

CREATE TABLE rooms (
    id_room INT AUTO_INCREMENT PRIMARY KEY,
    id_room_type INT NOT NULL,
    id_branch INT NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    status INT(1),
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME NOW(),
    deleted_at DATETIME
);
DROP TABLE IF EXISTS roomtypes;

CREATE TABLE roomtypes (
  id_room_type INT AUTO_INCREMENT PRIMARY KEY,
  room_type VARCHAR(50) NOT NULL,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME NOW(),
  deleted_at DATETIME
);