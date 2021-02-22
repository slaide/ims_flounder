SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


CREATE TABLE instrument (
  Ins_ID varchar(40) NOT NULL,
  Description varchar(40) NOT NULL DEFAULT 'NOT NULL',
  Serial int NOT NULL,
  Proc_date date NOT NULL,
  Room_ID varchar(40) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO instrument (Ins_ID, Description, `Serial`, Proc_date, Room_ID) VALUES
('ins1', 'Mass spec ', 6047, '2020-12-14', 'r2'),
('ins2', 'Laser ', 5282, '2021-01-02', 'r3'),
('ins4', 'Pipette 3000', 3940, '2020-12-30', 'r1'),
('ins3', 'Pipette', 2016, '2021-01-24', 'r3'),
('ins5', 'Mass spec 2000', 1244, '2021-01-24', 'r1'),
('wb1', 'Workbech ', 5656, '2021-02-03', 'r2'),
('wb2', 'Workbech ', 4096, '2020-12-01', 'r3'),
('wb3', 'Workbech ', 2687, '2021-02-01', 'r1'),
('wb4', 'Workbech ', 3487, '2020-12-14', 'r1');


ALTER TABLE instrument
  ADD PRIMARY KEY (Ins_ID);
ALTER TABLE instrument ADD FULLTEXT KEY Room_ID (Room_ID);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
