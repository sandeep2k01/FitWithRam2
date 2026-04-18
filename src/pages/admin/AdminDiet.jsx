import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminDiet() {
  const [plans, setPlans] = useState([])
  const [members, setMembers] = useState([])
  const [form, setForm] = useState({ name: '', description: '', daily_calories: '', protein_g: '', carbs_g: '', fat_g: '' })
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [assigning, setAssigning] = useState(null)
  const [selectedMember, setSelectedMember] = useState('')

  useEffect(() => { fetchAll() }, [])
  const fetchAll = async () => {
    const { data: p } = await supabase.from('diet_plans').select('*').order('created_at', { ascending: false })
    const { data: m } = await supabase.from('profiles').select('id,full_name,email').neq('role', 'admin')
    setPlans(p || []); setMembers(m || [])
  }

  const savePlan = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const { data } = await supabase.from('diet_plans').insert({ ...form, daily_calories: parseInt(form.daily_calories), protein_g: parseInt(form.protein_g), carbs_g: parseInt(form.carbs_g), fat_g: parseInt(form.fat_g), created_at: new Date().toISOString() }).select().single()
      setPlans(prev => [data, ...prev]); setForm({ name: '', description: '', daily_calories: '', protein_g: '', carbs_g: '', fat_g: '' }); setShowForm(false)
    } finally { setSaving(false) }
  }

  const assignPlan = async (planId) => {
    if (!selectedMember) return
    await supabase.from('user_diet_plans').upsert({ user_id: selectedMember, diet_plan_id: planId, assigned_at: new Date().toISOString() }, { onConflict: 'user_id' })
    alert('Plan assigned!')
    setAssigning(null); setSelectedMember('')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div><div className="tag" style={{ marginBottom: '0.5rem' }}>Admin</div><h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '2.5rem', letterSpacing: '2px' }}>DIET PLANS</h1></div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">+ New Plan</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: 'var(--ff-display)', fontSize: '1.1rem', letterSpacing: '1px', marginBottom: '1.25rem' }}>CREATE DIET PLAN</div>
          <form onSubmit={savePlan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div><label style={{ fontSize: '0.68rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Plan Name</label><input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Muscle Building Plan" /></div>
            <div><label style={{ fontSize: '0.68rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Description</label><textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem' }}>
              {[['daily_calories','Calories'],['protein_g','Protein (g)'],['carbs_g','Carbs (g)'],['fat_g','Fat (g)']].map(([k,l]) => (
                <div key={k}><label style={{ fontSize: '0.68rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>{l}</label><input type="number" required value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} /></div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving...' : 'Save Plan'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary btn-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {plans.map(p => (
          <div key={p.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div><div style={{ fontWeight: 500, marginBottom: '0.2rem' }}>{p.name}</div><div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{p.description}</div></div>
              <button onClick={() => setAssigning(assigning === p.id ? null : p.id)} className="btn btn-secondary btn-sm">Assign to Member</button>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.78rem' }}>
              {[['Calories', p.daily_calories,'kcal'],['Protein',p.protein_g,'g'],['Carbs',p.carbs_g,'g'],['Fat',p.fat_g,'g']].map(([l,v,u]) => (
                <div key={l}><span style={{ color: 'var(--muted)' }}>{l}: </span><strong>{v}{u}</strong></div>
              ))}
            </div>
            {assigning === p.id && (
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <select value={selectedMember} onChange={e => setSelectedMember(e.target.value)} style={{ flex: 1 }}>
                  <option value="">Select member...</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.full_name || m.email}</option>)}
                </select>
                <button onClick={() => assignPlan(p.id)} className="btn btn-primary btn-sm" disabled={!selectedMember}>Assign</button>
              </div>
            )}
          </div>
        ))}
        {plans.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)', fontSize: '0.85rem' }}>No diet plans yet.</div>}
      </div>
    </div>
  )
}
