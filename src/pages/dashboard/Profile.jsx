import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { Link } from 'react-router-dom'

const GOALS = ['Build Muscle', 'Lose Fat', 'Improve Strength', 'Increase Endurance', 'Stay Fit', 'Athletic Performance']
const PLAN_COLORS = { free: '#888', monthly: '#3b82f6', yearly: '#10b981', lifetime: '#8b5cf6' }

export default function Profile() {
  const { profile, setProfile } = useAuthStore()
  const [form, setForm] = useState({ full_name: '', phone: '', age: '', height: '', goal: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [pwForm, setPwForm] = useState({ newPw: '', confirm: '' })
  const [pwMsg, setPwMsg] = useState('')
  const [stats, setStats] = useState({ workouts: 0, volume: 0, streak: 0 })
  const [savedExercises, setSavedExercises] = useState([])

  useEffect(() => {
    if (profile) {
      setForm({ full_name: profile.full_name || '', phone: profile.phone || '', age: profile.age || '', height: profile.height || '', goal: profile.goal || '' })
      fetchStats()
    }
  }, [profile])

  const fetchStats = async () => {
    const { data: workouts } = await supabase
      .from('workouts').select('total_volume, created_at')
      .eq('user_id', profile.id).order('created_at', { ascending: false })
    if (workouts) {
      setStats({
        workouts: workouts.length,
        volume: Math.round(workouts.reduce((a, w) => a + (w.total_volume || 0), 0) / 1000 * 10) / 10,
        streak: calcStreak(workouts.map(w => w.created_at)),
      })
    }

    const { data: saved } = await supabase
      .from('saved_exercises')
      .select('exercise_id, exercises(id, name, muscle_group, equipment)')
      .eq('user_id', profile.id)
    if (saved) {
      setSavedExercises(saved.map(s => s.exercises))
    }
  }

  const calcStreak = (dates) => {
    if (!dates.length) return 0
    const unique = [...new Set(dates.map(d => new Date(d).toDateString()))].reverse()
    let streak = 0
    let today = new Date()
    for (let d of unique) {
      const date = new Date(d)
      const diff = Math.floor((today - date) / 86400000)
      if (diff <= streak + 1) { streak++; today = date } else break
    }
    return streak
  }

  const saveProfile = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const { data } = await supabase.from('profiles').update({
        full_name: form.full_name, phone: form.phone,
        age: form.age ? parseInt(form.age) : null,
        height: form.height ? parseFloat(form.height) : null,
        goal: form.goal
      }).eq('id', profile.id).select().single()
      setProfile(data); setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch (err) { alert(err.message) } finally { setSaving(false) }
  }

  const changePassword = async (e) => {
    e.preventDefault(); setPwMsg('')
    if (pwForm.newPw !== pwForm.confirm) { setPwMsg('Passwords do not match'); return }
    if (pwForm.newPw.length < 6) { setPwMsg('Password must be at least 6 characters'); return }
    const { error } = await supabase.auth.updateUser({ password: pwForm.newPw })
    if (error) setPwMsg(error.message)
    else { setPwMsg('✓ Password updated successfully!'); setPwForm({ newPw: '', confirm: '' }) }
  }

  const initials = (profile?.full_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const planColor = PLAN_COLORS[profile?.plan] || '#888'

  return (
    <div style={{ maxWidth: 680 }}>
      {/* Header */}
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111', marginBottom: '1.5rem' }}>Profile</h1>

      {/* User card */}
      <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#111', marginBottom: '0.2rem' }}>{profile?.full_name || 'Member'}</div>
          <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.5rem' }}>{profile?.email}</div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.7rem', borderRadius: 999, background: planColor + '18', color: planColor, fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize', letterSpacing: '0.5px' }}>
            {profile?.is_premium ? '⭐' : '🆓'} {profile?.plan || 'free'} plan
          </span>
        </div>
        {!profile?.is_premium && (
          <Link to="/dashboard/payments" style={{ padding: '0.5rem 1rem', background: '#111', color: '#fff', borderRadius: 10, fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>Upgrade ⚡</Link>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Workouts', value: stats.workouts, unit: 'sessions', color: '#111' },
          { label: 'Volume Lifted', value: `${stats.volume}t`, unit: 'total tonnes', color: '#3b82f6' },
          { label: 'Active Streak', value: `${stats.streak}`, unit: 'days in a row', color: '#f59e0b' },
        ].map(({ label, value, unit, color }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color, lineHeight: 1, marginBottom: '0.2rem' }}>{value}</div>
            <div style={{ fontSize: '0.72rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
            <div style={{ fontSize: '0.65rem', color: '#ccc' }}>{unit}</div>
          </div>
        ))}
      </div>

      {/* Saved Exercises */}
      <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#111', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between' }}>
          <span>Saved Exercises</span>
          <span style={{ color: '#aaa', fontWeight: 500 }}>{savedExercises.length}</span>
        </div>
        {savedExercises.length === 0 ? (
           <div style={{ color: '#aaa', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>No saved exercises yet. Explore the library!</div>
        ) : (
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
             {savedExercises.map(ex => (
               <Link to="/dashboard/exercises" key={ex.id} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #ebebeb', borderRadius: 12, padding: '1rem 0.5rem', cursor: 'pointer', transition: 'all 0.2s', background: '#fff' }}
                 onMouseEnter={e => { e.currentTarget.style.borderColor = '#111'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)' }}
                 onMouseLeave={e => { e.currentTarget.style.borderColor = '#ebebeb'; e.currentTarget.style.boxShadow = 'none' }}>
                 <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                     <img src={`/media/images/${ex.name}.webp`} alt={ex.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} 
                       onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<div style="font-weight: 800; font-size: 1.5rem; color: #ccc;">${ex.name.charAt(0)}</div>` }} />
                 </div>
                 <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#111', textAlign: 'center', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.name}</div>
                 <div style={{ fontSize: '0.65rem', color: '#888', textAlign: 'center' }}>{ex.muscle_group}</div>
               </Link>
             ))}
           </div>
        )}
      </div>

      {/* Personal Info */}
      <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#111', marginBottom: '1.25rem' }}>Personal Info</div>
        <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[['full_name', 'Full Name', 'text', 'Your name'], ['phone', 'Phone', 'tel', '+91 99999 99999'], ['age', 'Age', 'number', '25'], ['height', 'Height (cm)', 'number', '175']].map(([k, l, t, p]) => (
              <div key={k}>
                <label style={{ fontSize: '0.7rem', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#aaa', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>{l}</label>
                <input type={t} placeholder={p} value={form[k]} onChange={e => setForm(prev => ({ ...prev, [k]: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', background: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: '0.88rem', color: '#111', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                  onFocus={e => e.target.style.borderColor = '#111'}
                  onBlur={e => e.target.style.borderColor = '#e5e5e5'} />
              </div>
            ))}
          </div>
          <div>
            <label style={{ fontSize: '0.7rem', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#aaa', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>Fitness Goal</label>
            <select value={form.goal} onChange={e => setForm(p => ({ ...p, goal: e.target.value }))}
              style={{ width: '100%', padding: '0.6rem 0.75rem', background: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: '0.88rem', color: '#111', fontFamily: 'inherit', outline: 'none' }}>
              <option value="">Select a goal</option>
              {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <button type="submit" disabled={saving} style={{ padding: '0.65rem 1.5rem', background: saved ? '#10b981' : '#111', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}>
              {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '1.5rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#111', marginBottom: '1.25rem' }}>Change Password</div>
        {pwMsg && (
          <div style={{ padding: '0.65rem 0.85rem', marginBottom: '1rem', fontSize: '0.82rem', background: pwMsg.includes('✓') ? '#ecfdf5' : '#fef2f2', color: pwMsg.includes('✓') ? '#10b981' : '#ef4444', border: `1px solid ${pwMsg.includes('✓') ? '#a7f3d0' : '#fecaca'}`, borderRadius: 8 }}>
            {pwMsg}
          </div>
        )}
        <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[['newPw', 'New Password'], ['confirm', 'Confirm Password']].map(([k, l]) => (
            <div key={k}>
              <label style={{ fontSize: '0.7rem', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#aaa', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>{l}</label>
              <input type="password" placeholder="••••••••" value={pwForm[k]} onChange={e => setPwForm(p => ({ ...p, [k]: e.target.value }))}
                style={{ width: '100%', padding: '0.6rem 0.75rem', background: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: '0.88rem', color: '#111', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}
          <div>
            <button type="submit" style={{ padding: '0.65rem 1.5rem', background: 'transparent', color: '#111', border: '1px solid #e5e5e5', borderRadius: 10, fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
