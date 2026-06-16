/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.18-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: siwaras
-- ------------------------------------------------------
-- Server version	10.11.18-MariaDB-ubu2204

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
-- Table structure for table `MedicalRecord`
--

DROP TABLE IF EXISTS `MedicalRecord`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `MedicalRecord` (
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
  CONSTRAINT `MedicalRecord_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MedicalRecord`
--

LOCK TABLES `MedicalRecord` WRITE;
/*!40000 ALTER TABLE `MedicalRecord` DISABLE KEYS */;
INSERT INTO `MedicalRecord` VALUES
('2f341db7-66f8-46a2-a4be-ad9acf65c072','7c8e411f-7d3a-4616-98ee-ac5cb9cf170d','2026-06-08 23:31:48.432','145/95',210,250,6.5,80,165,1,'LOW',NULL,29.38,'bahaya','bahaya','bahaya','waspada',1,'2026-06-08 23:31:48.432');
/*!40000 ALTER TABLE `MedicalRecord` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Patient`
--

DROP TABLE IF EXISTS `Patient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Patient` (
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
  CONSTRAINT `Patient_pedukuhanId_fkey` FOREIGN KEY (`pedukuhanId`) REFERENCES `Pedukuhan` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Patient`
--

LOCK TABLES `Patient` WRITE;
/*!40000 ALTER TABLE `Patient` DISABLE KEYS */;
INSERT INTO `Patient` VALUES
('7c8e411f-7d3a-4616-98ee-ac5cb9cf170d','3402160101780001','Budi Santoso',45,'MALE','Dusun Gluntung Kidul RT 01',NULL,'268252c8-3da1-4531-8c2f-548f5507b92a','2026-06-08 23:31:48.423','2026-06-08 23:31:48.423');
/*!40000 ALTER TABLE `Patient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Pedukuhan`
--

DROP TABLE IF EXISTS `Pedukuhan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Pedukuhan` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Pedukuhan_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Pedukuhan`
--

LOCK TABLES `Pedukuhan` WRITE;
/*!40000 ALTER TABLE `Pedukuhan` DISABLE KEYS */;
INSERT INTO `Pedukuhan` VALUES
('268252c8-3da1-4531-8c2f-548f5507b92a','Gluntung Kidul','2026-06-08 23:31:48.082','2026-06-08 23:31:48.082'),
('2aeb51f3-3230-4598-b5ab-41c95ac2cef7','Korowelang','2026-06-08 23:31:48.134','2026-06-08 23:31:48.134'),
('44b4acfd-24fe-4063-be35-cfab7371be04','Gumulan','2026-06-08 23:31:48.089','2026-06-08 23:31:48.089'),
('46882847-957c-4162-ab15-72c0fed7f0dc','Samparan','2026-06-08 23:31:48.115','2026-06-08 23:31:48.115'),
('6437109c-e438-41d2-bf03-fcb5fcf5df95','Bogem','2026-06-08 23:31:48.150','2026-06-08 23:31:48.150'),
('68cbaf3f-e78c-484f-b89d-e6efbc65241f','Banyuurip','2026-06-08 23:31:48.161','2026-06-08 23:31:48.161'),
('7f0929ab-e131-487f-99c5-51ff03644bb3','Tegallayang 10','2026-06-08 23:31:48.123','2026-06-08 23:31:48.123'),
('83a7f4a5-adba-4b1c-90a7-f99c7b668c5b','Gluntung Lor','2026-06-08 23:31:48.167','2026-06-08 23:31:48.167'),
('964e8f27-7281-4e25-aac2-5e15e4547fce','Krapakan','2026-06-08 23:31:48.107','2026-06-08 23:31:48.107'),
('c9706949-913c-46d9-85c9-58b807e3de61','Tegalsempu','2026-06-08 23:31:48.097','2026-06-08 23:31:48.097'),
('db6f09e1-4b73-4757-bed3-c47df0530635','Kuroboyo','2026-06-08 23:31:48.129','2026-06-08 23:31:48.129'),
('eb8c69eb-4148-4913-963a-2439f15c2b60','Tegallayang 9','2026-06-08 23:31:48.119','2026-06-08 23:31:48.119'),
('ff11c377-48d5-4782-9880-d55b4c750274','Tunjungan','2026-06-08 23:31:48.103','2026-06-08 23:31:48.103'),
('ff4d0fd2-365d-4119-8266-5cd31d90bd35','Glagahan','2026-06-08 23:31:48.138','2026-06-08 23:31:48.138');
/*!40000 ALTER TABLE `Pedukuhan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
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
  CONSTRAINT `User_pedukuhanId_fkey` FOREIGN KEY (`pedukuhanId`) REFERENCES `Pedukuhan` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES
('0fc4216b-8096-4e81-9ea5-b377190c1000','worker1','$2b$10$bLlPOlCZ6G.srkd42TbfzO9BCmyjIthfVQpcnwh9kzsujVkDroyie','HEALTH_WORKER','Nakes Desa 1','268252c8-3da1-4531-8c2f-548f5507b92a','2026-06-08 23:31:48.336','2026-06-08 23:31:48.336'),
('16d35254-fbc2-4dc0-aac8-1f699fa8a8be','kades','$2b$10$3S4N6shHE53sRZgRgi8sWup3B53ogfxqW4DdyeOrBCzd5g7In/RYe','VILLAGE_HEAD','Kepala Desa',NULL,'2026-06-08 23:31:48.418','2026-06-08 23:31:48.418'),
('53b0f5d0-bc4a-4efe-82c2-dea523164f3d','admin','$2b$10$Swg92f9vPXKFO0sVqeemCe.l9eeKVQZGDNlObGURQueL5.aUJ6edu','ADMIN','Super Admin',NULL,'2026-06-08 23:31:48.253','2026-06-08 23:31:48.253');
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-08 23:51:39
