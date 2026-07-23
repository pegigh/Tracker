import { useState } from 'react';
import {
  Button,
  Dialog,
  Flex,
  Text,
} from '@radix-ui/themes';
import { api } from '../api';
import { useTheme } from '../ThemeContext';
import { MobileSection } from '../components/MobileUI';

function ConfirmSheet({ trigger, title, description, confirmLabel, onConfirm, color = 'red' }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleConfirm() {
    setLoading(true);
    setError('');
    try {
      await onConfirm();
      setOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>{trigger}</Dialog.Trigger>
      <Dialog.Content>
        <div className="mobile-sheet-wrap">
          <div className="sheet-handle" />
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description size="2" mb="3">{description}</Dialog.Description>
          {error && <div className="mobile-toast error">{error}</div>}
          <Flex gap="2">
            <Dialog.Close style={{ flex: 1 }}>
              <button type="button" className="btn-mobile btn-outline" style={{ width: '100%' }}>
                انصراف
              </button>
            </Dialog.Close>
            <Button
              color={color}
              onClick={handleConfirm}
              loading={loading}
              className="btn-mobile"
              style={{ flex: 1 }}
            >
              {confirmLabel}
            </Button>
          </Flex>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export default function SettingsPage() {
  const { appearance, setAppearance } = useTheme();
  const [message, setMessage] = useState('');

  function showMessage(text) {
    setMessage(text);
    setTimeout(() => setMessage(''), 4000);
  }

  return (
    <>
      {message && <div className="mobile-toast success">{message}</div>}

      <MobileSection title="تم ظاهری">
        <div className="form-field">
          <div className="theme-toggle">
            <button
              type="button"
              className={`theme-option${appearance === 'light' ? ' selected' : ''}`}
              onClick={() => setAppearance('light')}
            >
              ☀️ روشن
            </button>
            <button
              type="button"
              className={`theme-option${appearance === 'dark' ? ' selected' : ''}`}
              onClick={() => setAppearance('dark')}
            >
              🌙 تیره
            </button>
          </div>
        </div>
      </MobileSection>

      <MobileSection title="قوانین">
        <div className="form-field">
          <Text size="2" color="gray" as="p" mb="2">
            ۴ جلسه‌ای: هر غیبت = سوخت جلسه
          </Text>
          <Text size="2" color="gray" as="p">
            ۸ جلسه‌ای: ۱ غیبت مجاز
          </Text>
        </div>
      </MobileSection>

      <MobileSection title="شروع ماه جدید" className="month-reset-zone">
        <div className="settings-action">
          <Text size="2" color="gray" mb="3" as="p">
            سوابق حضور پاک می‌شود. نام دانش‌آموزان می‌ماند.
          </Text>
          <ConfirmSheet
            title="شروع ماه جدید؟"
            description="حضور و ثبت‌نام‌های فعلی حذف می‌شوند."
            confirmLabel="بله، ماه جدید"
            color="violet"
            onConfirm={async () => {
              await api.clearMonthHistory();
              showMessage('ماه جدید شروع شد ✓');
            }}
            trigger={
              <button type="button" className="btn-mobile btn-outline" style={{ width: '100%', borderColor: 'rgba(139,92,246,0.5)', color: '#8b5cf6' }}>
                🗓 شروع ماه جدید
              </button>
            }
          />
        </div>
      </MobileSection>

      <MobileSection title="پاک کردن کامل" className="danger-zone">
        <div className="settings-action">
          <Text size="2" color="gray" mb="3" as="p">
            همه داده‌ها حذف می‌شود. برگشت‌پذیر نیست.
          </Text>
          <ConfirmSheet
            title="پاک کردن همه؟"
            description="دانش‌آموزان و سوابق برای همیشه حذف می‌شوند."
            confirmLabel="بله، پاک کن"
            onConfirm={async () => {
              await api.clearAllHistory();
              showMessage('همه داده‌ها پاک شد');
            }}
            trigger={
              <button type="button" className="btn-mobile btn-absent" style={{ width: '100%' }}>
                🗑 پاک کردن کامل
              </button>
            }
          />
        </div>
      </MobileSection>
    </>
  );
}
