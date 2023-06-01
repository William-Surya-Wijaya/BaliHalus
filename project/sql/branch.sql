DROP TABLE IF EXISTS branch;

CREATE TABLE branch (
  id_branch INT AUTO_INCREMENT PRIMARY KEY,
  branch VARCHAR(50) NOT NULL,
  `location` TEXT NOT NULL,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME,
  deleted_at DATETIME
);