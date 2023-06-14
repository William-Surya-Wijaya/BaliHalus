-- SERVICE
INSERT INTO services (`service`, `banner`, `price`) VALUES ('Spa', 'spa.jpg', '55000');
INSERT INTO services (`service`, `banner`, `price`) VALUES ('Body Massage', 'massage.jpg', '40000');
INSERT INTO services (`service`, `banner`, `price`) VALUES ('Reflection', 'refleksi.jpg', '35000');

-- VARIANT 
INSERT INTO variant_mst (`id_service`, `variant`) VALUES (1, 'Scrub');
INSERT INTO variant_mst (`id_service`, `variant`) VALUES (1, 'Mask');

INSERT INTO variant_mst (`id_service`, `variant`) VALUES (2, 'Oil');

INSERT INTO variant_det (`id_parent`, `variant_det`) VALUES (1, 'Strawberry');
INSERT INTO variant_det (`id_parent`, `variant_det`) VALUES (1, 'Coffee');
INSERT INTO variant_det (`id_parent`, `variant_det`) VALUES (1, 'Milk');
INSERT INTO variant_det (`id_parent`, `variant_det`) VALUES (1, 'Boreh');
INSERT INTO variant_det (`id_parent`, `variant_det`) VALUES (1, 'Sandalwood');
INSERT INTO variant_det (`id_parent`, `variant_det`) VALUES (1, 'Alpukat');

INSERT INTO variant_det (`id_parent`, `variant_det`) VALUES (2, 'Strawberry');
INSERT INTO variant_det (`id_parent`, `variant_det`) VALUES (2, 'Coffee');
INSERT INTO variant_det (`id_parent`, `variant_det`) VALUES (2, 'Milk');
INSERT INTO variant_det (`id_parent`, `variant_det`) VALUES (2, 'Boreh');
INSERT INTO variant_det (`id_parent`, `variant_det`) VALUES (2, 'Sandalwood');
INSERT INTO variant_det (`id_parent`, `variant_det`) VALUES (2, 'Alpukat');

INSERT INTO variant_det (`id_parent`, `variant_det`) VALUES (3, 'Rose');
INSERT INTO variant_det (`id_parent`, `variant_det`) VALUES (3, 'Jasmine');
INSERT INTO variant_det (`id_parent`, `variant_det`) VALUES (3, 'Sandalwood');
INSERT INTO variant_det (`id_parent`, `variant_det`) VALUES (3, 'Lemongrass');
INSERT INTO variant_det (`id_parent`, `variant_det`) VALUES (3, 'Lavender');
INSERT INTO variant_det (`id_parent`, `variant_det`) VALUES (3, 'Gragipani');

-- USERS
INSERT INTO users (id_group, username, gender, `name`, `password`, `phone`, `email`) VALUES (1, 'william05', 'Male','William Surya Wijaya', MD5('Aaaa1234'), '081313489781', 'william1412.surya@gmail.com');
INSERT INTO users (id_group, username, gender, `name`, `password`, `phone`, `email`) VALUES (2, 'user1234', 'Male','User', MD5('user1234'), '081313489781', 'user1234@gmail.com');

-- GROUP
INSERT INTO `group` (`group`) VALUES ('admin');
INSERT INTO `group` (`group`) VALUES ('user');

-- BRANCH
INSERT INTO `branch` (`branch`, `location`) VALUES ('Bali Halus - Cicadap', 'Jalan Ciumbuleuit No.49, Cidadap, Bandung, Jawa Barat');
INSERT INTO `branch` (`branch`, `location`) VALUES ('Bali Halus - Denpasar', 'Jalan P.B. Sudirman, Denpasar Barat, Denpasar, Bali');
INSERT INTO `branch` (`branch`, `location`) VALUES ('BaliHalus - Batununggal', 'Jalan Soekarno Hatta No.569, Batununggal, Bandung, Jawa Barat');
INSERT INTO `branch` (`branch`, `location`) VALUES ('BaliHalus - Citeutreup', 'Jalan Nusa Sari Utara II No.8, Citeureup, Cimahi, Jawa Barat');
INSERT INTO `branch` (`branch`, `location`) VALUES ('BaliHalus - Ronggur Nihuta', 'Jalan Sijambur No.12, Ronggur Nihuta, Samosir, Sumatera Utara');
INSERT INTO `branch` (`branch`, `location`) VALUES ('BaliHalus - Ngamprah', 'Jalan Permata Raya RT.10/RW.14, Ngamprah, Bandung Barat, Jawa Barat');
INSERT INTO `branch` (`branch`, `location`) VALUES ('BaliHalus - Penjaringan', 'Jalam Pantai Indah Kapuk Boulevard, Penjaringan, Jakarta Utara, DKI Jakarta');
INSERT INTO `branch` (`branch`, `location`) VALUES ('BaliHalus - Kota Baru', 'Jalan Naga Wijaya Wetan No.12, Padalarang, Bandung Barat, Jawa Barat');
INSERT INTO `branch` (`branch`, `location`) VALUES ('BaliHalus - Penjaringan', 'Jalam Pantai Indah Kapuk Boulevard, Penjaringan, Jakarta Utara, DKI Jakarta');
INSERT INTO `branch` (`branch`, `location`) VALUES ('BaliHalus - Mungkid', 'Jalan Soekarno Hatta No.32, Mungkid, Kabupaten Magelang, Jawa Tengah');
INSERT INTO `branch` (`branch`, `location`) VALUES ('BaliHalus - Penjaringan', 'Jalam Pantai Indah Kapuk Boulevard, Penjaringan, Jakarta Utara, DKI Jakarta');
INSERT INTO `branch` (`branch`, `location`) VALUES ('BaliHalus - Purbalingga', 'Jalan Letjen S Parman No.50, Purbalingga, Purbalingga, Jawa Tengah');