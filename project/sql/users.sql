DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    id_group INT NOT NULL,
    username VARCHAR(50),
    `name` VARCHAR(255),
    `password` TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME,
    deleted_at DATETIME
);