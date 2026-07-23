import { Router } from 'express';
import { pool } from '../db.js';
import { getPackageRules, getActiveEnrollment } from '../services/attendance.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.name,
              e.id AS enrollment_id, e.package_type, e.sessions_total,
              e.sessions_used, e.free_absences_used, e.status,
              (e.sessions_total - e.sessions_used) AS sessions_remaining
       FROM students s
       LEFT JOIN enrollments e ON e.student_id = s.id AND e.status = 'active'
       ORDER BY s.name ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { name, packageType } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (!['4', '8'].includes(packageType)) {
    return res.status(400).json({ error: 'Package type must be 4 or 8' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [studentResult] = await conn.query(
      'INSERT INTO students (name) VALUES (?)',
      [name.trim()]
    );
    const studentId = studentResult.insertId;
    const rules = getPackageRules(packageType);

    await conn.query(
      `INSERT INTO enrollments
       (student_id, package_type, sessions_total)
       VALUES (?, ?, ?)`,
      [studentId, packageType, rules.sessionsTotal]
    );

    await conn.commit();
    const [rows] = await pool.query(
      `SELECT s.id, s.name,
              e.id AS enrollment_id, e.package_type, e.sessions_total,
              e.sessions_used, e.status,
              (e.sessions_total - e.sessions_used) AS sessions_remaining
       FROM students s
       JOIN enrollments e ON e.student_id = s.id AND e.status = 'active'
       WHERE s.id = ?`,
      [studentId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

router.post('/:id/enroll', async (req, res) => {
  const studentId = Number(req.params.id);
  const { packageType } = req.body;

  if (!['4', '8'].includes(packageType)) {
    return res.status(400).json({ error: 'Package type must be 4 or 8' });
  }

  const active = await getActiveEnrollment(studentId);
  if (active) {
    return res.status(400).json({ error: 'Student already has an active enrollment' });
  }

  try {
    const rules = getPackageRules(packageType);
    const [result] = await pool.query(
      `INSERT INTO enrollments
       (student_id, package_type, sessions_total)
       VALUES (?, ?, ?)`,
      [studentId, packageType, rules.sessionsTotal]
    );
    res.status(201).json({ enrollmentId: result.insertId, packageType });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
