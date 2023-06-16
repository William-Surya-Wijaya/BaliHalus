/*
SQLyog Ultimate v12.5.1 (64 bit)
MySQL - 5.7.33 : Database - db_balihalus
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`db_balihalus` /*!40100 DEFAULT CHARACTER SET latin1 */;

USE `db_balihalus`;

/*Table structure for table `branch` */

DROP TABLE IF EXISTS `branch`;

CREATE TABLE `branch` (
  `id_branch` int(11) NOT NULL AUTO_INCREMENT,
  `branch` varchar(50) NOT NULL,
  `location` text NOT NULL,
  `status` varchar(10) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_branch`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;

/*Data for the table `branch` */

insert  into `branch`(`id_branch`,`branch`,`location`,`status`,`created_at`,`updated_at`,`deleted_at`) values 
(1,'Bali Halus - Cicadap','Jalan Ciumbuleuit No.49, Cidadap, Bandung, Jawa Barat','Active','2023-06-13 14:07:42','2023-06-14 20:08:06','2023-06-14 20:08:09'),
(2,'BaliHalus - Denpasar','Jalan P.B. Sudirman, Denpasar Barat, Denpasar, Bali','Active','2023-06-13 14:07:42','2023-06-14 20:23:18',NULL),
(3,'BaliHalus - Batununggal','Jalan Soekarno Hatta No.569, Batununggal, Bandung, Jawa Barat','Active','2023-06-13 14:07:42',NULL,NULL),
(4,'BaliHalus - Citeutreup','Jalan Nusa Sari Utara II No.8, Citeureup, Cimahi, Jawa Barat','Active','2023-06-13 14:07:42',NULL,NULL),
(5,'BaliHalus - Ronggur Nihuta','Jalan Sijambur No.12, Ronggur Nihuta, Samosir, Sumatera Utara','Active','2023-06-13 14:07:42',NULL,NULL),
(6,'BaliHalus - Ngamprah','Jalan Permata Raya RT.10/RW.14, Ngamprah, Bandung Barat, Jawa Barat','Active','2023-06-13 14:07:42',NULL,NULL),
(7,'BaliHalus - Penjaringan','Jalam Pantai Indah Kapuk Boulevard, Penjaringan, Jakarta Utara, DKI Jakarta','Active','2023-06-13 14:07:42',NULL,NULL),
(8,'BaliHalus - Kota Baru','Jalan Naga Wijaya Wetan No.12, Padalarang, Bandung Barat, Jawa Barat','Active','2023-06-13 14:07:42',NULL,NULL),
(9,'BaliHalus - Penjaringan','Jalam Pantai Indah Kapuk Boulevard, Penjaringan, Jakarta Utara, DKI Jakarta','Active','2023-06-13 14:07:42',NULL,NULL),
(10,'BaliHalus - Mungkid','Jalan Soekarno Hatta No.32, Mungkid, Kabupaten Magelang, Jawa Tengah','Active','2023-06-13 14:07:42',NULL,NULL),
(11,'BaliHalus - Penjaringan','Jalam Pantai Indah Kapuk Boulevard, Penjaringan, Jakarta Utara, DKI Jakarta','Active','2023-06-13 14:07:42',NULL,NULL),
(12,'BaliHalus - Purbalingga','Jalan Letjen S Parman No.50, Purbalingga, Purbalingga, Jawa Tengah','Active','2023-06-13 14:07:42','2023-06-14 20:03:48',NULL),
(13,'BaliHalus - Permata Cimahi','Permata Cimahi C3 No 11 Ngamprah, Tanimulya,  Bandung Barat,  Jawa Barat','Active','2023-06-14 19:38:41',NULL,'2023-06-14 20:03:41');

/*Table structure for table `group` */

DROP TABLE IF EXISTS `group`;

CREATE TABLE `group` (
  `id_group` int(11) NOT NULL AUTO_INCREMENT,
  `group` varchar(50) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_group`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

/*Data for the table `group` */

insert  into `group`(`id_group`,`group`,`created_at`,`updated_at`,`deleted_at`) values 
(1,'Admin','2023-06-13 14:07:42',NULL,NULL),
(2,'Customer','2023-06-13 14:07:42',NULL,NULL);

/*Table structure for table `rooms` */

DROP TABLE IF EXISTS `rooms`;

CREATE TABLE `rooms` (
  `id_room` int(11) NOT NULL AUTO_INCREMENT,
  `id_room_type` int(11) NOT NULL,
  `id_branch` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `status` int(1) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_room`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `rooms` */

/*Table structure for table `roomtypes` */

DROP TABLE IF EXISTS `roomtypes`;

CREATE TABLE `roomtypes` (
  `id_room_type` int(11) NOT NULL AUTO_INCREMENT,
  `room_type` varchar(50) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_room_type`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `roomtypes` */

/*Table structure for table `services` */

DROP TABLE IF EXISTS `services`;

CREATE TABLE `services` (
  `id_service` int(11) NOT NULL AUTO_INCREMENT,
  `service` varchar(50) NOT NULL,
  `banner` text NOT NULL,
  `price` float NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_service`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

/*Data for the table `services` */

insert  into `services`(`id_service`,`service`,`banner`,`price`,`created_at`,`updated_at`,`deleted_at`) values 
(1,'Spa','spa.jpg',55000,'2023-06-13 14:07:42','2023-06-13 14:07:42',NULL),
(2,'Body Massage','massage.jpg',40000,'2023-06-13 14:07:42','2023-06-13 14:07:42',NULL),
(3,'Reflection','refleksi.jpg',35000,'2023-06-13 14:07:42','2023-06-13 14:07:42',NULL),
(5,'Salon','Salon.jpg',30000,'2023-06-15 19:17:56','2023-06-15 19:17:56',NULL);

/*Table structure for table `transactions_det` */

DROP TABLE IF EXISTS `transactions_det`;

CREATE TABLE `transactions_det` (
  `id_trans_det` int(11) NOT NULL AUTO_INCREMENT,
  `id_parent` int(11) NOT NULL,
  `id_variant_det` int(11) NOT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_trans_det`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

/*Data for the table `transactions_det` */

insert  into `transactions_det`(`id_trans_det`,`id_parent`,`id_variant_det`,`updated_at`) values 
(1,1,4,'2023-06-13 18:57:28'),
(2,1,11,'2023-06-13 18:57:28'),
(3,2,1,'2023-06-13 22:51:36'),
(4,2,12,'2023-06-13 22:51:36'),
(5,3,15,'2023-06-14 08:56:11');

/*Table structure for table `transactions_mst` */

DROP TABLE IF EXISTS `transactions_mst`;

CREATE TABLE `transactions_mst` (
  `id_trans` int(11) NOT NULL AUTO_INCREMENT,
  `trans_num` varchar(20) DEFAULT NULL,
  `id_branch` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_service` int(11) NOT NULL,
  `reservation_time` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_trans`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

/*Data for the table `transactions_mst` */

insert  into `transactions_mst`(`id_trans`,`trans_num`,`id_branch`,`id_user`,`id_service`,`reservation_time`,`created_at`,`deleted_at`) values 
(1,'BL230614001',2,3,1,'2023-06-14 00:00:00','2023-06-13 18:57:28',NULL),
(2,'BL230613001',1,3,1,'2023-06-13 06:00:00','2023-06-13 22:51:36',NULL),
(3,'BL230608001',2,5,2,'2023-06-08 02:00:00','2023-06-14 08:56:11',NULL);

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id_user` int(11) NOT NULL AUTO_INCREMENT,
  `id_group` int(11) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `password` text,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

/*Data for the table `users` */

insert  into `users`(`id_user`,`id_group`,`username`,`gender`,`name`,`password`,`phone`,`email`,`created_at`,`updated_at`,`deleted_at`) values 
(3,1,'william05','Male','William Surya Wijaya','b5a73383e95ae2300af4d3fe0e7743c9','081313489781','william@gmail.com','2023-06-13 15:02:14','2023-06-13 15:02:14',NULL),
(4,1,'Aldi1234','Male','Aldi','b5a73383e95ae2300af4d3fe0e7743c9','123123123','123123','2023-06-13 22:58:25','2023-06-13 22:58:25','2023-06-14 18:57:47'),
(5,2,'kaezarrem','Male','Kae Zarren','cc0429d202976b47efb2c8bc49d1b812','123123','kae@gmail.com','2023-06-14 08:53:06','2023-06-14 08:53:06',NULL),
(6,1,'maria1234','Male','Maria Veronica','31b0fe2cf45d369acd04e886a96bc451','123132','312123','2023-06-14 11:11:45','2023-06-14 11:11:45','2023-06-14 20:23:39'),
(7,2,'pitobopeng','Male','Reynaldi Sepito','15e1cecaf28a344a535b8cf07fbd8a05','081313489781','pito@gmail.com','2023-06-14 19:06:52','2023-06-14 19:06:52',NULL);

/*Table structure for table `variant_det` */

DROP TABLE IF EXISTS `variant_det`;

CREATE TABLE `variant_det` (
  `id_variant_det` int(11) NOT NULL AUTO_INCREMENT,
  `id_parent` int(11) NOT NULL,
  `variant_det` varchar(50) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_variant_det`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=latin1;

/*Data for the table `variant_det` */

insert  into `variant_det`(`id_variant_det`,`id_parent`,`variant_det`,`created_at`,`updated_at`,`deleted_at`) values 
(1,1,'Strawberry','2023-06-13 14:07:42','2023-06-13 14:07:42',NULL),
(2,1,'Coffee','2023-06-13 14:07:42','2023-06-13 14:07:42',NULL),
(3,1,'Milk','2023-06-13 14:07:42','2023-06-13 14:07:42',NULL),
(4,1,'Boreh','2023-06-13 14:07:42','2023-06-13 14:07:42',NULL),
(5,1,'Sandalwood','2023-06-13 14:07:42','2023-06-13 14:07:42',NULL),
(6,1,'Alpukat','2023-06-13 14:07:42','2023-06-13 14:07:42',NULL),
(7,2,'Strawberry','2023-06-13 14:07:42','2023-06-13 14:07:42',NULL),
(8,2,'Coffee','2023-06-13 14:07:42','2023-06-13 14:07:42',NULL),
(9,2,'Milk','2023-06-13 14:07:42','2023-06-13 14:07:42',NULL),
(10,2,'Boreh','2023-06-13 14:07:42','2023-06-13 14:07:42',NULL),
(11,2,'Sandalwood','2023-06-13 14:07:42','2023-06-13 14:07:42',NULL),
(12,2,'Alpukat','2023-06-13 14:07:42','2023-06-13 14:07:42',NULL),
(13,3,'Rose','2023-06-13 14:07:42','2023-06-13 14:07:42',NULL),
(14,3,'Jasmine','2023-06-13 14:07:42','2023-06-13 14:07:42',NULL),
(15,3,'Sandalwood','2023-06-13 14:07:42','2023-06-13 14:07:42',NULL),
(16,3,'Lemongrass','2023-06-13 14:07:42','2023-06-13 14:07:42',NULL),
(17,3,'Lavender','2023-06-13 14:07:42','2023-06-13 14:07:42',NULL),
(18,3,'Gragipani','2023-06-13 14:07:42','2023-06-13 14:07:42',NULL),
(20,6,'Vanilla Ice Cream','2023-06-15 19:18:23','2023-06-15 19:18:23',NULL);

/*Table structure for table `variant_mst` */

DROP TABLE IF EXISTS `variant_mst`;

CREATE TABLE `variant_mst` (
  `id_variant` int(11) NOT NULL AUTO_INCREMENT,
  `id_service` int(11) DEFAULT NULL,
  `variant` varchar(50) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_variant`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

/*Data for the table `variant_mst` */

insert  into `variant_mst`(`id_variant`,`id_service`,`variant`,`created_at`,`updated_at`,`deleted_at`) values 
(1,1,'Scrub','2023-06-13 14:07:42','2023-06-13 14:07:42',NULL),
(2,1,'Mask','2023-06-13 14:07:42','2023-06-13 14:07:42',NULL),
(3,2,'Massage Oil','2023-06-13 14:07:42','2023-06-13 14:07:42',NULL),
(6,5,'Shampoo','2023-06-15 19:18:08','2023-06-15 19:18:08',NULL);

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
