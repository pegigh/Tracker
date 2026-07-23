import { pool } from '../db.js';

export function getPackageRules(packageType) {
  if (packageType === '4') {
    return { sessionsTotal: 4, freeAbsences: 0 };
  }
  if (packageType === '8') {
    return { sessionsTotal: 8, freeAbsences: 1 };
  }
  throw new Error('Invalid package type');
}

export async function getActiveEnrollment(studentId) {
  const [rows] = await pool.query(
    `SELECT * FROM enrollments
     WHERE student_id = ? AND status = 'active'
     ORDER BY id DESC LIMIT 1`,
    [studentId]
  );
  return rows[0] || null;
}

export async function getNextSessionNumber(enrollmentId, conn = pool) {
  const [rows] = await conn.query(
    `SELECT COALESCE(MAX(session_number), 0) + 1 AS next_session
     FROM attendance WHERE enrollment_id = ?`,
    [enrollmentId]
  );
  return rows[0].next_session;
}

export function computeAttendanceEffect(enrollment, status) {
  const rules = getPackageRules(enrollment.package_type);
  const remaining =
    enrollment.sessions_total - enrollment.sessions_used;

  if (status === 'present') {
    return {
      sessionBurned: false,
      useFreeAbsence: false,
      incrementSessionsUsed: true,
      completesEnrollment: remaining <= 1,
    };
  }

  if (rules.freeAbsences > enrollment.free_absences_used) {
    return {
      sessionBurned: false,
      useFreeAbsence: true,
      incrementSessionsUsed: false,
      completesEnrollment: false,
    };
  }

  return {
    sessionBurned: true,
    useFreeAbsence: false,
    incrementSessionsUsed: true,
    completesEnrollment: remaining <= 1,
  };
}

export async function markAttendance({
  classDayId,
  enrollmentId,
  status,
}) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[enrollment]] = await conn.query(
      'SELECT * FROM enrollments WHERE id = ? FOR UPDATE',
      [enrollmentId]
    );

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }
    if (enrollment.status !== 'active') {
      throw new Error('Enrollment is not active');
    }

    const [existing] = await conn.query(
      'SELECT id FROM attendance WHERE class_day_id = ? AND enrollment_id = ?',
      [classDayId, enrollmentId]
    );
    if (existing.length > 0) {
      throw new Error('Attendance already recorded for this day');
    }

    const sessionNumber = await getNextSessionNumber(enrollmentId, conn);
    const effect = computeAttendanceEffect(enrollment, status);

    await conn.query(
      `INSERT INTO attendance
       (class_day_id, enrollment_id, status, session_number, session_burned)
       VALUES (?, ?, ?, ?, ?)`,
      [
        classDayId,
        enrollmentId,
        status,
        sessionNumber,
        effect.sessionBurned ? 1 : 0,
      ]
    );

    let sessionsUsed = enrollment.sessions_used;
    let freeAbsencesUsed = enrollment.free_absences_used;

    if (effect.incrementSessionsUsed) {
      sessionsUsed += 1;
    }
    if (effect.useFreeAbsence) {
      freeAbsencesUsed += 1;
    }

    const newStatus = effect.completesEnrollment ? 'completed' : 'active';

    await conn.query(
      `UPDATE enrollments
       SET sessions_used = ?, free_absences_used = ?, status = ?,
           completed_at = CASE WHEN ? = 'completed' THEN NOW() ELSE completed_at END
       WHERE id = ?`,
      [sessionsUsed, freeAbsencesUsed, newStatus, newStatus, enrollmentId]
    );

    await conn.commit();

    return {
      sessionNumber,
      sessionBurned: effect.sessionBurned,
      usedFreeAbsence: effect.useFreeAbsence,
      sessionsRemaining: enrollment.sessions_total - sessionsUsed,
      enrollmentCompleted: newStatus === 'completed',
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function updateAttendance(attendanceId, status) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[record]] = await conn.query(
      `SELECT a.*, e.package_type, e.sessions_total, e.sessions_used,
              e.free_absences_used, e.status AS enrollment_status
       FROM attendance a
       JOIN enrollments e ON e.id = a.enrollment_id
       WHERE a.id = ? FOR UPDATE`,
      [attendanceId]
    );

    if (!record) {
      throw new Error('Attendance record not found');
    }
    if (record.enrollment_status !== 'active') {
      throw new Error('Cannot update attendance for completed enrollment');
    }
    if (record.status === status) {
      await conn.commit();
      return { changed: false };
    }

    let sessionsUsed = record.sessions_used;
    let freeAbsencesUsed = record.free_absences_used;

    if (record.status === 'present') {
      sessionsUsed -= 1;
    } else if (record.session_burned) {
      sessionsUsed -= 1;
    } else {
      freeAbsencesUsed -= 1;
    }

    const tempEnrollment = {
      package_type: record.package_type,
      sessions_total: record.sessions_total,
      sessions_used: sessionsUsed,
      free_absences_used: freeAbsencesUsed,
    };
    const effect = computeAttendanceEffect(tempEnrollment, status);

    if (effect.incrementSessionsUsed) sessionsUsed += 1;
    if (effect.useFreeAbsence) freeAbsencesUsed += 1;

    await conn.query(
      `UPDATE attendance
       SET status = ?, session_burned = ?
       WHERE id = ?`,
      [attendanceId, effect.sessionBurned ? 1 : 0, status]
    );

    const newStatus =
      sessionsUsed >= record.sessions_total ? 'completed' : 'active';

    await conn.query(
      `UPDATE enrollments
       SET sessions_used = ?, free_absences_used = ?, status = ?,
           completed_at = CASE WHEN ? = 'completed' THEN NOW()
                               WHEN ? = 'active' THEN NULL
                               ELSE completed_at END
       WHERE id = ?`,
      [
        sessionsUsed,
        freeAbsencesUsed,
        newStatus,
        newStatus,
        newStatus,
        record.enrollment_id,
      ]
    );

    await conn.commit();
    return {
      changed: true,
      sessionBurned: effect.sessionBurned,
      sessionsRemaining: record.sessions_total - sessionsUsed,
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
