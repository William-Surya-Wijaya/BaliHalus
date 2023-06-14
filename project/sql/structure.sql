DROP TABLE IF EXISTS branch;

CREATE TABLE branch (
  id_branch INT AUTO_INCREMENT PRIMARY KEY,
  branch VARCHAR(50) NOT NULL,
  `location` TEXT NOT NULL,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME,
  deleted_at DATETIME
);

DROP TABLE IF EXISTS `group`;

CREATE TABLE `group` (
  id_group INT AUTO_INCREMENT PRIMARY KEY,
  `group` VARCHAR(50) NOT NULL,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME,
  deleted_at DATETIME
);

DROP TABLE IF EXISTS services;

CREATE TABLE services (
  id_service INT AUTO_INCREMENT PRIMARY KEY,
  `service` VARCHAR(50) NOT NULL,
  `banner` TEXT NOT NULL,
  `price` FLOAT NOT NULL,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW(),
  deleted_at DATETIME
);

DROP TABLE IF EXISTS transactions_mst;

CREATE TABLE transactions_mst (
    id_trans INT AUTO_INCREMENT PRIMARY KEY,
    trans_num VARCHAR(20),
    id_branch INT NOT NULL,
    id_user INT NOT NULL,
    id_service INT NOT NULL,
    reservation_time DATETIME,
    created_at DATETIME DEFAULT NOW(),
    deleted_at DATETIME
);

DROP TABLE IF EXISTS transactions_det;

CREATE TABLE transactions_det (
  id_trans_det INT AUTO_INCREMENT PRIMARY KEY,
  id_parent INT NOT NULL,
  id_variant_det INT NOT NULL,
  updated_at DATETIME DEFAULT NOW()
);

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    id_group INT NOT NULL,
    username VARCHAR(50),
    gender VARCHAR(10),
    `name` VARCHAR(255),
    `password` TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW(),
    deleted_at DATETIME
);

DROP TABLE IF EXISTS variant_mst;

CREATE TABLE variant_mst (
  id_variant INT AUTO_INCREMENT PRIMARY KEY,
  id_service INT,
  variant VARCHAR(50) NOT NULL,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW(),
  deleted_at DATETIME
);

DROP TABLE IF EXISTS variant_det;

CREATE TABLE variant_det (
  id_variant_det INT AUTO_INCREMENT PRIMARY KEY,
  id_parent INT NOT NULL,
  variant_det VARCHAR(50) NOT NULL,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW(),
  deleted_at DATETIME
);