SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


CREATE TABLE `user` (
  `SSN` int(11) NOT NULL,
  `First_name` varchar(40) NOT NULL,
  `Last_name` varchar(40) NOT NULL,
  `Password` int(11) NOT NULL,
  `Admin` varchar(40) NOT NULL,
  `Phone_number` int(11) NOT NULL,
  `Email` varchar(40) NOT NULL,
  `Special_Rights` varchar(40) NOT NULL,
  `Immunocompromised` varchar(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `user` (`SSN`, `First_name`, `Last_name`, `Password`, `Admin`, `Phone_number`, `Email`, `Special_Rights`, `Immunocompromised`) VALUES
(1450238774, 'Eric', 'Princ ', 123456, 'Yes', 709483940, 'eric.princ@gmail.com', 'A', 'No'),
(762324167, 'Ariel', 'Fin', 45678, 'No', 703052249, 'ariel.fin@gmail.com', 'B', 'Yes'),
(882767577, 'Sebastian', 'Carbb', 65789, 'No', 762940501, 'seb.crabb@gmail.com', 'C', 'No');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
