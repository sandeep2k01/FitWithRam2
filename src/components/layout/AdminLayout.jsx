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
  const handleSignOut = async () => { await signOut(); navigate('/login') }

  useEffect(() => {
    supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'pending')
      .then(({ count }) => setPendingCount(count || 0))
  }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 'var(--sidebar-width)', minHeight: '100vh', background: 'var(--gray-1)', borderRight: '0.5px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, zIndex: 50 }}>
        <div style={{ padding: '1.25rem', borderBottom: '0.5px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--ff-display)', fontSize: '1.1rem', letterSpacing: '2px', color: 'var(--white)' }}>ADMIN PANEL</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--warning)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '0.2rem' }}>FitWithRam</div>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {ADMIN_NAV.map(({ to, label, icon, end, badge }) => (
            <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
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
                <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: 999, lineHeight: 1.4 }}>{pendingCount}</span>
              )}
            </NavLink>
          ))}

          <NavLink to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 1.25rem', fontSize: '0.82rem', color: 'var(--muted)', marginTop: '1rem', borderTop: '0.5px solid var(--border)', paddingTop: '1rem' }}>
            <span style={{ fontSize: '14px' }}>←</span>Member View
          </NavLink>
        </nav>

        <div style={{ padding: '1rem 1.25rem', borderTop: '0.5px solid var(--border)' }}>
          <button onClick={handleSignOut} className="btn btn-secondary btn-sm btn-full">Sign Out</button>
        </div>
      </aside>

      <main style={{ marginLeft: 'var(--sidebar-width)', flex: 1, minHeight: '100vh' }}>
        <div style={{ height: 'var(--nav-height)', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 2rem', background: 'var(--gray-1)', position: 'sticky', top: 0, zIndex: 40 }}>
          <div style={{ fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--warning)' }}>Ram — Admin</div>
        </div>
        <div style={{ padding: '2rem' }}><Outlet /></div>
      </main>
    </div>
  )
}
