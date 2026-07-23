import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  Select,
  Text,
  TextField,
} from '@radix-ui/themes';
import { api } from '../api';
import { IconPlus } from '../components/Icons';
import { EmptyState, MobileListItem, MobileSection } from '../components/MobileUI';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [packageType, setPackageType] = useState('4');
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      setStudents(await api.getStudents());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    try {
      await api.addStudent({ name, packageType });
      setOpen(false);
      setName('');
      setPackageType('4');
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const active = students.filter((s) => s.status === 'active');
  const inactive = students.filter((s) => !s.enrollment_id || s.status !== 'active');

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
      <div className="page-toolbar">
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger>
            <button type="button" className="btn-mobile btn-black">
              <IconPlus /> شاگرد جدید
            </button>
          </Dialog.Trigger>
          <Dialog.Content>
            <div className="mobile-sheet-wrap">
              <div className="sheet-handle" />
              <Dialog.Title>ثبت‌نام شاگرد</Dialog.Title>
              <form onSubmit={handleAdd}>
                <MobileSection>
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
                        <Select.Item value="4">۴ جلسه — غیبت = سوخت</Select.Item>
                        <Select.Item value="8">۸ جلسه — ۱ غیبت مجاز</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </div>
                </MobileSection>
                {error && <div className="mobile-toast error">{error}</div>}
                <Button type="submit" className="btn-mobile btn-black" mt="3">
                  ثبت
                </Button>
              </form>
            </div>
          </Dialog.Content>
        </Dialog.Root>
      </div>

      <div className="content-grid">
        <MobileSection title={`فعال (${active.length})`}>
          {active.length === 0 ? (
            <EmptyState title="شاگردی نیست" subtitle="از دکمه بالا ثبت کنید" />
          ) : (
            active.map((s) => (
              <MobileListItem
                key={s.id}
                name={s.name}
                subtitle={`${s.sessions_used} از ${s.sessions_total} جلسه`}
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

        {inactive.length > 0 && (
          <MobileSection title="نیاز به ثبت‌نام">
            {inactive.map((s) => (
              <MobileListItem
                key={s.id}
                name={s.name}
                subtitle="ثبت‌نام مجدد لازم است"
                meta={<span className="tag tag-orange">غیرفعال</span>}
              />
            ))}
          </MobileSection>
        )}
      </div>
    </>
  );
}
