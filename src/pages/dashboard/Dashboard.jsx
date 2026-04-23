import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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

export default function Dashboard() {
  const { profile } = useAuthStore()
  const [stats, setStats] = useState({ totalWorkouts: 0, thisWeek: 0, streak: 0, totalVolume: 0 })
  const [recentWorkouts, setRecentWorkouts] = useState([])
  const [volumeData, setVolumeData] = useState([])
  const [loading, setLoading] = useState(true)

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

      {/* Plan banner */}
      {!profile?.is_premium && (
        <div style={{ background: 'var(--gray-2)', border: '0.5px solid var(--border-light)', padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 'var(--radius-sm)' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.2rem' }}>Upgrade to Premium</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Unlock diet plans, advanced analytics & more</div>
          </div>
          <Link to="/dashboard/payments" className="btn btn-primary btn-sm">Upgrade ↗</Link>
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
    </div>
  )
}
