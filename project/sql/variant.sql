DROP TABLE IF EXISTS variant_mst;

CREATE TABLE variant_mst (
  id_variant INT AUTO_INCREMENT PRIMARY KEY,
  id_service INT,
  variant VARCHAR(50) NOT NULL,
  variant VARCHAR(50) NOT NULL,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME,
  deleted_at DATETIME
)

DROP TABLE IF EXISTS variant_det;

CREATE TABLE variant_det (
  id_variant_det INT AUTO_INCREMENT PRIMARY KEY,
  id_parent INT NOT NULL,
  variant_det VARCHAR(50) NOT NULL,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME,
  deleted_at DATETIME
)