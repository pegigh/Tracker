import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

router.get('/today', async (_req, res) => {
  try {
    const date = todayDate();
    let classDay = await getOrCreateClassDay(date);
    const detail = await getClassDayDetail(classDay.id);
    res.json(detail);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:date', async (req, res) => {
  try {
    const classDay = await getOrCreateClassDay(req.params.date);
    const detail = await getClassDayDetail(classDay.id);
    res.json(detail);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const date = req.body.date || todayDate();
  try {
    const classDay = await getOrCreateClassDay(date, req.body.notes);
    const detail = await getClassDayDetail(classDay.id);
    res.status(201).json(detail);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function getOrCreateClassDay(date, notes = null) {
  const [existing] = await pool.query(
    'SELECT * FROM class_days WHERE class_date = ?',
    [date]
  );
  if (existing.length > 0) return existing[0];

  const [result] = await pool.query(
    'INSERT INTO class_days (class_date, notes) VALUES (?, ?)',
    [date, notes]
  );
  const [rows] = await pool.query('SELECT * FROM class_days WHERE id = ?', [
    result.insertId,
  ]);
  return rows[0];
}

async function getClassDayDetail(classDayId) {
  const [[classDay]] = await pool.query(
    'SELECT * FROM class_days WHERE id = ?',
    [classDayId]
  );

  const [attendance] = await pool.query(
    `SELECT a.id, a.status, a.session_number, a.session_burned,
            s.id AS student_id, s.name AS student_name,
            e.id AS enrollment_id, e.package_type,
            e.sessions_total, e.sessions_used,
            (e.sessions_total - e.sessions_used) AS sessions_remaining
     FROM attendance a
     JOIN enrollments e ON e.id = a.enrollment_id
     JOIN students s ON s.id = e.student_id
     WHERE a.class_day_id = ?
     ORDER BY a.marked_at ASC`,
    [classDayId]
  );

  const [availableStudents] = await pool.query(
    `SELECT s.id, s.name,
            e.id AS enrollment_id, e.package_type,
            e.sessions_total, e.sessions_used,
            (e.sessions_total - e.sessions_used) AS sessions_remaining,
            COALESCE(
              (SELECT MAX(session_number) + 1 FROM attendance WHERE enrollment_id = e.id),
              1
            ) AS next_session_number
     FROM students s
     JOIN enrollments e ON e.student_id = s.id AND e.status = 'active'
     WHERE e.id NOT IN (
       SELECT enrollment_id FROM attendance WHERE class_day_id = ?
     )
     ORDER BY s.name ASC`,
    [classDayId]
  );

  return {
    ...classDay,
    attendance,
    availableStudents,
  };
}

export default router;
