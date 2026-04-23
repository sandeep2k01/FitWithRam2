import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { GOALS, INQUIRY_STATUSES, STATUS_COLORS, RAM_WHATSAPP, whatsappRamMessage } from '../../lib/constants'

const S = {
  card: { background: 'var(--gray-2)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '1.25rem', marginBottom: '1rem' },
  label: { fontSize: '0.68rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' },
  input: { width: '100%', boxSizing: 'border-box' },
  badge: (status) => {
    const c = STATUS_COLORS[status] || STATUS_COLORS.pending
    return { padding: '0.25rem 0.65rem', borderRadius: 999, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', background: c.bg, color: c.color }
  },
}

function StatBox({ label, value, color }) {
  return (
    <div style={{ background: 'var(--gray-2)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '1.25rem', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--ff-display)', fontSize: '2.2rem', letterSpacing: '1px', color: color || 'var(--white)', lineHeight: 1, marginBottom: '0.25rem' }}>{value}</div>
      <div style={{ fontSize: '0.68rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
    </div>
  )
}

function InquiryCard({ inquiry, programs, dietPlans, onUpdate }) {
  const [notes, setNotes] = useState(inquiry.ram_notes || '')
  const [status, setStatus] = useState(inquiry.status)
  const [programId, setProgramId] = useState(inquiry.assigned_program_id || '')
  const [dietId, setDietId] = useState(inquiry.assigned_diet_id || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = async () => {
    setSaving(true)
    const updates = {
      status,
      ram_notes: notes,
      assigned_program_id: programId || null,
      assigned_diet_id: dietId || null,
      updated_at: new Date().toISOString(),
    }
    await supabase.from('inquiries').update(updates).eq('id', inquiry.id)

    // Also update member profile with assigned program
    if (programId) {
      await supabase.from('profiles').update({ assigned_program_id: programId }).eq('id', inquiry.user_id)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onUpdate({ ...inquiry, ...updates })
  }

  const memberMsg = whatsappRamMessage(inquiry.full_name, inquiry.fitness_goal)

  return (
    <div style={S.card}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--white)' }}>{inquiry.full_name}</div>
            <span style={S.badge(status)}>{status}</span>
            <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', background: 'var(--gray-3)', color: 'var(--muted)', borderRadius: 999, textTransform: 'capitalize' }}>{inquiry.training_type}</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
            {inquiry.email} · {inquiry.phone || 'No phone'} · {new Date(inquiry.created_at).toLocaleDateString('en-IN')}
          </div>
        </div>
        <a
          href={`https://wa.me/${inquiry.phone?.replace(/\D/g, '')}?text=${memberMsg}`}
          target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', background: '#25d366', color: '#fff', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}
        >
          💬 WhatsApp
        </a>
      </div>

      {/* Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        {[
          ['Goal', inquiry.fitness_goal],
          ['Time', inquiry.preferred_time || '—'],
          ['Location', inquiry.location || '—'],
          ['Submitted', new Date(inquiry.created_at).toLocaleDateString('en-IN')],
        ].map(([l, v]) => (
          <div key={l}>
            <div style={S.label}>{l}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--white)', fontWeight: 500 }}>{v}</div>
          </div>
        ))}
      </div>

      {inquiry.message && (
        <div style={{ background: 'var(--gray-3)', borderRadius: 6, padding: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6 }}>
          "{inquiry.message}"
        </div>
      )}

      {/* Admin controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <label style={S.label}>Status</label>
          <select style={S.input} value={status} onChange={e => setStatus(e.target.value)}>
            {INQUIRY_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label style={S.label}>Assign Program {inquiry.fitness_goal && <span style={{ color: 'var(--warning)', fontSize: '0.65rem' }}>(goal: {inquiry.fitness_goal})</span>}</label>
          <select style={S.input} value={programId} onChange={e => setProgramId(e.target.value)}>
            <option value="">— Select Program —</option>
            {programs.map(p => {
              const match = p.fitness_goal === inquiry.fitness_goal || p.goal === inquiry.fitness_goal
              return (
                <option key={p.id} value={p.id} style={{ fontWeight: match ? 700 : 400 }}>
                  {match ? '⭐ ' : ''}{p.name} ({p.level}){p.fitness_goal ? ` — ${p.fitness_goal}` : ''}
                </option>
              )
            })}
          </select>
        </div>
        <div>
          <label style={S.label}>Assign Diet Plan</label>
          <select style={S.input} value={dietId} onChange={e => setDietId(e.target.value)}>
            <option value="">— Select Diet Plan —</option>
            {dietPlans.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <label style={S.label}>Ram's Private Notes</label>
        <textarea
          rows={2}
          style={{ ...S.input, resize: 'vertical', fontSize: '0.85rem' }}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Private notes about this member..."
        />
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="btn btn-primary btn-sm"
        style={{ opacity: saving ? 0.6 : 1 }}
      >
        {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
      </button>
    </div>
  )
}

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([])
  const [programs, setPrograms] = useState([])
  const [dietPlans, setDietPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: 'all', goal: 'all', type: 'all' })

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    const [{ data: inq }, { data: prog }, { data: diet }] = await Promise.all([
      supabase.from('inquiries').select('*').order('created_at', { ascending: false }),
      supabase.from('programs').select('*').order('name'),
      supabase.from('diet_plans').select('id, name').order('name'),
    ])
    setInquiries(inq || [])
    setPrograms(prog || [])
    setDietPlans(diet || [])
    setLoading(false)
  }

  const handleUpdate = useCallback((updated) => {
    setInquiries(prev => prev.map(i => i.id === updated.id ? updated : i))
  }, [])

  const filtered = inquiries.filter(i => {
    if (filters.status !== 'all' && i.status !== filters.status) return false
    if (filters.goal !== 'all' && i.fitness_goal !== filters.goal) return false
    if (filters.type !== 'all' && i.training_type !== filters.type) return false
    return true
  })

  const stats = {
    total: inquiries.length,
    pending: inquiries.filter(i => i.status === 'pending').length,
    active: inquiries.filter(i => i.status === 'active').length,
    closed: inquiries.filter(i => i.status === 'closed').length,
  }

  const selectStyle = { padding: '0.45rem 0.85rem', fontSize: '0.8rem', borderRadius: 8, border: '0.5px solid var(--border)', background: 'var(--gray-2)', color: 'var(--white)', fontFamily: 'inherit', cursor: 'pointer' }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <div className="tag" style={{ marginBottom: '0.5rem' }}>Admin</div>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '2.5rem', letterSpacing: '2px' }}>INQUIRIES</h1>
      </div>

      {/* Stat boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatBox label="Total" value={stats.total} />
        <StatBox label="Pending" value={stats.pending} color="#f59e0b" />
        <StatBox label="Active" value={stats.active} color="#10b981" />
        <StatBox label="Closed" value={stats.closed} color="var(--muted)" />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <select style={selectStyle} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="all">All Statuses</option>
          {INQUIRY_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select style={selectStyle} value={filters.goal} onChange={e => setFilters(f => ({ ...f, goal: e.target.value }))}>
          <option value="all">All Goals</option>
          {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select style={selectStyle} value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
          <option value="all">All Types</option>
          <option value="offline">Offline</option>
          <option value="online">Online</option>
        </select>
        <span style={{ fontSize: '0.78rem', color: 'var(--muted)', marginLeft: 'auto' }}>{filtered.length} inquiries</span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)', fontSize: '0.85rem' }}>Loading inquiries...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)', fontSize: '0.85rem' }}>No inquiries match the selected filters.</div>
      ) : (
        filtered.map(inq => (
          <InquiryCard key={inq.id} inquiry={inq} programs={programs} dietPlans={dietPlans} onUpdate={handleUpdate} />
        ))
      )}
    </div>
  )
}
