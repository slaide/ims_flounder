-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Värd: 127.0.0.1:3306
-- Tid vid skapande: 03 feb 2021 kl 07:33
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
-- Tabellstruktur `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `SSN` int NOT NULL,
  `First_name` varchar(40) NOT NULL DEFAULT 'NOT NULL',
  `Last_name` varchar(40) NOT NULL DEFAULT 'NOT NULL',
  `Password` int NOT NULL,
  `Admin` varchar(40) NOT NULL DEFAULT 'NOT NULL',
  `Phone_number` int NOT NULL,
  `Email` varchar(40) NOT NULL DEFAULT 'NOT NULL',
  `Special_Rights` varchar(40) NOT NULL,
  PRIMARY KEY (`SSN`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumpning av Data i tabell `user`
--

INSERT INTO `user` (`SSN`, `First_name`, `Last_name`, `Password`, `Admin`, `Phone_number`, `Email`, `Special_Rights`) VALUES
(762324167, 'Ariel', 'Fin', 45678, 'No', 703052249, 'ariel.fin@gmail.com', 'B'),
(882767577, 'Sebastian', 'Carbb', 65789, 'No', 762940501, 'seb.crabb@gmail.com', 'C'),
(1450238774, 'Eric', 'Princ ', 123456, 'Yes', 709483940, 'eric.princ@gmail.com', 'A');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
