import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

const MUSCLE_COLORS = {
  'Chest': '#ef4444', 'Back': '#3b82f6', 'Shoulders': '#8b5cf6',
  'Biceps': '#f59e0b', 'Triceps': '#10b981', 'Legs': '#06b6d4',
  'Core': '#f97316', 'Cardio': '#ec4899', 'default': '#6b7280'
}

export default function WorkoutLog() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const [workoutName, setWorkoutName] = useState(`${new Date().toLocaleDateString('en-IN', { weekday: 'long' })} Workout`)
  const [exercises, setExercises] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([]
  )
  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [startTime] = useState(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [elapsedSec, setElapsedSec] = useState(0)
  const searchRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => {
      const secs = Math.floor((Date.now() - startTime) / 1000)
      setElapsedSec(secs)
      setElapsed(Math.floor(secs / 60))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const searchExercises = async (q) => {
    if (!q.trim()) { setSearchResults([]); return }
    setSearching(true)
    const { data } = await supabase.from('exercises').select('id,name,muscle_group').ilike('name', `%${q}%`).limit(8)
    setSearchResults(data || [])
    setSearching(false)
  }

  const addExercise = (ex) => {
    setExercises(prev => [...prev, {
      id: Date.now(), exercise_id: ex.id, name: ex.name, muscle_group: ex.muscle_group,
      sets: [{ id: Date.now(), reps: '', weight: '', done: false }]
    }])
    setSearchQuery(''); setSearchResults([])
  }

  const addSet = (exIdx) => {
    setExercises(prev => {
      const updated = [...prev]
      const lastSet = updated[exIdx].sets.at(-1)
      updated[exIdx].sets.push({ id: Date.now(), reps: lastSet?.reps || '', weight: lastSet?.weight || '', done: false })
      return updated
    })
  }

  const removeExercise = (exIdx) => {
    setExercises(prev => prev.filter((_, i) => i !== exIdx))
  }

  const removeSet = (exIdx, setIdx) => {
    setExercises(prev => {
      const updated = [...prev]
      updated[exIdx].sets = updated[exIdx].sets.filter((_, i) => i !== setIdx)
      return updated
    })
  }

  const updateSet = (exIdx, setIdx, field, value) => {
    setExercises(prev => { const u = [...prev]; u[exIdx].sets[setIdx][field] = value; return u })
  }

  const toggleSetDone = (exIdx, setIdx) => {
    setExercises(prev => { const u = [...prev]; u[exIdx].sets[setIdx].done = !u[exIdx].sets[setIdx].done; return u })
  }

  const doneSets = exercises.reduce((a, ex) => a + ex.sets.filter(s => s.done).length, 0)
  const totalSets = exercises.reduce((a, ex) => a + ex.sets.length, 0)
  const progress = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0
  const totalVolume = exercises.reduce((acc, ex) => acc + ex.sets.reduce((a, s) => a + ((parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0)), 0), 0)

  const saveWorkout = async () => {
    if (exercises.length === 0) return
    setSaving(true)
    try {
      const { data: workout, error } = await supabase.from('workouts').insert({
        user_id: profile.id, name: workoutName,
        duration_minutes: elapsed || 1,
        total_volume: Math.round(totalVolume),
      }).select().single()
      if (error) throw error

      for (const ex of exercises) {
        const { data: we } = await supabase.from('workout_exercises').insert({
          workout_id: workout.id, exercise_id: ex.exercise_id,
        }).select().single()
        if (we) {
          const setsData = ex.sets.filter(s => s.reps || s.weight).map(s => ({
            workout_exercise_id: we.id, reps: parseInt(s.reps) || 0,
            weight: parseFloat(s.weight) || 0, completed: s.done,
          }))
          if (setsData.length > 0) await supabase.from('sets').insert(setsData)
        }
      }
      navigate('/dashboard/workouts')
    } catch (err) {
      alert('Failed to save: ' + err.message)
    } finally { setSaving(false) }
  }

  return (
    <div style={{ maxWidth: 740, margin: '0 auto' }}>
      {/* Sticky header */}
      <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '1.25rem', position: 'sticky', top: 56, zIndex: 30 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <input
            value={workoutName} onChange={e => setWorkoutName(e.target.value)}
            style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111', background: 'transparent', border: 'none', outline: 'none', fontFamily: 'inherit', flex: 1, minWidth: 0 }}
          />
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Timer */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111', fontVariantNumeric: 'tabular-nums', letterSpacing: '1px' }}>{formatTime(elapsedSec)}</div>
              <div style={{ fontSize: '0.6rem', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>elapsed</div>
            </div>
            {/* Progress */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: progress === 100 ? '#10b981' : '#111' }}>{progress}%</div>
              <div style={{ fontSize: '0.6rem', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{doneSets}/{totalSets} sets</div>
            </div>
            <button onClick={saveWorkout} disabled={saving || exercises.length === 0} style={{ padding: '0.6rem 1.25rem', background: exercises.length === 0 ? '#f0f0f0' : '#10b981', color: exercises.length === 0 ? '#bbb' : '#fff', border: 'none', borderRadius: 10, fontSize: '0.83rem', fontWeight: 700, cursor: exercises.length === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}>
              {saving ? 'Saving...' : 'Finish ✓'}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {totalSets > 0 && (
          <div style={{ marginTop: '0.75rem', height: 4, background: '#f0f0f0', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: progress === 100 ? '#10b981' : '#3b82f6', borderRadius: 2, transition: 'width 0.3s' }} />
          </div>
        )}
      </div>

      {/* Live stats */}
      {exercises.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {[
            { label: 'Exercises', value: exercises.length },
            { label: 'Total Sets', value: totalSets },
            { label: 'Volume', value: `${Math.round(totalVolume)}kg` },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 10, padding: '0.85rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111' }}>{value}</div>
              <div style={{ fontSize: '0.65rem', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.25rem' }} ref={searchRef}>
        <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#bbb', fontSize: '0.9rem', pointerEvents: 'none' }}>🔍</span>
        <input
          placeholder="Search and add exercise..."
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); searchExercises(e.target.value) }}
          style={{ width: '100%', padding: '0.75rem 0.85rem 0.75rem 2.25rem', background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, fontSize: '0.88rem', color: '#111', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
        />
        {searching && <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.72rem', color: '#bbb' }}>Searching...</div>}
        {searchResults.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, zIndex: 20, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.10)', marginTop: 4 }}>
            {searchResults.map(ex => {
              const color = MUSCLE_COLORS[ex.muscle_group] || MUSCLE_COLORS.default
              return (
                <button key={ex.id} onClick={() => addExercise(ex)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0.75rem 1rem', background: 'transparent', border: 'none', borderBottom: '1px solid #f5f5f5', color: '#111', textAlign: 'left', cursor: 'pointer', transition: 'background 0.1s', fontFamily: 'inherit' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9f9f9'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{ex.name}</span>
                  <span style={{ fontSize: '0.68rem', color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{ex.muscle_group}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Exercise cards */}
      {exercises.length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed #ddd', borderRadius: 16, padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🏋️</div>
          <div style={{ fontWeight: 600, fontSize: '1rem', color: '#111', marginBottom: '0.4rem' }}>Ready to train?</div>
          <div style={{ fontSize: '0.83rem', color: '#bbb' }}>Search for an exercise above to get started</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {exercises.map((ex, exIdx) => {
            const color = MUSCLE_COLORS[ex.muscle_group] || MUSCLE_COLORS.default
            const exDone = ex.sets.every(s => s.done)
            return (
              <div key={ex.id} style={{ background: '#fff', border: `1px solid ${exDone ? '#a7f3d0' : '#ebebeb'}`, borderRadius: 16, padding: '1.25rem', position: 'relative', transition: 'border-color 0.3s' }}>
                {/* Exercise header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111', marginBottom: '0.25rem' }}>{ex.name}</div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.15rem 0.55rem', borderRadius: 999, background: color + '18', color, fontSize: '0.68rem', fontWeight: 700 }}>{ex.muscle_group}</span>
                  </div>
                  <button onClick={() => removeExercise(exIdx)} style={{ background: '#f5f5f5', border: 'none', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', color: '#aaa', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onMouseEnter={e => { e.target.style.background = '#fee2e2'; e.target.style.color = '#ef4444' }}
                    onMouseLeave={e => { e.target.style.background = '#f5f5f5'; e.target.style.color = '#aaa' }}>✕</button>
                </div>

                {/* Set header */}
                <div style={{ display: 'grid', gridTemplateColumns: '2rem 1fr 1fr 2.5rem', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {['SET', 'KG', 'REPS', ''].map((h, i) => (
                    <div key={i} style={{ fontSize: '0.62rem', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>{h}</div>
                  ))}
                </div>

                {/* Sets */}
                {ex.sets.map((s, sIdx) => (
                  <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '2rem 1fr 1fr 2.5rem', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: s.done ? '#10b981' : '#bbb', textAlign: 'center' }}>{sIdx + 1}</div>
                    <input type="number" placeholder="0" value={s.weight} onChange={e => updateSet(exIdx, sIdx, 'weight', e.target.value)}
                      style={{ padding: '0.5rem', background: s.done ? '#ecfdf5' : '#f9f9f9', border: `1px solid ${s.done ? '#a7f3d0' : '#e5e5e5'}`, borderRadius: 8, fontSize: '0.88rem', color: '#111', textAlign: 'center', fontFamily: 'inherit', outline: 'none', transition: 'all 0.15s' }} />
                    <input type="number" placeholder="0" value={s.reps} onChange={e => updateSet(exIdx, sIdx, 'reps', e.target.value)}
                      style={{ padding: '0.5rem', background: s.done ? '#ecfdf5' : '#f9f9f9', border: `1px solid ${s.done ? '#a7f3d0' : '#e5e5e5'}`, borderRadius: 8, fontSize: '0.88rem', color: '#111', textAlign: 'center', fontFamily: 'inherit', outline: 'none', transition: 'all 0.15s' }} />
                    <button onClick={() => toggleSetDone(exIdx, sIdx)} style={{ width: 36, height: 36, borderRadius: 8, border: 'none', background: s.done ? '#10b981' : '#f0f0f0', color: s.done ? '#fff' : '#bbb', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>✓</button>
                  </div>
                ))}

                {/* Set actions */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button onClick={() => addSet(exIdx)} style={{ padding: '0.4rem 0.85rem', background: '#f0f0f0', border: 'none', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, color: '#555', cursor: 'pointer', fontFamily: 'inherit' }}>+ Add Set</button>
                  {ex.sets.length > 1 && (
                    <button onClick={() => removeSet(exIdx, ex.sets.length - 1)} style={{ padding: '0.4rem 0.85rem', background: 'transparent', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: '0.78rem', color: '#aaa', cursor: 'pointer', fontFamily: 'inherit' }}>Remove Set</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
