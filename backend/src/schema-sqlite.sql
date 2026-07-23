CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  package_type TEXT NOT NULL CHECK (package_type IN ('4', '8')),
  sessions_total INTEGER NOT NULL,
  sessions_used INTEGER NOT NULL DEFAULT 0,
  free_absences_used INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  started_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);

CREATE TABLE IF NOT EXISTS class_days (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_date TEXT NOT NULL UNIQUE,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_day_id INTEGER NOT NULL,
  enrollment_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
  session_number INTEGER NOT NULL,
  session_burned INTEGER NOT NULL DEFAULT 0,
  marked_at TEXT DEFAULT (datetime('now')),
  UNIQUE (class_day_id, enrollment_id),
  FOREIGN KEY (class_day_id) REFERENCES class_days(id) ON DELETE CASCADE,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
);
