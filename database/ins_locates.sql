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
-- Tabellstruktur `ins_locates`
--

DROP TABLE IF EXISTS `ins_locates`;
CREATE TABLE IF NOT EXISTS `ins_locates` (
  `Start_time/Date` int NOT NULL,
  `End_time/Date` int NOT NULL,
  `Room_ID` varchar(40) NOT NULL,
  `Ins_ID` varchar(40) NOT NULL,
  PRIMARY KEY (`Room_ID`,`Ins_ID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumpning av Data i tabell `ins_locates`
--

INSERT INTO `ins_locates` (`Start_time/Date`, `End_time/Date`, `Room_ID`, `Ins_ID`) VALUES
(20210116, 20210322, 'r1', 'ins4'),
(20210116, 20210322, 'r1', 'ins5'),
(20210116, 20210322, 'r1', 'wb3'),
(20210116, 20210322, 'r1', 'wb4'),
(20210116, 20210322, 'r2', 'ins1'),
(20210116, 20210322, 'r2', 'wb1'),
(20210116, 20210322, 'r3', 'ins2'),
(20210116, 20210322, 'r3', 'wb5');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
