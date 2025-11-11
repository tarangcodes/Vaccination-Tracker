-- migrations/init_mysql.sql
CREATE DATABASE IF NOT EXISTS vaccination_db;
USE vaccination_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS children (
  id CHAR(36) PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  dob DATE NOT NULL,
  gender VARCHAR(32),
  blood_group VARCHAR(8),
  doses JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS parents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  relation VARCHAR(64),
  child_id CHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS vaccines (
  code VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  age VARCHAR(64)
);

INSERT IGNORE INTO vaccines (code, name, age) VALUES
('BCG','BCG','Birth'),
('OPV0','Oral Polio (0)','Birth'),
('HEP_B1','Hep B (1)','Birth'),
('PENTA1','Pentavalent (1)','6 Weeks'),
('OPV1','Oral Polio (1)','6 Weeks'),
('PCV1','PCV (1)','6 Weeks'),
('ROTA1','Rotavirus (1)','6 Weeks'),
('PENTA2','Pentavalent (2)','10 Weeks'),
('OPV2','Oral Polio (2)','10 Weeks'),
('PCV2','PCV (2)','10 Weeks'),
('ROTA2','Rotavirus (2)','10 Weeks'),
('PENTA3','Pentavalent (3)','14 Weeks'),
('OPV3','Oral Polio (3)','14 Weeks'),
('PCV3','PCV (3)','14 Weeks'),
('MEASLES1','Measles (1)','9 Months'),
('YF','Yellow Fever','9 Months'),
('MEASLES2','Measles (2)','15 Months');
