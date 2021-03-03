SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


CREATE TABLE room (
  Room_ID int NOT NULL,
  Area int NOT NULL,
  Building_code int NOT NULL,
  Capacity int NOT NULL,
  Class varchar(40) NOT NULL,
  Exist tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO room (Room_ID, `Area`, Building_code, Capacity, Class, Exist) VALUES
(1, 1374, 201, 5, 'C', 1),
(2, 1374, 201, 3, 'B', 1),
(3, 1374, 201, 2, 'A', 1);


ALTER TABLE room
  ADD PRIMARY KEY (Room_ID);


ALTER TABLE room
  MODIFY Room_ID int NOT NULL AUTO_INCREMENT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
