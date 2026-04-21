import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, CartesianGrid } from 'recharts'

const StatCard = ({ label, value, unit, color = '#111', icon }) => (
  <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '1.25rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: '0.72rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>{label}</div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
        {unit && <div style={{ fontSize: '0.72rem', color: '#bbb', marginTop: '0.25rem' }}>{unit}</div>}
      </div>
      {icon && <div style={{ fontSize: '1.5rem' }}>{icon}</div>}
    </div>
  </div>
)

const TT = {
  contentStyle: { background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
  labelStyle: { color: '#888', fontWeight: 600 },
  itemStyle: { color: '#111' },
}

export default function Progress() {
  const { profile } = useAuthStore()
  const [tab, setTab] = useState('volume')
  const [measurements, setMeasurements] = useState([])
  const [weeklyData, setWeeklyData] = useState([])
  const [totalWorkouts, setTotalWorkouts] = useState(0)
  const [newM, setNewM] = useState({ weight: '', body_fat: '', chest: '', waist: '', hips: '' })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (profile) fetchAll() }, [profile])

  const fetchAll = async () => {
    const { data: m } = await supabase.from('measurements').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(30)
    setMeasurements(m || [])

    const { data: w } = await supabase.from('workouts').select('created_at,total_volume,duration_minutes').eq('user_id', profile.id).order('created_at').limit(60)
    if (w) {
      setTotalWorkouts(w.length)
      setWeeklyData(w.map(wk => ({
        date: new Date(wk.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        volume: Math.round(wk.total_volume || 0),
        duration: wk.duration_minutes || 0,
      })))
    }
    setLoading(false)
  }

  const saveMeasurement = async () => {
    if (!Object.values(newM).some(v => v !== '')) return
    setSaving(true)
    try {
      const payload = { user_id: profile.id, ...Object.fromEntries(Object.entries(newM).map(([k, v]) => [k, v ? parseFloat(v) : null])) }
      const { data } = await supabase.from('measurements').insert(payload).select().single()
      setMeasurements(prev => [data, ...prev])
      setNewM({ weight: '', body_fat: '', chest: '', waist: '', hips: '' })
    } finally { setSaving(false) }
  }

  const latestWeight = measurements.find(m => m.weight)?.weight
  const firstWeight = [...measurements].reverse().find(m => m.weight)?.weight
  const weightChange = latestWeight && firstWeight ? (latestWeight - firstWeight).toFixed(1) : null

  const tabs = [
    { id: 'volume', label: 'Volume' },
    { id: 'duration', label: 'Duration' },
    { id: 'body', label: 'Body' },
    { id: 'log', label: 'Add Measurement' },
  ]

  if (loading) return <div style={{ color: '#aaa', padding: '2rem', textAlign: 'center', fontSize: '0.85rem' }}>Loading progress...</div>

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111', marginBottom: '0.2rem' }}>Progress</h1>
        <p style={{ color: '#aaa', fontSize: '0.83rem' }}>Your fitness analytics & measurements</p>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        <StatCard label="Workouts" value={totalWorkouts} unit="sessions" icon="🏋️" />
        <StatCard label="Avg Volume" value={weeklyData.length ? Math.round(weeklyData.reduce((a, d) => a + d.volume, 0) / weeklyData.length) : 0} unit="kg per session" color="#3b82f6" icon="📦" />
        <StatCard label="Current Weight" value={latestWeight ? `${latestWeight}kg` : '–'} unit={weightChange ? `${weightChange > 0 ? '+' : ''}${weightChange}kg since start` : 'Not logged yet'} color="#10b981" icon="⚖️" />
        <StatCard label="Avg Session" value={weeklyData.length ? Math.round(weeklyData.reduce((a, d) => a + d.duration, 0) / weeklyData.length) : 0} unit="minutes" color="#8b5cf6" icon="⏱️" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', background: '#f0f0f0', borderRadius: 10, padding: '0.25rem', marginBottom: '1.5rem', width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: tab === t.id ? 600 : 400,
            background: tab === t.id ? '#fff' : 'transparent',
            color: tab === t.id ? '#111' : '#888',
            border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
            boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Empty State Guide */}
      {totalWorkouts === 0 && measurements.length === 0 && tab !== 'log' && (
        <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '3rem 2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📈</div>
          <div style={{ fontWeight: 700, fontSize: '1.25rem', color: '#111', marginBottom: '0.5rem' }}>Your Progress Journey Starts Here</div>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '2.5rem' }}>Here's how to build your fitness data over time.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', textAlign: 'left', marginBottom: '2.5rem', background: '#fafafa', padding: '2rem', borderRadius: 12 }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ccc', marginBottom: '0.2rem' }}>STEP 1</div>
              <div style={{ fontWeight: 700, color: '#111', marginBottom: '0.4rem', fontSize: '1.05rem' }}>Record Workouts</div>
              <div style={{ color: '#777', fontSize: '0.82rem', lineHeight: 1.5 }}>Each session adds to your history.</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ccc', marginBottom: '0.2rem' }}>STEP 2</div>
              <div style={{ fontWeight: 700, color: '#111', marginBottom: '0.4rem', fontSize: '1.05rem' }}>Track Nutrition</div>
              <div style={{ color: '#777', fontSize: '0.82rem', lineHeight: 1.5 }}>Add your daily meals to hit targets.</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ccc', marginBottom: '0.2rem' }}>STEP 3</div>
              <div style={{ fontWeight: 700, color: '#111', marginBottom: '0.4rem', fontSize: '1.05rem' }}>Watch Charts Grow</div>
              <div style={{ color: '#777', fontSize: '0.82rem', lineHeight: 1.5 }}>Volume, streaks & body stats over time.</div>
            </div>
          </div>
          <div style={{ padding: '0.75rem 1.25rem', background: '#fffbeb', color: '#b45309', borderRadius: 8, fontSize: '0.85rem', fontWeight: 500, display: 'inline-block' }}>
            ⚠️ Charts will appear after your first workout is recorded
          </div>
        </div>
      )}

      {/* Volume Chart */}
      {tab === 'volume' && (
        <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '1.5rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#111', marginBottom: '1.25rem' }}>Training Volume (kg)</div>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fill: '#bbb', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#bbb', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...TT} />
                <Area type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} fill="url(#vg)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyChart label="Record workouts to see volume data" />}
        </div>
      )}

      {/* Duration Chart */}
      {tab === 'duration' && (
        <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '1.5rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#111', marginBottom: '1.25rem' }}>Session Duration (minutes)</div>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fill: '#bbb', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#bbb', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...TT} />
                <Bar dataKey="duration" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart label="Record workouts to see duration data" />}
        </div>
      )}

      {/* Body Weight Chart */}
      {tab === 'body' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '1.5rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#111', marginBottom: '1.25rem' }}>Weight History (kg)</div>
            {measurements.filter(m => m.weight).length > 1 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={[...measurements].reverse().filter(m => m.weight).map(m => ({ date: new Date(m.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }), weight: m.weight }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fill: '#bbb', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#bbb', fontSize: 11 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip {...TT} />
                  <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <EmptyChart label="Add at least 2 measurements to see weight trend" />}
          </div>

          {/* Latest measurements */}
          {measurements.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '1.5rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#111', marginBottom: '1rem' }}>Measurement History</div>
              {measurements.map(m => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #f5f5f5', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.78rem', color: '#aaa' }}>{new Date(m.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.78rem', fontWeight: 500, color: '#555' }}>
                    {m.weight && <span>{m.weight}kg</span>}
                    {m.body_fat && <span>{m.body_fat}% BF</span>}
                    {m.chest && <span>Chest {m.chest}cm</span>}
                    {m.waist && <span>Waist {m.waist}cm</span>}
                    {m.hips && <span>Hips {m.hips}cm</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Log Measurement */}
      {tab === 'log' && (
        <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '1.5rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#111', marginBottom: '1.25rem' }}>Add New Measurement</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {[['weight', 'Weight (kg)'], ['body_fat', 'Body Fat (%)'], ['chest', 'Chest (cm)'], ['waist', 'Waist (cm)'], ['hips', 'Hips (cm)']].map(([k, l]) => (
              <div key={k}>
                <label style={{ fontSize: '0.7rem', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#aaa', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>{l}</label>
                <input type="number" step="0.1" placeholder="0" value={newM[k]} onChange={e => setNewM(p => ({ ...p, [k]: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', background: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: '0.88rem', color: '#111', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
          <button onClick={saveMeasurement} disabled={saving} style={{ padding: '0.65rem 1.5rem', background: '#111', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {saving ? 'Saving...' : 'Save Measurement'}
          </button>
        </div>
      )}
    </div>
  )
}

function EmptyChart({ label }) {
  return (
    <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ccc', gap: '0.5rem' }}>
      <div style={{ fontSize: '2rem' }}>📊</div>
      <div style={{ fontSize: '0.82rem' }}>{label}</div>
    </div>
  )
}
