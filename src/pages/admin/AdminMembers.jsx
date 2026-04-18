import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminMembers() {
  const [members, setMembers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchMembers() }, [])

  const fetchMembers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setMembers(data || [])
    setLoading(false)
  }

  const updatePlan = async (userId, plan) => {
    await supabase.from('profiles').update({ plan, is_premium: plan !== 'free' }).eq('id', userId)
    setMembers(prev => prev.map(m => m.id === userId ? { ...m, plan, is_premium: plan !== 'free' } : m))
  }

  const filtered = members.filter(m =>
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="tag" style={{ marginBottom: '0.5rem' }}>Admin</div>
          <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '2.5rem', letterSpacing: '2px' }}>MEMBERS</h1>
        </div>
        <input placeholder="Search members..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 260 }} />
      </div>

      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 80px 120px 100px', gap: '1rem', fontSize: '0.68rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--muted)', padding: '0 0 0.75rem', borderBottom: '0.5px solid var(--border)', marginBottom: '0.25rem' }}>
          <span>Name</span><span>Email</span><span>Plan</span><span>Joined</span><span>Actions</span>
        </div>
        {loading ? <div style={{ padding: '2rem', color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center' }}>Loading...</div> :
          filtered.map(m => (
            <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 80px 120px 100px', gap: '1rem', padding: '0.75rem 0', borderBottom: '0.5px solid var(--border)', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>{m.full_name || '—'}</div>
                {m.role === 'admin' && <span className="badge badge-warning" style={{ marginTop: '0.2rem' }}>admin</span>}
              </div>
              <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{m.email}</span>
              <span className={`badge badge-${m.is_premium ? 'success' : 'neutral'}`}>{m.plan || 'free'}</span>
              <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{new Date(m.created_at).toLocaleDateString('en-IN')}</span>
              <select value={m.plan || 'free'} onChange={e => updatePlan(m.id, e.target.value)} style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', width: '100%' }}>
                <option value="free">Free</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="lifetime">Lifetime</option>
              </select>
            </div>
          ))
        }
      </div>
    </div>
  )
}
