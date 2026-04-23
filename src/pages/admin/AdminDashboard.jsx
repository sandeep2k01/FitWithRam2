import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ members: 0, premium: 0, revenue: 0, workoutsToday: 0 })
  const [recentMembers, setRecentMembers] = useState([])

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    const { data: profiles } = await supabase.from('profiles').select('*').neq('role', 'admin')
    const { data: payments } = await supabase.from('payments').select('amount').eq('status', 'success')
    const today = new Date().toISOString().split('T')[0]
    const { data: todayWorkouts } = await supabase.from('workouts').select('id').gte('created_at', today)
    setStats({ members: profiles?.length || 0, premium: profiles?.filter(p => p.is_premium).length || 0, revenue: payments?.reduce((a, p) => a + (p.amount || 0), 0) || 0, workoutsToday: todayWorkouts?.length || 0 })
    setRecentMembers((profiles || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8))
  }

  const S = ({ label, value, color }) => (
    <div className="card" style={{ borderLeft: `2px solid ${color}` }}>
      <div style={{ fontSize: '0.68rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ fontFamily: 'var(--ff-display)', fontSize: '2.5rem', letterSpacing: '1px', lineHeight: 1 }}>{value}</div>
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <div className="tag" style={{ marginBottom: '0.5rem' }}>Admin</div>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '2.5rem', letterSpacing: '2px' }}>OVERVIEW</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <S label="Total Members" value={stats.members} color="var(--white)" />
        <S label="Premium" value={stats.premium} color="var(--warning)" />
        <S label="Revenue" value={`₹${stats.revenue.toLocaleString()}`} color="var(--success)" />
        <S label="Workouts Today" value={stats.workoutsToday} color="var(--info)" />
      </div>
      <div className="card" style={{ overflowX: 'auto' }}>
        <div style={{ fontFamily: 'var(--ff-display)', fontSize: '1.1rem', letterSpacing: '1px', marginBottom: '1.25rem' }}>RECENT MEMBERS</div>
        <div style={{ minWidth: 500 }}>
          {recentMembers.map(m => (
            <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 80px 90px', gap: '1rem', padding: '0.6rem 0', borderBottom: '0.5px solid var(--border)', alignItems: 'center', fontSize: '0.82rem' }}>
              <span style={{ fontWeight: 500 }}>{m.full_name || '—'}</span>
              <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{m.email}</span>
              <span className={`badge badge-${m.is_premium ? 'success' : 'neutral'}`}>{m.plan || 'free'}</span>
              <span style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>{new Date(m.created_at).toLocaleDateString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
