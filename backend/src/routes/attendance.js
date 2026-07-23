import { Router } from 'express';
import { markAttendance, updateAttendance } from '../services/attendance.js';
import { pool } from '../db.js';

const router = Router();

router.post('/', async (req, res) => {
  const { classDayId, enrollmentId, status } = req.body;

  if (!classDayId || !enrollmentId || !['present', 'absent'].includes(status)) {
    return res.status(400).json({
      error: 'classDayId, enrollmentId, and status (present|absent) are required',
    });
  }

  try {
    const result = await markAttendance({ classDayId, enrollmentId, status });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  const { status } = req.body;
  if (!['present', 'absent'].includes(status)) {
    return res.status(400).json({ error: 'status must be present or absent' });
  }

  try {
    const result = await updateAttendance(Number(req.params.id), status);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/history/:enrollmentId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, cd.class_date
       FROM attendance a
       JOIN class_days cd ON cd.id = a.class_day_id
       WHERE a.enrollment_id = ?
       ORDER BY a.session_number ASC`,
      [req.params.enrollmentId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
