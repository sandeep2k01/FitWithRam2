import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { signOut, supabase } from '../../lib/supabase'

const ADMIN_NAV = [
  { to: '/admin',           label: 'Overview',   icon: '⬛', end: true },
  { to: '/admin/members',   label: 'Members',    icon: '👥' },
  { to: '/admin/inquiries', label: 'Inquiries',  icon: '📬', badge: true },
  { to: '/admin/programs',  label: 'Programs',   icon: '📋' },
  { to: '/admin/diet',      label: 'Diet Plans', icon: '🥗' },
  { to: '/admin/payments',  label: 'Payments',   icon: '💳' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const [pendingCount, setPendingCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const handleSignOut = async () => { await signOut(); navigate('/login') }

  useEffect(() => {
    supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'pending')
      .then(({ count }) => setPendingCount(count || 0))
  }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-1)' }}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 45 }} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`} style={{ width: 'var(--sidebar-width)', minHeight: '100vh', background: 'var(--gray-1)', borderRight: '0.5px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, zIndex: 50, transition: 'transform 0.2s' }}>
        <div style={{ padding: '1.25rem', borderBottom: '0.5px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--ff-display)', fontSize: '1.1rem', letterSpacing: '2px', color: 'var(--white)' }}>ADMIN PANEL</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--warning)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '0.2rem' }}>FitWithRam</div>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {ADMIN_NAV.map(({ to, label, icon, end, badge }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setSidebarOpen(false)} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.65rem 1.25rem', fontSize: '0.82rem',
              color: isActive ? 'var(--white)' : 'var(--muted)',
              background: isActive ? 'var(--gray-3)' : 'transparent',
              borderLeft: isActive ? '2px solid var(--warning)' : '2px solid transparent',
              transition: 'all 0.15s'
            })}>
              <span style={{ fontSize: '14px' }}>{icon}</span>
              {label}
              {badge && pendingCount > 0 && (
                <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', fontSize: '0.62rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: 999, lineHeight: 1.5 }}>{pendingCount}</span>
              )}
            </NavLink>
          ))}

          <NavLink to="/dashboard" onClick={() => setSidebarOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 1.25rem', fontSize: '0.82rem', color: 'var(--muted)', marginTop: '1rem', borderTop: '0.5px solid var(--border)', paddingTop: '1rem' }}>
            <span style={{ fontSize: '14px' }}>←</span>Member View
          </NavLink>
        </nav>

        <div style={{ padding: '1rem 1.25rem', borderTop: '0.5px solid var(--border)' }}>
          <button onClick={handleSignOut} className="btn btn-secondary btn-sm btn-full">Sign Out</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main" style={{ marginLeft: 'var(--sidebar-width)', flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        <div style={{ height: 'var(--nav-height)', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 1.5rem', background: 'var(--gray-1)', position: 'sticky', top: 0, zIndex: 40, gap: '1rem' }}>
          <button onClick={() => setSidebarOpen(true)} className="admin-hamburger" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: 'var(--white)', padding: 0, display: 'none' }}>☰</button>
          <div style={{ fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--warning)' }}>Ram — Admin</div>
        </div>
        <div style={{ padding: '2rem' }} className="admin-content"><Outlet /></div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar { transform: translateX(-100%); width: 250px !important; }
          .admin-sidebar.open { transform: translateX(0); }
          .admin-main { margin-left: 0 !important; width: 100vw; }
          .admin-hamburger { display: block !important; }
          .admin-content { padding: 1.25rem !important; }
        }
      `}</style>
    </div>
  )
}
