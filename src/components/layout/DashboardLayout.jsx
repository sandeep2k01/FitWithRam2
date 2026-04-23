import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { signOut } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

const NAV_MAIN = [
  { to: '/dashboard',                  label: 'Dashboard',        icon: '⬛', end: true },
  { to: '/dashboard/my-plan',          label: 'My Plan',          icon: '📋' },
  { to: '/dashboard/workouts',         label: 'Workout Log',      icon: '🏋️' },
  { to: '/dashboard/exercises',        label: 'Exercises',        icon: '💪' },
  { to: '/dashboard/progress',         label: 'Progress',         icon: '📊' },
  { to: '/dashboard/diet',             label: 'Nutrition',        icon: '🥗' },
]

const NAV_TRAINING = [
  { to: '/dashboard/offline-training', label: 'Offline Training', icon: '🏋️' },
  { to: '/dashboard/online-training',  label: 'Online Training',  icon: '🌐' },
]

const NAV_ACCOUNT = [
  { to: '/dashboard/payments',         label: 'Upgrade',          icon: '⚡' },
  { to: '/dashboard/profile',          label: 'Profile',          icon: '👤' },
]

export default function DashboardLayout() {
  const navigate = useNavigate()
  const { profile, isAdmin } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const initials = (profile?.full_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f7f5', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 49, display: 'none'
        }} className="mobile-overlay" />
      )}

      {/* ── Sidebar ── */}
      <aside style={{
        width: 220, minHeight: '100vh', background: '#ffffff',
        borderRight: '1px solid #ebebeb',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: sidebarOpen ? 0 : undefined, zIndex: 50,
      }} className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #ebebeb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', letterSpacing: '3px', color: '#111' }}>
              FIT<span style={{ color: '#bbb' }}>WITH</span>RAM
            </div>
            <div style={{ fontSize: '0.68rem', color: '#aaa', letterSpacing: '1px', marginTop: '0.15rem' }}>Training Platform</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="sidebar-close-btn" style={{
            background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#888', display: 'none'
          }}>✕</button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.75rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
          {NAV_MAIN.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setSidebarOpen(false)} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.6rem 0.85rem', fontSize: '0.83rem', fontWeight: isActive ? 600 : 400,
              color: isActive ? '#111' : '#888', background: isActive ? '#f0f0f0' : 'transparent',
              borderRadius: 8, textDecoration: 'none', transition: 'all 0.15s',
            })}>
              <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>{icon}</span>{label}
            </NavLink>
          ))}

          <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#ccc', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '1rem 0.85rem 0.35rem', marginTop: '0.25rem' }}>TRAINING TYPE</div>
          {NAV_TRAINING.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.6rem 0.85rem', fontSize: '0.83rem', fontWeight: isActive ? 600 : 400,
              color: isActive ? '#111' : '#888', background: isActive ? '#f0f0f0' : 'transparent',
              borderRadius: 8, textDecoration: 'none', transition: 'all 0.15s',
            })}>
              <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>{icon}</span>{label}
            </NavLink>
          ))}

          <div style={{ height: 1, background: '#ebebeb', margin: '0.75rem 0.85rem' }} />
          {NAV_ACCOUNT.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.6rem 0.85rem', fontSize: '0.83rem', fontWeight: isActive ? 600 : 400,
              color: isActive ? '#111' : '#888', background: isActive ? '#f0f0f0' : 'transparent',
              borderRadius: 8, textDecoration: 'none', transition: 'all 0.15s',
            })}>
              <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>{icon}</span>{label}
            </NavLink>
          ))}

          {isAdmin && (
            <NavLink to="/admin" onClick={() => setSidebarOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', fontSize: '0.83rem', color: '#e67e22', marginTop: '0.5rem', borderTop: '1px solid #ebebeb', textDecoration: 'none', borderRadius: 8 }}>
              <span style={{ fontSize: '1rem' }}>🔑</span>Admin Panel
            </NavLink>
          )}
        </nav>

        {/* User footer */}
        <div style={{ padding: '1rem', borderTop: '1px solid #ebebeb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.full_name || 'Member'}</div>
              <div style={{ fontSize: '0.68rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{profile?.plan || 'free'}</div>
            </div>
          </div>
          <button onClick={handleSignOut} style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem', background: 'transparent', border: '1px solid #e0e0e0', color: '#888', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' }}
            onMouseEnter={e => { e.target.style.background = '#f5f5f5'; e.target.style.color = '#333' }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#888' }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="dashboard-main" style={{ marginLeft: 220, flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <div style={{ height: 56, borderBottom: '1px solid #ebebeb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', background: '#fff', position: 'sticky', top: 0, zIndex: 40, gap: '0.75rem' }}>
          {/* Hamburger - mobile only */}
          <button onClick={() => setSidebarOpen(true)} className="hamburger-btn" style={{
            background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem',
            color: '#333', display: 'none', padding: 0
          }}>☰</button>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: '0.78rem', color: '#aaa' }} className="topbar-email">{profile?.email}</div>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700, color: '#fff' }}>
            {initials}
          </div>
        </div>

        <div style={{ padding: '2rem', flex: 1 }} className="dashboard-content">
          <Outlet />
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            left: -220px !important;
            transition: left 0.25s ease;
          }
          .sidebar.sidebar-open {
            left: 0 !important;
          }
          .sidebar-close-btn {
            display: flex !important;
          }
          .mobile-overlay {
            display: block !important;
          }
          .hamburger-btn {
            display: flex !important;
          }
          .dashboard-main {
            margin-left: 0 !important;
          }
          .dashboard-content {
            padding: 1rem !important;
          }
          .topbar-email {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
