CREATE DATABASE IF NOT EXISTS class_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE class_tracker;

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  package_type ENUM('4', '8') NOT NULL,
  sessions_total INT NOT NULL,
  sessions_used INT NOT NULL DEFAULT 0,
  free_absences_used INT NOT NULL DEFAULT 0,
  status ENUM('active', 'completed') NOT NULL DEFAULT 'active',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  INDEX idx_enrollments_status (status)
);

CREATE TABLE IF NOT EXISTS class_days (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_date DATE NOT NULL UNIQUE,
  notes VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_day_id INT NOT NULL,
  enrollment_id INT NOT NULL,
  status ENUM('present', 'absent') NOT NULL,
  session_number INT NOT NULL,
  session_burned TINYINT(1) NOT NULL DEFAULT 0,
  marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_day_enrollment (class_day_id, enrollment_id),
  FOREIGN KEY (class_day_id) REFERENCES class_days(id) ON DELETE CASCADE,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
);
