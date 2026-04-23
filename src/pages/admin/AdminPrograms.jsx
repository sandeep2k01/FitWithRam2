import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { GOAL_IDS } from '../../lib/goals'

export default function AdminPrograms() {
  const [programs, setPrograms] = useState([])
  const [form, setForm] = useState({ name: '', description: '', level: 'beginner', duration_weeks: '', goal: '', fitness_goal: '', training_type: 'both', days_per_week: 4 })
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchPrograms() }, [])
  const fetchPrograms = async () => {
    const { data } = await supabase.from('programs').select('*').order('created_at', { ascending: false })
    setPrograms(data || [])
  }

  const saveProgram = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const { data } = await supabase.from('programs').insert({ ...form, duration_weeks: parseInt(form.duration_weeks), days_per_week: parseInt(form.days_per_week), created_at: new Date().toISOString() }).select().single()
      setPrograms(prev => [data, ...prev])
      setForm({ name: '', description: '', level: 'beginner', duration_weeks: '', goal: '', fitness_goal: '', training_type: 'both', days_per_week: 4 })
      setShowForm(false)
    } finally { setSaving(false) }
  }

  const deleteProgram = async (id) => {
    if (!confirm('Delete this program?')) return
    await supabase.from('programs').delete().eq('id', id)
    setPrograms(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div><div className="tag" style={{ marginBottom: '0.5rem' }}>Admin</div><h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '2.5rem', letterSpacing: '2px' }}>PROGRAMS</h1></div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">+ New Program</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: 'var(--ff-display)', fontSize: '1.1rem', letterSpacing: '1px', marginBottom: '1.25rem' }}>CREATE PROGRAM</div>
          <form onSubmit={saveProgram} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><label style={{ fontSize: '0.68rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Program Name</label><input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Beginner Strength" /></div>
              <div><label style={{ fontSize: '0.68rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Duration (weeks)</label><input type="number" required value={form.duration_weeks} onChange={e => setForm(p => ({ ...p, duration_weeks: e.target.value }))} placeholder="12" /></div>
              <div><label style={{ fontSize: '0.68rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Level</label><select value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>
              <div><label style={{ fontSize: '0.68rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Fitness Goal</label><select value={form.fitness_goal} onChange={e => setForm(p => ({ ...p, fitness_goal: e.target.value }))}><option value="">— Select Goal —</option>{GOAL_IDS.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
              <div><label style={{ fontSize: '0.68rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Training Type</label><select value={form.training_type} onChange={e => setForm(p => ({ ...p, training_type: e.target.value }))}><option value="both">Both</option><option value="offline">Offline</option><option value="online">Online</option></select></div>
              <div><label style={{ fontSize: '0.68rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Days per Week</label><select value={form.days_per_week} onChange={e => setForm(p => ({ ...p, days_per_week: e.target.value }))}><option value={3}>3 days</option><option value={4}>4 days</option><option value={5}>5 days</option><option value={6}>6 days</option></select></div>
            </div>
            <div><label style={{ fontSize: '0.68rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Description</label><textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the program..." /></div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving...' : 'Save Program'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary btn-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {programs.map(p => (
          <div key={p.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                <div style={{ fontWeight: 500 }}>{p.name}</div>
                <span className="badge badge-neutral">{p.level}</span>
                {p.goal && <span className="badge badge-info">{p.goal}</span>}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>{p.description}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--gray-5)' }}>{p.duration_weeks} weeks</div>
            </div>
            <button onClick={() => deleteProgram(p.id)} style={{ background: 'transparent', border: 'none', color: 'var(--gray-5)', cursor: 'pointer', fontSize: '0.8rem', flexShrink: 0 }}>✕</button>
          </div>
        ))}
        {programs.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)', fontSize: '0.85rem' }}>No programs yet. Create your first one.</div>}
      </div>
    </div>
  )
}
