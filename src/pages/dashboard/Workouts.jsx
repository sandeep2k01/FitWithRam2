import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

const MUSCLE_COLORS = {
  'Chest': '#ef4444', 'Back': '#3b82f6', 'Shoulders': '#8b5cf6',
  'Biceps': '#f59e0b', 'Triceps': '#10b981', 'Legs': '#06b6d4',
  'Core': '#f97316', 'Cardio': '#ec4899', 'default': '#6b7280'
}

function MuscleTag({ group }) {
  const color = MUSCLE_COLORS[group] || MUSCLE_COLORS.default
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.6rem', borderRadius: 999, background: color + '18', color: color, fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.3px' }}>
      {group}
    </span>
  )
}

function WorkoutCard({ workout, onDelete }) {
  const date = new Date(workout.created_at)
  const dayName = date.toLocaleDateString('en-IN', { weekday: 'long' })
  const dateStr = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })

  return (
    <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', transition: 'box-shadow 0.2s', cursor: 'default' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
      
      {/* Date block */}
      <div style={{ width: 52, height: 52, borderRadius: 10, background: '#f5f5f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111', lineHeight: 1 }}>{date.getDate()}</div>
        <div style={{ fontSize: '0.6rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{date.toLocaleDateString('en-IN', { month: 'short' })}</div>
      </div>

      {/* Info */}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#111', marginBottom: '0.2rem' }}>{workout.name || 'Workout'}</div>
        <div style={{ fontSize: '0.75rem', color: '#aaa' }}>{dayName}</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {[
          { val: workout.workout_exercises?.[0]?.count || 0, label: 'exercises' },
          { val: `${workout.duration_minutes || 0}m`, label: 'duration' },
          { val: `${(workout.total_volume || 0).toLocaleString()}`, label: 'kg vol' },
        ].map(({ val, label }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111', lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: '0.62rem', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 2 }}>{label}</div>
          </div>
        ))}
        <button onClick={() => onDelete(workout.id)} style={{ background: 'none', border: 'none', color: '#ddd', cursor: 'pointer', fontSize: '1rem', padding: '0.25rem', borderRadius: 6, transition: 'color 0.15s' }}
          onMouseEnter={e => e.target.style.color = '#ef4444'}
          onMouseLeave={e => e.target.style.color = '#ddd'}>✕</button>
      </div>
    </div>
  )
}

export default function Workouts() {
  const { profile } = useAuthStore()
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (profile) fetchWorkouts() }, [profile])

  const fetchWorkouts = async () => {
    const { data } = await supabase
      .from('workouts')
      .select('*, workout_exercises(count)')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
    setWorkouts(data || [])
    setLoading(false)
  }

  const deleteWorkout = async (id) => {
    if (!confirm('Delete this workout?')) return
    await supabase.from('workouts').delete().eq('id', id)
    setWorkouts(prev => prev.filter(w => w.id !== id))
  }

  const totalVolume = workouts.reduce((a, w) => a + (w.total_volume || 0), 0)
  const totalDuration = workouts.reduce((a, w) => a + (w.duration_minutes || 0), 0)

  if (loading) return <div style={{ color: '#aaa', padding: '2rem', textAlign: 'center', fontSize: '0.85rem' }}>Loading workouts...</div>

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111', marginBottom: '0.2rem' }}>My Workout History</h1>
          <p style={{ color: '#aaa', fontSize: '0.83rem' }}>{workouts.length} sessions completed</p>
        </div>
        <Link to="/dashboard/workouts/log" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', background: '#111', color: '#fff', borderRadius: 10, fontSize: '0.83rem', fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s', whiteSpace: 'nowrap' }}>
          + Record Workout
        </Link>
      </div>

      {/* Summary Cards */}
      {workouts.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
          {[
            { label: 'Total Workouts', value: workouts.length, unit: 'sessions', color: '#111' },
            { label: 'Total Volume', value: `${(totalVolume / 1000).toFixed(1)}t`, unit: 'tonnes lifted', color: '#3b82f6' },
            { label: 'Time Trained', value: `${Math.round(totalDuration / 60)}h`, unit: `${totalDuration % 60}m total`, color: '#10b981' },
          ].map(({ label, value, unit, color }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>{label}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color, lineHeight: 1, marginBottom: '0.2rem' }}>{value}</div>
              <div style={{ fontSize: '0.72rem', color: '#bbb' }}>{unit}</div>
            </div>
          ))}
        </div>
      )}

      {/* Workout list */}
      {workouts.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏋️</div>
          <div style={{ fontWeight: 700, fontSize: '1.25rem', color: '#111', marginBottom: '0.5rem' }}>Welcome to Workouts!</div>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '2.5rem' }}>Here's how to start tracking your fitness journey.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', textAlign: 'left', marginBottom: '3rem', background: '#fafafa', padding: '2rem', borderRadius: 12 }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ccc', marginBottom: '0.2rem' }}>STEP 1</div>
              <div style={{ fontWeight: 700, color: '#111', marginBottom: '0.4rem', fontSize: '1.05rem' }}>Browse Exercises</div>
              <div style={{ color: '#777', fontSize: '0.82rem', lineHeight: 1.5 }}>Explore our database of over 200+ exercises with instructions.</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ccc', marginBottom: '0.2rem' }}>STEP 2</div>
              <div style={{ fontWeight: 700, color: '#111', marginBottom: '0.4rem', fontSize: '1.05rem' }}>Record a Session</div>
              <div style={{ color: '#777', fontSize: '0.82rem', lineHeight: 1.5 }}>Track your sets, reps, and weights live while you train.</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ccc', marginBottom: '0.2rem' }}>STEP 3</div>
              <div style={{ fontWeight: 700, color: '#111', marginBottom: '0.4rem', fontSize: '1.05rem' }}>See Your Gains</div>
              <div style={{ color: '#777', fontSize: '0.82rem', lineHeight: 1.5 }}>Watch your strength grow through volume and duration stats.</div>
            </div>
          </div>

          <Link to="/dashboard/workouts/log" style={{ display: 'inline-flex', padding: '0.85rem 2rem', background: '#111', color: '#fff', borderRadius: 10, fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>
            Start My First Session →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {workouts.map(w => <WorkoutCard key={w.id} workout={w} onDelete={deleteWorkout} />)}
        </div>
      )}
    </div>
  )
}
