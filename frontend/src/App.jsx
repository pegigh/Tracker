import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import AttendancePage from './pages/AttendancePage';
import StudentsPage from './pages/StudentsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import { IconCheck, IconUsers, IconChart, IconSettings } from './components/Icons';

const PAGES = {
  '/': { title: 'حضور امروز', subtitle: 'ثبت حضور و غیاب' },
  '/students': { title: 'دانش‌آموزان', subtitle: 'مدیریت ثبت‌نام' },
  '/reports': { title: 'گزارش', subtitle: 'وضعیت جلسات' },
  '/settings': { title: 'تنظیمات', subtitle: 'تم و تاریخچه' },
};

const NAV = [
  { to: '/', label: 'حضور', Icon: IconCheck },
  { to: '/students', label: 'دانش‌آموزان', Icon: IconUsers },
  { to: '/reports', label: 'گزارش', Icon: IconChart },
  { to: '/settings', label: 'تنظیمات', Icon: IconSettings },
];

function NavLinks({ className = '' }) {
  return (
    <>
      {NAV.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `nav-link${isActive ? ' active' : ''}${className ? ` ${className}` : ''}`
          }
          end={to === '/'}
        >
          <span className="nav-link-icon">
            <Icon />
          </span>
          <span className="nav-link-label">{label}</span>
        </NavLink>
      ))}
    </>
  );
}

function PageHeader() {
  const { pathname } = useLocation();
  const page = PAGES[pathname] || PAGES['/'];
  return (
    <div className="page-header">
      <h1 className="page-title">{page.title}</h1>
      <p className="page-subtitle">{page.subtitle}</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <span className="brand-dot" />
            حضور کلاس
          </div>
          <nav className="sidebar-nav">
            <NavLinks className="sidebar-item" />
          </nav>
        </aside>

        <div className="main-column">
          <header className="app-header">
            <PageHeader />
            <nav className="top-nav">
              <NavLinks className="top-nav-item" />
            </nav>
          </header>

          <main className="main-content">
            <Routes>
              <Route path="/" element={<AttendancePage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
