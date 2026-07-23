const API = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'خطایی رخ داد');
  return data;
}

export const api = {
  getClassDay: (date) => request(`/class-days/${date}`),
  getStudents: () => request('/students'),
  addStudent: (body) =>
    request('/students', { method: 'POST', body: JSON.stringify(body) }),
  reEnroll: (studentId, packageType) =>
    request(`/students/${studentId}/enroll`, {
      method: 'POST',
      body: JSON.stringify({ packageType }),
    }),
  markAttendance: (body) =>
    request('/attendance', { method: 'POST', body: JSON.stringify(body) }),
  updateAttendance: (id, status) =>
    request(`/attendance/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getCompletedReport: () => request('/reports/completed'),
  getActiveSummary: () => request('/reports/active-summary'),
  clearMonthHistory: () =>
    request('/admin/history/month', { method: 'DELETE' }),
  clearAllHistory: () =>
    request('/admin/history', { method: 'DELETE' }),
};

export function toDateInputValue(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('fa-IR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
