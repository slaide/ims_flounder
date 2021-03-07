SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


CREATE TABLE `user` (
  SSN int NOT NULL,
  First_name varchar(40) NOT NULL,
  Last_name varchar(40) NOT NULL,
  Password varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  Admin tinyint(1) NOT NULL,
  Phone_number int NOT NULL,
  Email varchar(40) NOT NULL,
  Special_rights varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  Immunocompromised tinyint(1) NOT NULL,
  Maintenance tinyint(1) NOT NULL,
  Exist tinyint(1) NOT NULL,
  Token varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  Last_login datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `user` (SSN, First_name, Last_name, `Password`, Admin, Phone_number, Email, Special_rights, Immunocompromised, Maintenance, Exist, Token, Last_login) VALUES
(762324167, 'Ariel', 'Fin', 'e209fb92e970371a47315d874a8823cbaa37f918964fe455cc3d9543cf4f657125597771a792151567ed98abbd391bf5a1fc843414dac7d48fc49dc76761', 0, 703052249, 'ariel.fin@gmail.com', 'B', 1, 1, 1, '', '2021-03-05 13:10:27'),
(882767577, 'Sebastian', 'Crabb', '4eee8c359d9dc1cdc53224e7c35c2784874c2356dbdfec11d22fd29fe84dcc28cc303aae15f8cc7d80f5dd80846622525645d1ddd5bbbd2372a73c3b27b', 0, 762940501, 'seb.crabb@gmail.com', 'C', 0, 0, 1, '', '2021-03-05 13:10:27'),
(1450238774, 'Eric', 'Prince', '60fc8fb48bf583ec0efd151fa06eac84bf9a952b9abffac1a9bc5ad3468044cc84bce449af42b0a859afdb649ceefed22c6cdc94d5c56dcf64df62', 1, 709483940, 'eric.prince@gmail.com', 'A', 0, 1, 1, '', '2021-03-05 13:10:27');
#dfr456 this is ariels password
#cfr789 sebastian
#swq123 eric

ALTER TABLE `user`
  ADD PRIMARY KEY (SSN),
  ADD UNIQUE KEY Email (Email);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
