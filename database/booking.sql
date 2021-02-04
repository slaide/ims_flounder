-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Värd: 127.0.0.1:3306
-- Tid vid skapande: 04 feb 2021 kl 08:55
-- Serverversion: 8.0.21
-- PHP-version: 7.3.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Databas: `lims`
--

-- --------------------------------------------------------

--
-- Tabellstruktur `booking`
--

DROP TABLE IF EXISTS `booking`;
CREATE TABLE IF NOT EXISTS `booking` (
  `Note` varchar(40) NOT NULL DEFAULT 'NOT NULL',
  `Time` int NOT NULL,
  `Status` varchar(40) NOT NULL DEFAULT 'NOT NULL',
  `SSN` int NOT NULL,
  `Inst_ID` varchar(40) NOT NULL,
  PRIMARY KEY (`SSN`),
  UNIQUE KEY `Inst_ID` (`Inst_ID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumpning av Data i tabell `booking`
--

INSERT INTO `booking` (`Note`, `Time`, `Status`, `SSN`, `Inst_ID`) VALUES
('The instrument  will be used ', 9, 'Using ', 882767577, 'ins1');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
