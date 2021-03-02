SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


CREATE TABLE `user` (
  SSN int NOT NULL,
  First_name varchar(40) NOT NULL,
  Last_name varchar(40) NOT NULL,
  Password varchar(40) NOT NULL,
  Admin tinyint(1) NOT NULL,
  Phone_number int NOT NULL,
  Email varchar(40) NOT NULL,
  Special_rights varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  Immunocompromised tinyint(1) NOT NULL,
  Maintenance tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `user` (SSN, First_name, Last_name, `Password`, Admin, Phone_number, Email, Special_rights, Immunocompromised, Maintenance) VALUES
(762324167, 'Ariel', 'Fin', 'dfr456', 0, 703052249, 'ariel.fin@gmail.com', 'B', 1, 1),
(882767577, 'Sebastian', 'Carbb', 'cfr789', 0, 762940501, 'seb.crabb@gmail.com', 'C', 0, 0),
(1450238774, 'Eric', 'Prince', 'swq123', 1, 709483940, 'eric.prince@gmail.com', 'A', 0, 1);


ALTER TABLE `user`
  ADD PRIMARY KEY (SSN);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
