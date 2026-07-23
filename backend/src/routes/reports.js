import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/completed', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.id AS student_id, s.name,
              e.id AS enrollment_id, e.package_type, e.sessions_total,
              e.sessions_used, e.completed_at,
              e.free_absences_used
       FROM enrollments e
       JOIN students s ON s.id = e.student_id
       WHERE e.status = 'completed'
       ORDER BY e.completed_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/active-summary', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.id AS student_id, s.name,
              e.id AS enrollment_id, e.package_type,
              e.sessions_total, e.sessions_used, e.free_absences_used,
              (e.sessions_total - e.sessions_used) AS sessions_remaining,
              COALESCE(
                (SELECT MAX(session_number) FROM attendance WHERE enrollment_id = e.id),
                0
              ) AS sessions_attended
       FROM enrollments e
       JOIN students s ON s.id = e.student_id
       WHERE e.status = 'active'
       ORDER BY sessions_remaining ASC, s.name ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
