-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Värd: 127.0.0.1:3306
-- Tid vid skapande: 04 feb 2021 kl 08:54
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
-- Tabellstruktur `ins_maintenance`
--

DROP TABLE IF EXISTS `ins_maintenance`;
CREATE TABLE IF NOT EXISTS `ins_maintenance` (
  `Date` int NOT NULL,
  `Time` int NOT NULL,
  `Status` varchar(40) NOT NULL,
  `Notes` varchar(40) NOT NULL,
  `Inst_ID` varchar(40) NOT NULL,
  `SSN` int NOT NULL,
  PRIMARY KEY (`Inst_ID`,`SSN`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumpning av Data i tabell `ins_maintenance`
--

INSERT INTO `ins_maintenance` (`Date`, `Time`, `Status`, `Notes`, `Inst_ID`, `SSN`) VALUES
(20210129, 9, 'Working', 'fixed loose rotor ', 'ins1', 1450238774);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
