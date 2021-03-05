SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


CREATE TABLE booking (
  Booking_ID int NOT NULL,
  SSN int NOT NULL,
  Ins_ID int NOT NULL,
  Start_Time datetime NOT NULL,
  End_Time datetime NOT NULL,
  Status varchar(40) NOT NULL,
  Note varchar(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO booking (Booking_ID, SSN, Ins_ID, Start_Time, End_Time, `Status`, Note) VALUES
(1, 1450238774, 1, '2021-02-10 12:00:00', '2021-02-10 13:00:00', 'Working', 'The instrument  will be used '),
(2, 762324167, 5, '2021-02-04 13:00:00', '2021-02-04 14:00:00', 'Working ', 'Everything works just fine '),
(3, 882767577, 3, '2021-02-24 10:00:00', '2021-02-24 11:00:00', 'Working', 'The filter needs to be changed '),
(4, 882767577, 4, '2021-02-16 10:00:00', '2021-02-16 11:00:00', 'Working ', 'Everything works just fine '),
(8, 1450238774, 5, '2021-05-19 10:00:00', '2021-05-19 11:00:00', 'instrument will be used ', 'clean and ready to be used '),
(9, 882767577, 6, '2021-04-15 11:00:00', '2021-04-15 12:00:00', 'Clean ', 'Everything works just fine '),
(10, 762324167, 4, '2021-06-01 14:00:00', '2021-06-01 14:00:00', 'Will be used ', 'The filter needs to be changed '),
(11, 762324167, 5, '2021-04-02 08:00:00', '2021-04-02 09:00:00', 'instrument will be used ', 'workes fine '),
(12, 762324167, 9, '2021-05-26 09:00:00', '2021-05-26 10:00:00', 'Clean ', 'Ok ');


ALTER TABLE booking
  ADD PRIMARY KEY (Booking_ID),
  ADD KEY SSN (SSN),
  ADD KEY Ins_ID (Ins_ID);


ALTER TABLE booking
  MODIFY Booking_ID int NOT NULL AUTO_INCREMENT;


ALTER TABLE booking
  ADD CONSTRAINT booking_ibfk_1 FOREIGN KEY (SSN) REFERENCES `user` (SSN) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT booking_ibfk_2 FOREIGN KEY (Ins_ID) REFERENCES instrument (Ins_ID) ON DELETE RESTRICT ON UPDATE RESTRICT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
