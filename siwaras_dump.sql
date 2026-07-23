-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: siwaras
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` varchar(255) NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` smallint(5) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medical_records`
--

DROP TABLE IF EXISTS `medical_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `medical_records` (
  `id` char(36) NOT NULL,
  `patient_id` char(36) NOT NULL,
  `date` date NOT NULL,
  `blood_pressure` varchar(20) DEFAULT NULL,
  `blood_sugar` decimal(8,2) DEFAULT NULL,
  `cholesterol` decimal(8,2) DEFAULT NULL,
  `uric_acid` decimal(8,2) DEFAULT NULL,
  `weight` decimal(6,2) DEFAULT NULL,
  `height` decimal(6,2) DEFAULT NULL,
  `smoking_status` tinyint(1) NOT NULL DEFAULT 0,
  `activity_level` enum('rendah','sedang','tinggi') DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `bmi` decimal(6,2) DEFAULT NULL,
  `blood_pressure_status` varchar(20) DEFAULT NULL,
  `blood_sugar_status` varchar(20) DEFAULT NULL,
  `cholesterol_status` varchar(20) DEFAULT NULL,
  `uric_acid_status` varchar(20) DEFAULT NULL,
  `is_risk` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `medical_records_patient_id_foreign` (`patient_id`),
  CONSTRAINT `medical_records_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_records`
--

LOCK TABLES `medical_records` WRITE;
/*!40000 ALTER TABLE `medical_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `medical_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicalrecord`
--

DROP TABLE IF EXISTS `medicalrecord`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `medicalrecord` (
  `id` varchar(191) NOT NULL,
  `patientId` varchar(191) NOT NULL,
  `date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `bloodPressure` varchar(191) NOT NULL,
  `bloodSugar` double NOT NULL,
  `cholesterol` double NOT NULL,
  `uricAcid` double NOT NULL DEFAULT 0,
  `weight` double NOT NULL,
  `height` double NOT NULL,
  `smokingStatus` tinyint(1) NOT NULL,
  `activityLevel` enum('LOW','MODERATE','HIGH') NOT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `bmi` double DEFAULT NULL,
  `bloodPressureStatus` varchar(191) DEFAULT NULL,
  `bloodSugarStatus` varchar(191) DEFAULT NULL,
  `cholesterolStatus` varchar(191) DEFAULT NULL,
  `uricAcidStatus` varchar(191) DEFAULT NULL,
  `isRisk` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `MedicalRecord_patientId_fkey` (`patientId`),
  CONSTRAINT `MedicalRecord_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patient` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicalrecord`
--

LOCK TABLES `medicalrecord` WRITE;
/*!40000 ALTER TABLE `medicalrecord` DISABLE KEYS */;
INSERT INTO `medicalrecord` VALUES ('2f341db7-66f8-46a2-a4be-ad9acf65c072','7c8e411f-7d3a-4616-98ee-ac5cb9cf170d','2026-06-08 23:31:48.432','145/95',210,250,6.5,80,165,1,'LOW',NULL,29.38,'bahaya','bahaya','bahaya','waspada',1,'2026-06-08 23:31:48.432');
/*!40000 ALTER TABLE `medicalrecord` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2026_06_10_154854_create_personal_access_tokens_table',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient`
--

DROP TABLE IF EXISTS `patient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patient` (
  `id` varchar(191) NOT NULL,
  `nik` varchar(191) DEFAULT NULL,
  `name` varchar(191) NOT NULL,
  `age` int(11) NOT NULL,
  `gender` enum('MALE','FEMALE') NOT NULL,
  `address` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `pedukuhanId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Patient_nik_key` (`nik`),
  KEY `Patient_pedukuhanId_fkey` (`pedukuhanId`),
  CONSTRAINT `Patient_pedukuhanId_fkey` FOREIGN KEY (`pedukuhanId`) REFERENCES `pedukuhan` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient`
--

LOCK TABLES `patient` WRITE;
/*!40000 ALTER TABLE `patient` DISABLE KEYS */;
INSERT INTO `patient` VALUES ('7c8e411f-7d3a-4616-98ee-ac5cb9cf170d','3402160101780001','Budi Santoso',45,'MALE','Dusun Gluntung Kidul RT 01',NULL,'268252c8-3da1-4531-8c2f-548f5507b92a','2026-06-08 23:31:48.423','2026-06-08 23:31:48.423');
/*!40000 ALTER TABLE `patient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patients` (
  `id` char(36) NOT NULL,
  `nik` varchar(20) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `age` int(11) NOT NULL,
  `gender` enum('MALE','FEMALE') NOT NULL,
  `address` text NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `pedukuhan_id` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `patients_nik_unique` (`nik`),
  KEY `patients_pedukuhan_id_foreign` (`pedukuhan_id`),
  CONSTRAINT `patients_pedukuhan_id_foreign` FOREIGN KEY (`pedukuhan_id`) REFERENCES `pedukuhans` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedukuhan`
--

DROP TABLE IF EXISTS `pedukuhan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pedukuhan` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Pedukuhan_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedukuhan`
--

LOCK TABLES `pedukuhan` WRITE;
/*!40000 ALTER TABLE `pedukuhan` DISABLE KEYS */;
INSERT INTO `pedukuhan` VALUES ('268252c8-3da1-4531-8c2f-548f5507b92a','Gluntung Kidul','2026-06-08 23:31:48.082','2026-06-08 23:31:48.082'),('2aeb51f3-3230-4598-b5ab-41c95ac2cef7','Korowelang','2026-06-08 23:31:48.134','2026-06-08 23:31:48.134'),('44b4acfd-24fe-4063-be35-cfab7371be04','Gumulan','2026-06-08 23:31:48.089','2026-06-08 23:31:48.089'),('46882847-957c-4162-ab15-72c0fed7f0dc','Samparan','2026-06-08 23:31:48.115','2026-06-08 23:31:48.115'),('6437109c-e438-41d2-bf03-fcb5fcf5df95','Bogem','2026-06-08 23:31:48.150','2026-06-08 23:31:48.150'),('68cbaf3f-e78c-484f-b89d-e6efbc65241f','Banyuurip','2026-06-08 23:31:48.161','2026-06-08 23:31:48.161'),('7f0929ab-e131-487f-99c5-51ff03644bb3','Tegallayang 10','2026-06-08 23:31:48.123','2026-06-08 23:31:48.123'),('83a7f4a5-adba-4b1c-90a7-f99c7b668c5b','Gluntung Lor','2026-06-08 23:31:48.167','2026-06-08 23:31:48.167'),('964e8f27-7281-4e25-aac2-5e15e4547fce','Krapakan','2026-06-08 23:31:48.107','2026-06-08 23:31:48.107'),('c9706949-913c-46d9-85c9-58b807e3de61','Tegalsempu','2026-06-08 23:31:48.097','2026-06-08 23:31:48.097'),('db6f09e1-4b73-4757-bed3-c47df0530635','Kuroboyo','2026-06-08 23:31:48.129','2026-06-08 23:31:48.129'),('eb8c69eb-4148-4913-963a-2439f15c2b60','Tegallayang 9','2026-06-08 23:31:48.119','2026-06-08 23:31:48.119'),('ff11c377-48d5-4782-9880-d55b4c750274','Tunjungan','2026-06-08 23:31:48.103','2026-06-08 23:31:48.103'),('ff4d0fd2-365d-4119-8266-5cd31d90bd35','Glagahan','2026-06-08 23:31:48.138','2026-06-08 23:31:48.138');
/*!40000 ALTER TABLE `pedukuhan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedukuhans`
--

DROP TABLE IF EXISTS `pedukuhans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pedukuhans` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedukuhans`
--

LOCK TABLES `pedukuhans` WRITE;
/*!40000 ALTER TABLE `pedukuhans` DISABLE KEYS */;
INSERT INTO `pedukuhans` VALUES ('05ec7562-a201-433c-b223-165b093db5c5','Tegallayang 9','2026-07-23 17:29:42','2026-07-23 17:29:42'),('16410241-6176-4862-b713-f7c4e0d05dc2','Tegallayang 10','2026-07-23 17:29:42','2026-07-23 17:29:42'),('2abb2d38-1d8e-4660-957a-ddef8477410f','Glagahan','2026-07-23 17:29:42','2026-07-23 17:29:42'),('2c697cb6-26a9-451e-bb70-a3ab948ea5b9','Kuroboyo','2026-07-23 17:29:42','2026-07-23 17:29:42'),('3615e5d1-e588-4535-8b75-62557210ea99','Bogem','2026-07-23 17:29:42','2026-07-23 17:29:42'),('39231be0-57b6-4a15-a181-a5d441ec8c01','Gluntung Kidul','2026-07-23 17:29:42','2026-07-23 17:29:42'),('75ae9ead-f321-430d-bb56-3b32fa142b1f','Banyuurip','2026-07-23 17:29:42','2026-07-23 17:29:42'),('786fa434-f380-484a-a800-448ad9de550b','Tunjungan','2026-07-23 17:29:42','2026-07-23 17:29:42'),('7882d166-5512-4aac-9dce-975baa54a4df','Tegalsempu','2026-07-23 17:29:42','2026-07-23 17:29:42'),('992cc8cd-163a-49d3-98b4-a1028c224eb8','Korowelang','2026-07-23 17:29:42','2026-07-23 17:29:42'),('c1566e50-466a-4903-82e6-455b85094645','Krapakan','2026-07-23 17:29:42','2026-07-23 17:29:42'),('d09b58d6-d9a2-4ac5-9b47-1f0f9073e208','Gumulan','2026-07-23 17:29:42','2026-07-23 17:29:42'),('d3e8aa89-da66-47db-b9b2-8464246eb802','Gluntung Lor','2026-07-23 17:29:42','2026-07-23 17:29:42'),('f85cf6a5-dd04-430b-b673-afd8962f029e','Samparan','2026-07-23 17:29:42','2026-07-23 17:29:42');
/*!40000 ALTER TABLE `pedukuhans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` char(36) NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` varchar(191) NOT NULL,
  `username` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `role` enum('ADMIN','HEALTH_WORKER','VILLAGE_HEAD') NOT NULL DEFAULT 'HEALTH_WORKER',
  `name` varchar(191) NOT NULL,
  `pedukuhanId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_username_key` (`username`),
  KEY `User_pedukuhanId_fkey` (`pedukuhanId`),
  CONSTRAINT `User_pedukuhanId_fkey` FOREIGN KEY (`pedukuhanId`) REFERENCES `pedukuhan` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('0fc4216b-8096-4e81-9ea5-b377190c1000','worker1','$2b$10$bLlPOlCZ6G.srkd42TbfzO9BCmyjIthfVQpcnwh9kzsujVkDroyie','HEALTH_WORKER','Nakes Desa 1','268252c8-3da1-4531-8c2f-548f5507b92a','2026-06-08 23:31:48.336','2026-06-08 23:31:48.336'),('16d35254-fbc2-4dc0-aac8-1f699fa8a8be','kades','$2b$10$3S4N6shHE53sRZgRgi8sWup3B53ogfxqW4DdyeOrBCzd5g7In/RYe','VILLAGE_HEAD','Kepala Desa',NULL,'2026-06-08 23:31:48.418','2026-06-08 23:31:48.418'),('53b0f5d0-bc4a-4efe-82c2-dea523164f3d','admin','$2b$10$Swg92f9vPXKFO0sVqeemCe.l9eeKVQZGDNlObGURQueL5.aUJ6edu','ADMIN','Super Admin',NULL,'2026-06-08 23:31:48.253','2026-06-08 23:31:48.253');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` enum('ADMIN','VILLAGE_HEAD','HEALTH_WORKER') NOT NULL DEFAULT 'HEALTH_WORKER',
  `pedukuhan_id` char(36) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_unique` (`username`),
  KEY `users_pedukuhan_id_foreign` (`pedukuhan_id`),
  CONSTRAINT `users_pedukuhan_id_foreign` FOREIGN KEY (`pedukuhan_id`) REFERENCES `pedukuhans` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('218c9708-f4d4-43d0-864f-4ac0a5900a12','kader_samparan','$2y$12$AjyqVjeFAL.g0OwPe0Ze4eSZGbldt2kOXfdQ93UydqSQejcPHalFu','Kader Samparan','HEALTH_WORKER','f85cf6a5-dd04-430b-b673-afd8962f029e',NULL,'2026-07-23 17:29:44','2026-07-23 17:29:44'),('29dfb62e-6cbf-4002-b9ec-4e9fee21ed02','kader_korowelang','$2y$12$QCtVk8f91hy.xsEFez5MkemPTWask7TmoLLMbYyU80QoRObE2w58.','Kader Korowelang','HEALTH_WORKER','992cc8cd-163a-49d3-98b4-a1028c224eb8',NULL,'2026-07-23 17:29:45','2026-07-23 17:29:45'),('5040bfe4-c74e-4ed7-9d5d-b2e0e52874ea','kader_kuroboyo','$2y$12$xOTtraLdke4pw/Jw0NQq4OnL3rUUb1r0auGlE9CktVvFHLbn2YVKe','Kader Kuroboyo','HEALTH_WORKER','2c697cb6-26a9-451e-bb70-a3ab948ea5b9',NULL,'2026-07-23 17:29:44','2026-07-23 17:29:44'),('553cb54d-5b4d-4164-9c2a-7320c32b59ea','kepala_desa','$2y$12$cKbh3v7bb/FJa9zMfDfMX.0woEjf8/zOulrnBLF4AV6tSOGdhcwHW','Kepala Desa','VILLAGE_HEAD',NULL,NULL,'2026-07-23 17:29:42','2026-07-23 17:29:42'),('5d92c3f1-cab6-4729-b0cd-8a16c5b2e6c4','kader_tegalsempu','$2y$12$qolnUlF6k3DmwRCWZdoHAuEV4xeJlnAc39QMPYHsDmCfjQj3toHNy','Kader Tegalsempu','HEALTH_WORKER','7882d166-5512-4aac-9dce-975baa54a4df',NULL,'2026-07-23 17:29:43','2026-07-23 17:29:43'),('64999067-35ed-4408-8cf9-ca2e58ba2ca2','kader_glagahan','$2y$12$klA743iqFqXDMuDpuawZkOC/J6NS/3YORBmq1GwVCKIp3q7xBA.Q2','Kader Glagahan','HEALTH_WORKER','2abb2d38-1d8e-4660-957a-ddef8477410f',NULL,'2026-07-23 17:29:45','2026-07-23 17:29:45'),('8485ffa1-4a4f-403e-ab3a-bb5932ad7fba','admin','$2y$12$/nZc61gBjIhMETpsgSnyWulBBQM/tdFKpLDdLqn/loic/9hDXwo2q','Administrator','ADMIN',NULL,NULL,'2026-07-23 17:29:42','2026-07-23 17:29:42'),('8e1138c5-ead2-4ead-9c61-5a9b5e02b72b','kader_gluntung_lor','$2y$12$e3vcK.lpGiTL0gOppQ15OuN9bl7utlCzgaC7p014qgJwkr6FxBkFy','Kader Gluntung Lor','HEALTH_WORKER','d3e8aa89-da66-47db-b9b2-8464246eb802',NULL,'2026-07-23 17:29:46','2026-07-23 17:29:46'),('97e6a59b-3249-45e8-8f3c-1e87d688f729','kader_tegallayang_9','$2y$12$wuF6wu4RgztWSPk/2SR/wuG1XHj4wSBtkFGUSHkfNr.yh/oo5cFka','Kader Tegallayang 9','HEALTH_WORKER','05ec7562-a201-433c-b223-165b093db5c5',NULL,'2026-07-23 17:29:44','2026-07-23 17:29:44'),('9e2fd52a-e24e-492b-94d6-72e959dbc348','kader_tunjungan','$2y$12$p0eRas1wNzaT4haJy8HS4epYqU1vvgT5nkqlCRw17yzZbDH6dMb/W','Kader Tunjungan','HEALTH_WORKER','786fa434-f380-484a-a800-448ad9de550b',NULL,'2026-07-23 17:29:43','2026-07-23 17:29:43'),('9e3828fb-ec7f-4b4a-b02c-59e23246fd3c','kader_bogem','$2y$12$haHU4jhUoChOvJXQu.BTneFBtyEoULPyqUu7mGC91mHKNd0Vc.7q2','Kader Bogem','HEALTH_WORKER','3615e5d1-e588-4535-8b75-62557210ea99',NULL,'2026-07-23 17:29:45','2026-07-23 17:29:45'),('bb8209ad-596c-4c3a-81c5-924fa6638850','kader_tegallayang_10','$2y$12$DXfZz7Wd7xUPsu.2c7tkUO4qDk1wCinyc5UPzYHX89XsVxC2vquAW','Kader Tegallayang 10','HEALTH_WORKER','16410241-6176-4862-b713-f7c4e0d05dc2',NULL,'2026-07-23 17:29:44','2026-07-23 17:29:44'),('c5228374-aabf-46f7-9648-06e084c044c4','kader_banyuurip','$2y$12$JzADCtDhJki9O.cza8hoPOfddKUP52eskjPQfXqsHqvrSBK6HMYOu','Kader Banyuurip','HEALTH_WORKER','75ae9ead-f321-430d-bb56-3b32fa142b1f',NULL,'2026-07-23 17:29:45','2026-07-23 17:29:45'),('c9f51e07-be96-4b3d-92da-353ecdf9d73c','kader_krapakan','$2y$12$GTuEG1ZUIoflcTHj695ExehTAqx6.U5akk9RtF8.Gv4vFrqhufkXy','Kader Krapakan','HEALTH_WORKER','c1566e50-466a-4903-82e6-455b85094645',NULL,'2026-07-23 17:29:44','2026-07-23 17:29:44'),('ca432973-8925-4b1e-8e7a-cb9991138e25','kader_gluntung_kidul','$2y$12$vRKHmxJUh3wApR0dtLDfIelCRMTFtquBwg/bdYpTLT2n041jT6/pG','Kader Gluntung Kidul','HEALTH_WORKER','39231be0-57b6-4a15-a181-a5d441ec8c01',NULL,'2026-07-23 17:29:43','2026-07-23 17:29:43'),('daf949ce-b5b4-4cc7-a93d-99469237035d','kader_gumulan','$2y$12$1N2Cnud/O6q/lpikU6P3NethZpmo55vMoNlSUnhTcu0FThYf2H2G.','Kader Gumulan','HEALTH_WORKER','d09b58d6-d9a2-4ac5-9b47-1f0f9073e208',NULL,'2026-07-23 17:29:43','2026-07-23 17:29:43');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-24  0:30:50
