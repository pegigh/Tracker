import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  Select,
  Text,
} from '@radix-ui/themes';
import { api } from '../api';
import { EmptyState, MobileListItem, MobileSection, StatPill } from '../components/MobileUI';

function ReEnrollSheet({ studentId, studentName, onDone }) {
  const [open, setOpen] = useState(false);
  const [packageType, setPackageType] = useState('4');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.reEnroll(studentId, packageType);
      setOpen(false);
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <button type="button" className="btn-sm btn-black">ثبت‌نام</button>
      </Dialog.Trigger>
      <Dialog.Content>
        <div className="mobile-sheet-wrap">
          <div className="sheet-handle" />
          <Dialog.Title>{studentName}</Dialog.Title>
          <form onSubmit={handleSubmit}>
            <MobileSection>
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

export default function ReportsPage() {
  const [completed, setCompleted] = useState([]);
  const [active, setActive] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [c, a] = await Promise.all([
        api.getCompletedReport(),
        api.getActiveSummary(),
      ]);
      setCompleted(c);
      setActive(a);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const lowSessions = active.filter((s) => s.sessions_remaining <= 1);

  if (loading) {
    return (
      <div className="loading-pulse">
        <div className="loading-dot" />
        <Text size="2" color="gray">بارگذاری...</Text>
      </div>
    );
  }

  return (
    <>
      <div className="stat-row">
        <StatPill value={active.length} label="فعال" accent />
        <StatPill value={completed.length} label="تمام‌شده" />
        <StatPill value={lowSessions.length} label="نزدیک پایان" />
      </div>

      <div className="content-grid">
        <div className="grid-col">
      <MobileSection title="جلسات تمام‌شده">
        {completed.length === 0 ? (
          <EmptyState title="موردی نیست" subtitle="کسی جلساتش تمام نشده" />
        ) : (
          completed.map((s) => (
            <MobileListItem
              key={s.enrollment_id}
              name={s.name}
              subtitle={
                s.completed_at
                  ? new Date(s.completed_at).toLocaleDateString('fa-IR')
                  : ''
              }
              meta={<span className="tag tag-violet">{s.package_type} جلسه</span>}
              trailing={
                <ReEnrollSheet
                  studentId={s.student_id}
                  studentName={s.name}
                  onDone={load}
                />
              }
            />
          ))
        )}
      </MobileSection>

      {lowSessions.length > 0 && (
        <MobileSection title="نزدیک به پایان">
          {lowSessions.map((s) => (
            <MobileListItem
              key={s.enrollment_id}
              name={s.name}
              subtitle={`جلسه ${s.sessions_attended + 1} بعدی`}
              meta={
                <div className="list-item-tags">
                  <span className="tag tag-violet">{s.package_type} جلسه</span>
                  <span className="tag tag-orange">{s.sessions_remaining} باقی</span>
                </div>
              }
            />
          ))}
        </MobileSection>
      )}

        </div>
        <div className="grid-col">
      <MobileSection title="همه فعال">
        {active.length === 0 ? (
          <EmptyState title="ثبت‌نامی نیست" />
        ) : (
          active.map((s) => (
            <MobileListItem
              key={s.enrollment_id}
              name={s.name}
              subtitle={`${s.sessions_attended} جلسه شرکت`}
              meta={
                <div className="list-item-tags">
                  <span className="tag tag-violet">{s.package_type} جلسه</span>
                  <span className="tag tag-green">{s.sessions_remaining} باقی</span>
                </div>
              }
            />
          ))
        )}
      </MobileSection>
        </div>
      </div>
    </>
  );
}
