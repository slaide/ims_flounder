SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


CREATE TABLE ins_maintenance (
  Date date NOT NULL,
  Time time NOT NULL,
  Status varchar(40) NOT NULL,
  Notes varchar(40) NOT NULL,
  Ins_ID varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  SSN int NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO ins_maintenance (`Date`, `Time`, `Status`, Notes, Ins_ID, SSN) VALUES
('2021-01-29', '10:00:09', 'Working', 'fixed loose rotor ', 'ins1', 1450238774);


ALTER TABLE ins_maintenance
  ADD PRIMARY KEY (Ins_ID,SSN);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
