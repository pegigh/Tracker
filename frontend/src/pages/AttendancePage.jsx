import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  Flex,
  Select,
  Text,
  TextField,
} from '@radix-ui/themes';
import { api, formatDate, toDateInputValue } from '../api';
import { IconCalendar, IconPlus } from '../components/Icons';
import {
  EmptyState,
  MobileListItem,
  MobileSection,
  SegmentedControl,
  StatPill,
} from '../components/MobileUI';

function AddStudentSheet({ classDayId, onMarked }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [packageType, setPackageType] = useState('4');
  const [status, setStatus] = useState('present');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const student = await api.addStudent({ name, packageType });
      await api.markAttendance({ classDayId, enrollmentId: student.enrollment_id, status });
      setOpen(false);
      setName('');
      setPackageType('4');
      setStatus('present');
      onMarked(
        student.name,
        status,
        status === 'present' ? `حاضری ${student.name} ثبت شد` : `غیبت ${student.name} ثبت شد`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <button type="button" className="btn-mobile btn-outline">
          <IconPlus /> شاگرد جدید
        </button>
      </Dialog.Trigger>
      <Dialog.Content>
        <div className="mobile-sheet-wrap">
          <div className="sheet-handle" />
          <Dialog.Title>شاگرد جدید</Dialog.Title>
          <form onSubmit={handleSubmit}>
            <MobileSection className="mt-3">
              <div className="form-field">
                <span className="form-label">نام</span>
                <TextField.Root
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="نام شاگرد"
                  size="3"
                />
              </div>
              <div className="form-field">
                <span className="form-label">نوع کلاس</span>
                <Select.Root value={packageType} onValueChange={setPackageType}>
                  <Select.Trigger style={{ width: '100%' }} />
                  <Select.Content>
                    <Select.Item value="4">۴ جلسه‌ای</Select.Item>
                    <Select.Item value="8">۸ جلسه‌ای</Select.Item>
                  </Select.Content>
                </Select.Root>
              </div>
              <div className="form-field">
                <span className="form-label">وضعیت</span>
                <SegmentedControl
                  value={status}
                  onChange={setStatus}
                  options={[
                    { value: 'present', label: 'حاضر', className: 'present' },
                    { value: 'absent', label: 'غایب', className: 'absent' },
                  ]}
                />
              </div>
            </MobileSection>
            {error && <div className="mobile-toast error">{error}</div>}
            <Button type="submit" className="btn-mobile btn-black" loading={loading} mt="3">
              ثبت
            </Button>
          </form>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(toDateInputValue());
  const [classDay, setClassDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setClassDay(await api.getClassDay(selectedDate));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    load();
  }, [load]);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(''), 2800);
  }

  async function afterMark(message) {
    await load();
    showToast(message);
  }

  async function handleMark(enrollmentId, st, studentName) {
    setActionLoading(true);
    setError('');
    try {
      await api.markAttendance({ classDayId: classDay.id, enrollmentId, status: st });
      const message =
        st === 'present'
          ? `حاضری ${studentName} ثبت شد`
          : `غیبت ${studentName} ثبت شد`;
      await afterMark(message);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUpdate(attendanceId, st, studentName) {
    setActionLoading(true);
    setError('');
    try {
      await api.updateAttendance(attendanceId, st);
      const message = `وضعیت ${studentName} به ${st === 'present' ? 'حاضر' : 'غایب'} تغییر کرد`;
      await afterMark(message);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  const available = classDay?.availableStudents || [];
  const attendance = classDay?.attendance || [];
  const presentCount = attendance.filter((a) => a.status === 'present').length;
  const absentCount = attendance.filter((a) => a.status === 'absent').length;

  if (loading) {
    return (
      <div className="loading-pulse">
        <div className="loading-dot" />
        <Text size="2" color="gray">در حال بارگذاری...</Text>
      </div>
    );
  }

  return (
    <>
      {toast && <div className="mobile-toast success toast-float">{toast}</div>}
      {error && <div className="mobile-toast error">{error}</div>}

      <div className="stat-row">
        <StatPill value={attendance.length} label="ثبت‌شده" accent />
        <StatPill value={presentCount} label="حاضر" />
        <StatPill value={absentCount} label="غایب" />
        <StatPill value={available.length} label="باقی‌مانده" />
      </div>

      <div className="content-grid attendance-grid">
        <div className="grid-col">
          <MobileSection title="تاریخ">
        <div className="date-row">
          <div className="date-icon-wrap"><IconCalendar /></div>
          <div style={{ flex: 1 }}>
            <input
              type="date"
              className="date-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            {classDay && (
              <div className="date-formatted">{formatDate(classDay.class_date)}</div>
            )}
          </div>
        </div>
      </MobileSection>

      <MobileSection title="ثبت حضور">
        {available.length === 0 ? (
          <div style={{ padding: '16px' }}>
            <Text size="2" color="gray">همه در لیست روز ثبت شده‌اند.</Text>
          </div>
        ) : (
          available.map((s) => (
            <MobileListItem
              key={s.enrollment_id}
              name={s.name}
              subtitle={`جلسه ${s.next_session_number} · ${s.sessions_remaining} باقی`}
              meta={
                <span className="tag tag-gray">{s.package_type} جلسه</span>
              }
              trailing={
                <div className="btn-pair">
                  <button
                    type="button"
                    className="btn-sm btn-present"
                    disabled={actionLoading}
                    onClick={() => handleMark(s.enrollment_id, 'present', s.name)}
                  >
                    حاضر
                  </button>
                  <button
                    type="button"
                    className="btn-sm btn-absent"
                    disabled={actionLoading}
                    onClick={() => handleMark(s.enrollment_id, 'absent', s.name)}
                  >
                    غایب
                  </button>
                </div>
              }
            />
          ))
        )}
      </MobileSection>
        </div>

        <div className="grid-col">
      <MobileSection title={`لیست روز (${attendance.length})`}>
        {attendance.length === 0 ? (
          <EmptyState title="لیست خالیه" subtitle="شاگرد را حاضر یا غایب کنید" />
        ) : (
          attendance.map((a) => (
            <MobileListItem
              key={a.id}
              name={a.student_name}
              meta={
                <div className="list-item-tags">
                  <span className="tag tag-violet">جلسه {a.session_number}</span>
                  <span className="tag tag-gray">{a.package_type} جلسه</span>
                  {a.session_burned && <span className="tag tag-orange">سوخت</span>}
                  <span className={`tag ${a.status === 'present' ? 'tag-green' : 'tag-red'}`}>
                    {a.status === 'present' ? 'حاضر' : 'غایب'}
                  </span>
                </div>
              }
              trailing={
                a.status === 'present' ? (
                  <button
                    type="button"
                    className="btn-sm btn-outline-edit"
                    disabled={actionLoading}
                    onClick={() => handleUpdate(a.id, 'absent', a.student_name)}
                  >
                    اشتباه؟ غایب
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-sm btn-outline-edit"
                    disabled={actionLoading}
                    onClick={() => handleUpdate(a.id, 'present', a.student_name)}
                  >
                    اشتباه؟ حاضر
                  </button>
                )
              }
            />
          ))
        )}
      </MobileSection>

      <div className="page-toolbar">
        <AddStudentSheet classDayId={classDay.id} onMarked={async (_name, _st, message) => afterMark(message)} />
      </div>
        </div>
      </div>
    </>
  );
}
