-- MySQL dump 10.13  Distrib 9.6.0, for macos14.8 (arm64)
--
-- Host: localhost    Database: publicsafety_db
-- ------------------------------------------------------
-- Server version	8.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `location_sessions`
--

DROP TABLE IF EXISTS `location_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `location_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `started_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `ended_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `location_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location_sessions`
--

LOCK TABLES `location_sessions` WRITE;
/*!40000 ALTER TABLE `location_sessions` DISABLE KEYS */;
INSERT INTO `location_sessions` VALUES (1,1,'2026-02-28 16:31:15','2026-02-28 16:31:35',0),(2,1,'2026-02-28 16:33:11','2026-02-28 16:33:11',0),(3,1,'2026-02-28 16:33:11','2026-02-28 16:33:25',0),(4,1,'2026-02-28 16:33:29','2026-02-28 16:33:32',0),(5,1,'2026-02-28 16:37:51',NULL,1);
/*!40000 ALTER TABLE `location_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `session_id` int DEFAULT NULL,
  `latitude` decimal(9,6) NOT NULL,
  `longitude` decimal(9,6) NOT NULL,
  `accuracy` float DEFAULT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `session_id` (`session_id`),
  CONSTRAINT `locations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `locations_ibfk_2` FOREIGN KEY (`session_id`) REFERENCES `location_sessions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES (1,1,1,34.650646,-82.859071,10.73,'2026-02-28 16:31:25'),(2,1,1,34.650646,-82.859071,9.47126,'2026-02-28 16:31:32'),(3,1,1,34.650646,-82.859071,9.47126,'2026-02-28 16:31:33'),(4,1,1,34.650646,-82.859071,9.48157,'2026-02-28 16:31:34'),(5,1,3,34.650646,-82.859071,9.96674,'2026-02-28 16:33:11'),(6,1,3,34.650646,-82.859071,9.96674,'2026-02-28 16:33:11'),(7,1,3,34.650646,-82.859071,9.96674,'2026-02-28 16:33:12'),(8,1,3,34.650646,-82.859071,9.96674,'2026-02-28 16:33:12'),(9,1,3,34.650646,-82.859071,9.96673,'2026-02-28 16:33:13'),(10,1,3,34.650646,-82.859071,9.96771,'2026-02-28 16:33:13'),(11,1,3,34.650646,-82.859071,9.96771,'2026-02-28 16:33:14'),(12,1,3,34.650646,-82.859071,9.96772,'2026-02-28 16:33:14'),(13,1,3,34.650646,-82.859071,9.96772,'2026-02-28 16:33:15'),(14,1,3,34.650646,-82.859071,9.9715,'2026-02-28 16:33:15'),(15,1,3,34.650646,-82.859071,9.9715,'2026-02-28 16:33:16'),(16,1,3,34.650646,-82.859071,9.97548,'2026-02-28 16:33:16'),(17,1,3,34.650646,-82.859071,9.97548,'2026-02-28 16:33:17'),(18,1,3,34.650646,-82.859071,9.97991,'2026-02-28 16:33:17'),(19,1,3,34.650646,-82.859071,9.97991,'2026-02-28 16:33:18'),(20,1,3,34.650646,-82.859071,9.96089,'2026-02-28 16:33:18'),(21,1,3,34.650646,-82.859071,9.96114,'2026-02-28 16:33:19'),(22,1,NULL,34.650646,-82.859071,9.37247,'2026-02-28 16:33:25'),(23,1,NULL,34.650646,-82.859071,9.37247,'2026-02-28 16:33:25'),(24,1,NULL,34.650646,-82.859071,9.37247,'2026-02-28 16:33:26'),(25,1,NULL,34.650646,-82.859071,9.37082,'2026-02-28 16:33:27'),(26,1,NULL,34.650646,-82.859071,9.36924,'2026-02-28 16:33:28'),(27,1,4,34.650646,-82.859071,9.37109,'2026-02-28 16:33:29'),(28,1,4,34.650646,-82.859071,9.37109,'2026-02-28 16:33:29'),(29,1,4,34.650646,-82.859071,9.37109,'2026-02-28 16:33:30'),(30,1,4,34.650646,-82.859071,9.35694,'2026-02-28 16:33:30'),(31,1,4,34.650646,-82.859071,9.35684,'2026-02-28 16:33:31'),(32,1,4,34.650646,-82.859071,9.37458,'2026-02-28 16:33:31'),(33,1,4,34.650646,-82.859071,9.37319,'2026-02-28 16:33:32'),(34,1,NULL,34.650646,-82.859071,9.37381,'2026-02-28 16:33:32'),(35,1,NULL,34.650646,-82.859071,9.37381,'2026-02-28 16:33:33'),(36,1,NULL,34.650646,-82.859071,9.42,'2026-02-28 16:33:34'),(37,1,5,34.650607,-82.858951,5.12788,'2026-02-28 16:37:51'),(38,1,5,34.650607,-82.858951,5.12788,'2026-02-28 16:37:52'),(39,1,5,34.650607,-82.858951,5.12788,'2026-02-28 16:37:53'),(40,1,5,34.650607,-82.858949,5.19501,'2026-02-28 16:37:54'),(41,1,5,34.650607,-82.858949,5.19501,'2026-02-28 16:37:55'),(42,1,5,34.650607,-82.858949,5.19501,'2026-02-28 16:37:56');
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trusted_contacts`
--

DROP TABLE IF EXISTS `trusted_contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trusted_contacts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `contact_user_id` int DEFAULT NULL,
  `contact_name` varchar(100) NOT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `contact_email` varchar(100) DEFAULT NULL,
  `status` enum('pending','accepted','blocked','invited') DEFAULT 'invited',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_contact` (`user_id`,`contact_user_id`),
  UNIQUE KEY `unique_phone_contact` (`user_id`,`contact_phone`),
  UNIQUE KEY `unique_email_contact` (`user_id`,`contact_email`),
  KEY `contact_user_id` (`contact_user_id`),
  CONSTRAINT `trusted_contacts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `trusted_contacts_ibfk_2` FOREIGN KEY (`contact_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_contact` CHECK (((`contact_phone` is not null) or (`contact_email` is not null)))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trusted_contacts`
--

LOCK TABLES `trusted_contacts` WRITE;
/*!40000 ALTER TABLE `trusted_contacts` DISABLE KEYS */;
/*!40000 ALTER TABLE `trusted_contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'email','email@test.com','$2b$12$/1rm7L9NLcDM1elW0XsXTOh5iTFHJiKbdzr4KgELP1My73mcnaoVC','9495620239','2026-02-28 10:45:21');
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

-- Dump completed on 2026-02-28 13:58:17
