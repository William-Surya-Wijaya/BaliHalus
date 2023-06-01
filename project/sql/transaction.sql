DROP TABLE IF EXISTS transactions_mst;

CREATE TABLE transactions_mst (
    id_trans INT AUTO_INCREMENT PRIMARY KEY,
    id_branch INT NOT NULL,
    id_room INT NOT NULL,
    id_service INT NOT NULL,
    reservation_time DATETIME,
    created_at DATETIME DEFAULT NOW(),
    deleted_at DATETIME
);

DROP TABLE IF EXISTS transcations_det;

CREATE TABLE transcations_det (
  id_trans_det INT AUTO_INCREMENT PRIMARY KEY,
  id_parent INT NOT NULL,
  id_variant_det INT NOT NULL
  updated_at DATETIME NOW()
);