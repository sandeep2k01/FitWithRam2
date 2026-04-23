import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const StatCard = ({ label, value, sub, color }) => (
  <div className="card" style={{ borderLeft: `2px solid ${color || 'var(--gray-4)'}` }}>
    <div style={{ fontSize: '0.68rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem' }}>{label}</div>
    <div style={{ fontFamily: 'var(--ff-display)', fontSize: '2.2rem', letterSpacing: '1px', lineHeight: 1, marginBottom: '0.25rem' }}>{value}</div>
    {sub && <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{sub}</div>}
  </div>
)

const TRAINING_GOALS = [
  { id: 'Fat Loss', icon: '🔥', desc: 'Burn fat and get lean', color: '#dc2626', bg: '#fee2e2' },
  { id: 'Muscle Building', icon: '💪', desc: 'Build muscle mass and size', color: '#b45309', bg: '#fef3c7' },
  { id: 'Strength Training', icon: '⚡', desc: 'Build raw strength and power', color: '#7c3aed', bg: '#ede9fe' },
]

export default function Dashboard() {
  const { profile } = useAuthStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ totalWorkouts: 0, thisWeek: 0, streak: 0, totalVolume: 0 })
  const [recentWorkouts, setRecentWorkouts] = useState([])
  const [volumeData, setVolumeData] = useState([])
  const [loading, setLoading] = useState(true)
  const [intentBanner, setIntentBanner] = useState(null)
  const [trainingType, setTrainingType] = useState(null)
  const [goalSaving, setGoalSaving] = useState(false)
  const [ramPlan, setRamPlan] = useState({ diet: null, program: null })

  useEffect(() => {
    const intent = localStorage.getItem('training_intent')
    if (intent) { setIntentBanner(intent); localStorage.removeItem('training_intent') }
  }, [])

  useEffect(() => {
    if (!profile) return
    fetchDashboardData()
  }, [profile])

  const fetchDashboardData = async () => {
    try {
      // Fetch workouts
      const { data: workouts } = await supabase
        .from('workouts')
        .select('*, workout_exercises(*, sets(*))')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (workouts) {
        setRecentWorkouts(workouts.slice(0, 5))
        const now = new Date()
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
        const thisWeek = workouts.filter(w => new Date(w.created_at) >= weekStart).length

        // Build volume chart data (last 8 weeks)
        const weeklyVolume = {}
        workouts.forEach(w => {
          const date = new Date(w.created_at)
          const week = `W${Math.ceil(date.getDate() / 7)} ${date.toLocaleString('default', { month: 'short' })}`
          if (!weeklyVolume[week]) weeklyVolume[week] = 0
          w.workout_exercises?.forEach(ex => {
            ex.sets?.forEach(s => { weeklyVolume[week] += (s.weight || 0) * (s.reps || 0) })
          })
        })

        setVolumeData(Object.entries(weeklyVolume).slice(-8).map(([week, vol]) => ({ week, volume: Math.round(vol) })))
        setStats({ totalWorkouts: workouts.length, thisWeek, streak: thisWeek, totalVolume: Math.round(workouts.reduce((acc, w) => acc + (w.total_volume || 0), 0)) })
      }
      // Fetch Ram-assigned diet & program
      const { data: profileData } = await supabase
        .from('profiles').select('diet_plan').eq('id', profile.id).single()
      const { data: inquiry } = await supabase
        .from('inquiries')
        .select('*, assigned_program:programs(name, fitness_goal, level, days_per_week, duration_weeks), assigned_diet:diet_plans(name)')
        .eq('user_id', profile.id)
        .not('assigned_program_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      setRamPlan({
        diet: profileData?.diet_plan || null,
        program: inquiry?.assigned_program || null,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="tag" style={{ marginBottom: '0.5rem' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '2.5rem', letterSpacing: '2px' }}>
          {greeting().toUpperCase()},<br />{(profile?.full_name || 'Champ').split(' ')[0].toUpperCase()}
        </h1>
      </div>

      {/* One-time intent banner */}
      {intentBanner === 'offline' && (
        <div style={{ background: '#fffbeb', border: '0.5px solid #fde68a', borderRadius: 8, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#92400e', marginBottom: '0.2rem' }}>🏋️ You chose Offline Training</div>
            <div style={{ fontSize: '0.78rem', color: '#b45309' }}>Fill your details so Ram can assign your personalized plan.</div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0 }}>
            <Link to="/dashboard/offline-training" style={{ padding: '0.45rem 1rem', background: '#111', color: '#fff', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>Fill Details →</Link>
            <button onClick={() => setIntentBanner(null)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 }}>✕</button>
          </div>
        </div>
      )}
      {intentBanner === 'online' && (
        <div style={{ background: '#f0f9ff', border: '0.5px solid #bae6fd', borderRadius: 8, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0c4a6e', marginBottom: '0.2rem' }}>🌐 Upgrade to Premium Online Training</div>
            <div style={{ fontSize: '0.78rem', color: '#0369a1' }}>Unlock live sessions with Ram and full online training features.</div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0 }}>
            <Link to="/dashboard/online-training" style={{ padding: '0.45rem 1rem', background: '#111', color: '#fff', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>Upgrade →</Link>
            <button onClick={() => setIntentBanner(null)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 }}>✕</button>
          </div>
        </div>
      )}

      {/* Plan banner */}
      {!profile?.is_premium && (
        <div style={{ background: 'var(--gray-2)', border: '0.5px solid var(--border-light)', padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 'var(--radius-sm)' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.2rem' }}>Offline Training</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Upgrade to unlock live sessions and analytics</div>
          </div>
          <Link to="/dashboard/online-training" className="btn btn-primary btn-sm">Upgrade ↗</Link>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Total Workouts" value={stats.totalWorkouts} color="#000000" />
        <StatCard label="This Week" value={stats.thisWeek} sub="workouts" color="var(--success)" />
        <StatCard label="Streak" value={`${stats.streak}d`} sub="days active" color="var(--warning)" />
        <StatCard label="Total Volume" value={`${(stats.totalVolume / 1000).toFixed(1)}T`} sub="kg lifted" color="var(--info)" />
      </div>

      {/* Volume chart */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.68rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.2rem' }}>Training Volume</div>
            <div style={{ fontFamily: 'var(--ff-display)', fontSize: '1.2rem', letterSpacing: '1px' }}>WEEKLY PROGRESS</div>
          </div>
        </div>
        {volumeData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={volumeData}>
              <defs>
                <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f0f0a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0f0f0a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{ fill: '#777777', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#777777', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#e5e5e5', border: '0.5px solid #d1d1d1', borderRadius: 2, fontSize: 12 }} labelStyle={{ color: '#777777' }} itemStyle={{ color: '#0f0f0a' }} />
              <Area type="monotone" dataKey="volume" stroke="#0f0f0a" strokeWidth={1.5} fill="url(#vg)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '0.82rem' }}>
            No workout data yet — <Link to="/dashboard/workouts/log" style={{ color: 'var(--white)', marginLeft: '0.25rem', textDecoration: 'underline' }}>log your first workout</Link>
          </div>
        )}
      </div>

      {/* Recent workouts */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ fontFamily: 'var(--ff-display)', fontSize: '1.2rem', letterSpacing: '1px' }}>RECENT WORKOUTS</div>
          <Link to="/dashboard/workouts" style={{ fontSize: '0.75rem', color: 'var(--muted)', textDecoration: 'underline' }}>View all</Link>
        </div>

        {recentWorkouts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--muted)', fontSize: '0.85rem' }}>
            <div style={{ marginBottom: '1rem' }}>No workouts logged yet.</div>
            <Link to="/dashboard/workouts/log" className="btn btn-primary btn-sm">Log First Workout</Link>
          </div>
        ) : (
          recentWorkouts.map(w => (
            <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '0.5px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>{w.name || 'Workout'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.15rem' }}>{new Date(w.created_at).toLocaleDateString('en-IN')}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{w.workout_exercises?.length || 0} exercises</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{w.duration_minutes || 0} min</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── MY PLAN FROM RAM ── */}
      {(ramPlan.diet || ramPlan.program) && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ fontSize: '0.68rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem' }}>Assigned by Ram</div>
          <div style={{ fontFamily: 'var(--ff-display)', fontSize: '1.4rem', letterSpacing: '1px', marginBottom: '1.25rem' }}>MY PLAN</div>
          <div style={{ display: 'grid', gridTemplateColumns: ramPlan.diet && ramPlan.program ? '1fr 1fr' : '1fr', gap: '1rem' }}>

            {/* Diet Plan Card */}
            {ramPlan.diet && (ramPlan.diet.calories || ramPlan.diet.meal_plan) && (
              <div className="card" style={{ borderLeft: '3px solid #10b981' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>🥗</span>
                  <div>
                    <div style={{ fontSize: '0.68rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#10b981', marginBottom: '0.1rem' }}>Diet Plan</div>
                    <div style={{ fontFamily: 'var(--ff-display)', fontSize: '1rem', letterSpacing: '1px' }}>ASSIGNED BY RAM</div>
                  </div>
                </div>
                {ramPlan.diet.calories && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    {[['Calories', ramPlan.diet.calories, 'kcal', '#111'],
                      ['Protein', ramPlan.diet.protein, 'g', '#3b82f6'],
                      ['Carbs', ramPlan.diet.carbs, 'g', '#f59e0b'],
                      ['Fat', ramPlan.diet.fat, 'g', '#ef4444']]
                      .map(([label, val, unit, color]) => val ? (
                      <div key={label} style={{ background: 'var(--gray-3)', borderRadius: 8, padding: '0.6rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}<br/>{unit}</div>
                      </div>
                    ) : null)}
                  </div>
                )}
                {ramPlan.diet.meal_plan && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.7, background: 'var(--gray-3)', borderRadius: 8, padding: '0.75rem', whiteSpace: 'pre-wrap' }}>
                    {ramPlan.diet.meal_plan}
                  </div>
                )}
                <Link to="/dashboard/diet" style={{ display: 'inline-flex', marginTop: '0.75rem', fontSize: '0.75rem', color: '#10b981', textDecoration: 'underline' }}>View full diet page →</Link>
              </div>
            )}

            {/* Workout Program Card */}
            {ramPlan.program && (
              <div className="card" style={{ borderLeft: '3px solid var(--warning)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>🏋️</span>
                  <div>
                    <div style={{ fontSize: '0.68rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--warning)', marginBottom: '0.1rem' }}>Workout Program</div>
                    <div style={{ fontFamily: 'var(--ff-display)', fontSize: '1rem', letterSpacing: '1px' }}>ASSIGNED BY RAM</div>
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{ramPlan.program.name}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {[['Goal', ramPlan.program.fitness_goal],
                    ['Level', ramPlan.program.level],
                    ['Days/Week', ramPlan.program.days_per_week],
                    ['Duration', `${ramPlan.program.duration_weeks}w`]]
                    .map(([label, val]) => val ? (
                    <div key={label} style={{ background: 'var(--gray-3)', borderRadius: 8, padding: '0.6rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--white)', lineHeight: 1 }}>{val}</div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 2 }}>{label}</div>
                    </div>
                  ) : null)}
                </div>
                <Link to="/dashboard/offline-training" style={{ display: 'inline-flex', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--warning)', textDecoration: 'underline' }}>View full training plan →</Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TRAINING SELECTION FLOW ── */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ fontSize: '0.68rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem' }}>Start Training</div>
        <div style={{ fontFamily: 'var(--ff-display)', fontSize: '1.4rem', letterSpacing: '1px', marginBottom: '1.5rem' }}>CHOOSE YOUR TRAINING PATH</div>

        {/* STEP 1 — Training Type */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: trainingType ? '1.5rem' : 0 }}>
          {[{ id: 'offline', label: 'Offline Training', sub: 'Train at the gym with Ram\'s guidance', icon: '🏋️' },
            { id: 'online', label: 'Online Training', sub: 'Train anywhere with full premium features', icon: '🌐' }]
            .map(({ id, label, sub, icon }) => (
            <button key={id} onClick={() => setTrainingType(trainingType === id ? null : id)}
              style={{
                padding: '1.5rem', border: `2px solid ${trainingType === id ? '#111' : 'var(--border)'}`,
                borderRadius: 12, background: trainingType === id ? '#111' : 'var(--gray-2)',
                color: trainingType === id ? '#fff' : 'var(--white)', cursor: 'pointer',
                textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.2s',
              }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{label}</div>
              <div style={{ fontSize: '0.78rem', color: trainingType === id ? 'rgba(255,255,255,0.65)' : 'var(--muted)', lineHeight: 1.5 }}>{sub}</div>
              {trainingType === id && <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>↓ Choose your goal below</div>}
            </button>
          ))}
        </div>

        {/* STEP 2 — Goal Cards (revealed after picking type) */}
        {trainingType && (
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '1rem' }}>Now select your goal:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {TRAINING_GOALS.map(({ id, icon, desc, color, bg }) => (
                <button key={id} disabled={goalSaving}
                  onClick={async () => {
                    setGoalSaving(true)
                    // Save inquiry to Supabase so Ram sees it in admin panel
                    try {
                      await supabase.from('inquiries').insert({
                        user_id: profile?.id,
                        training_type: trainingType,
                        fitness_goal: id,
                        full_name: profile?.full_name || '',
                        email: profile?.email || '',
                        phone: profile?.phone || '',
                        message: `Selected via dashboard training flow: ${trainingType} / ${id}`,
                      })
                    } catch (_) { /* non-blocking */ }
                    setGoalSaving(false)
                    // STEP 3 — Navigate
                    if (trainingType === 'offline') {
                      navigate('/dashboard/offline-training', { state: { goal: id } })
                    } else {
                      if (profile?.is_premium) {
                        navigate('/dashboard/workouts', { state: { goal: id } })
                      } else {
                        navigate('/dashboard/online-training', { state: { goal: id } })
                      }
                    }
                  }}
                  style={{
                    padding: '1.5rem 1rem', border: '2px solid var(--border)',
                    borderRadius: 12, background: 'var(--gray-2)', cursor: 'pointer',
                    textAlign: 'center', fontFamily: 'inherit', transition: 'all 0.2s',
                    opacity: goalSaving ? 0.6 : 1,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = bg; e.currentTarget.style.color = color }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--gray-2)'; e.currentTarget.style.color = 'var(--white)' }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>{icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>{id}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.5 }}>{desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
