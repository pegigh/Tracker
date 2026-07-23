import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.delete('/history/month', async (_req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM attendance');
    await conn.query('DELETE FROM class_days');
    await conn.query('DELETE FROM enrollments');
    await conn.commit();
    res.json({
      ok: true,
      message: 'ماه جدید شروع شد — دانش‌آموزان حفظ شدند',
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

router.delete('/history', async (_req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM attendance');
    await conn.query('DELETE FROM class_days');
    await conn.query('DELETE FROM enrollments');
    await conn.query('DELETE FROM students');
    await conn.commit();
    res.json({ ok: true, message: 'همه داده‌ها پاک شد' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

export default router;
