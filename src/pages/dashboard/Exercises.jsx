import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

const MUSCLE_GROUPS = ['All', 'Saved', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Cardio']

const MUSCLE_COLORS = {
  'Saved': '#f59e0b',
  'Chest': '#ef4444', 'Back': '#3b82f6', 'Shoulders': '#8b5cf6',
  'Biceps': '#f59e0b', 'Triceps': '#10b981', 'Legs': '#06b6d4',
  'Core': '#f97316', 'Cardio': '#ec4899', 'default': '#6b7280'
}

const EQUIPMENT_ICONS = {
  'Barbell': '🏋️', 'Dumbbell': '💪', 'Cable': '🔗',
  'Machine': '⚙️', 'Bodyweight': '🤸', 'Treadmill': '🏃', 'Bike': '🚴',
}

export default function Exercises() {
  const { user } = useAuthStore()
  const [exercises, setExercises] = useState([])
  const [savedExs, setSavedExs] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [activeGroup, setActiveGroup] = useState('All')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { 
    fetchExercises()
  }, [])

  useEffect(() => {
    if (user) {
       fetchSaved()
    }
  }, [user])

  useEffect(() => {
    let data = exercises
    if (activeGroup === 'Saved') {
       data = data.filter(e => savedExs.includes(e.id))
    } else if (activeGroup !== 'All') {
       data = data.filter(e => e.muscle_group?.toLowerCase().includes(activeGroup.toLowerCase()))
    }
    if (search) data = data.filter(e => e.name?.toLowerCase().includes(search.toLowerCase()))
    setFiltered(data)
  }, [exercises, search, activeGroup, savedExs])

  const fetchExercises = async () => {
    const { data } = await supabase.from('exercises').select('*').order('name')
    setExercises(data || [])
    setFiltered(data || [])
    setLoading(false)
  }

  const fetchSaved = async () => {
    const { data } = await supabase.from('saved_exercises').select('exercise_id').eq('user_id', user.id)
    setSavedExs(data?.map(d => d.exercise_id) || [])
  }

  const toggleSave = async (ex, e) => {
    if (e) e.stopPropagation()
    if (!user) return
    const isSaved = savedExs.includes(ex.id)
    if (isSaved) {
       setSavedExs(prev => prev.filter(id => id !== ex.id))
       await supabase.from('saved_exercises').delete().eq('user_id', user.id).eq('exercise_id', ex.id)
    } else {
       setSavedExs(prev => [...prev, ex.id])
       await supabase.from('saved_exercises').insert({ user_id: user.id, exercise_id: ex.id })
    }
  }

  const grouped = MUSCLE_GROUPS.slice(1).reduce((acc, g) => {
    let items = []
    if (g === 'Saved') {
        items = filtered.filter(e => savedExs.includes(e.id))
    } else {
        items = filtered.filter(e => e.muscle_group === g)
    }
    if (items.length) acc[g] = items
    return acc
  }, {})

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111', marginBottom: '0.2rem' }}>Exercise Library</h1>
        <p style={{ color: '#aaa', fontSize: '0.83rem' }}>{filtered.length} exercises available</p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#bbb', fontSize: '0.9rem' }}>🔍</span>
        <input
          placeholder="Search exercises..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: '2.25rem', background: '#fff', border: '1px solid #ebebeb', borderRadius: 10, fontSize: '0.85rem', color: '#111', width: '100%', padding: '0.65rem 0.85rem 0.65rem 2.25rem', outline: 'none', fontFamily: 'inherit' }}
        />
      </div>

      {/* Muscle filters */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
        {MUSCLE_GROUPS.map(g => {
          const color = MUSCLE_COLORS[g] || MUSCLE_COLORS.default
          const isActive = activeGroup === g
          return (
            <button key={g} onClick={() => setActiveGroup(g)} style={{
              padding: '0.35rem 0.85rem', fontSize: '0.75rem', fontWeight: isActive ? 600 : 400,
              background: isActive ? (g === 'All' ? '#111' : color) : '#fff',
              color: isActive ? '#fff' : '#666',
              border: `1px solid ${isActive ? (g === 'All' ? '#111' : color) : '#e5e5e5'}`,
              borderRadius: 999, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
            }}>
              {g}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa', fontSize: '0.85rem' }}>Loading exercises...</div>
      ) : activeGroup === 'All' ? (
        // Grouped by muscle
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {Object.entries(grouped).map(([group, exList]) => {
            const color = MUSCLE_COLORS[group] || MUSCLE_COLORS.default
            return (
              <div key={group}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111', textTransform: 'uppercase', letterSpacing: '1px' }}>{group}</span>
                  <span style={{ fontSize: '0.72rem', color: '#bbb' }}>{exList.length}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {exList.map(ex => <ExerciseCard key={ex.id} ex={ex} color={color} isSaved={savedExs.includes(ex.id)} onToggleSave={(e) => toggleSave(ex, e)} onClick={() => setSelected(ex)} />)}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {filtered.map(ex => {
            const color = MUSCLE_COLORS[ex.muscle_group] || MUSCLE_COLORS.default
            return <ExerciseCard key={ex.id} ex={ex} color={color} isSaved={savedExs.includes(ex.id)} onToggleSave={(e) => toggleSave(ex, e)} onClick={() => setSelected(ex)} />
          })}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#aaa', fontSize: '0.85rem' }}>
              No exercises found for "{search || activeGroup}"
            </div>
          )}
        </div>
      )}

      {/* Detail modal (Lyfta style) */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelected(null)}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '0', maxWidth: 480, width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 <button onClick={() => setSelected(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}>
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                 </button>
                 <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{selected.name}</h2>
               </div>
               <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="12" cy="4" r="2"></circle><circle cx="12" cy="20" r="2"></circle></svg>
               </button>
            </div>

            {/* Scrollable Content */}
            <div style={{ overflowY: 'auto', padding: '1.5rem' }}>
              {/* Show Lyfta Video in modal */}
              <div style={{ width: '100%', height: 280, background: '#f8fafc', borderRadius: '16px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', marginBottom: '1.5rem' }}>
                <video 
                  src={`/media/videos/${selected.name}.mp4`} 
                  autoPlay loop muted playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff' }}
                  onError={(e) => { 
                    e.target.style.display = 'none'; 
                    e.target.parentElement.innerHTML = '<div style="color: #94a3b8; font-weight: 600; font-size: 0.85rem; letter-spacing: 1px;">VIDEO PENDING</div>'; 
                  }}
                />
              </div>

              {/* Action row (like Lyfta: Download, Bookmark, Share) */}
              <div style={{ display: 'flex', justifyContent: 'space-around', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                  <div onClick={(e) => toggleSave(selected, e)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', color: savedExs.includes(selected.id) ? '#f59e0b' : '#64748b', fontSize: '0.75rem', cursor: 'pointer' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill={savedExs.includes(selected.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                      {savedExs.includes(selected.id) ? 'Saved' : 'Favorite'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.75rem', cursor: 'pointer' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                      Share
                  </div>
              </div>

              {/* Exercise Details Section */}
              <div style={{ marginBottom: '1.5rem' }}>
                 <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', fontWeight: 700 }}>Exercise Details</div>
                 
                 <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #f8fafc', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Body Part</span>
                    <span style={{ color: '#0f172a', fontSize: '0.85rem', fontWeight: 500, textTransform: 'capitalize' }}>{selected.muscle_group}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #f8fafc', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Equipment</span>
                    <span style={{ color: '#0f172a', fontSize: '0.85rem', fontWeight: 500, textTransform: 'capitalize' }}>{selected.equipment || 'Bodyweight'}</span>
                 </div>
              </div>

              {selected.instructions && (
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem', fontWeight: 700 }}>Instructions:</div>
                  <p style={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>{selected.instructions}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ExerciseCard({ ex, color, isSaved, onToggleSave, onClick }) {
  const imgUrl = `/media/images/${ex.name}.webp`;
  const [hover, setHover] = useState(false);

  return (
    <div 
      onClick={onClick} 
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ 
        background: '#fff', 
        border: '1px solid #f1f5f9', 
        borderRadius: '16px', 
        padding: '1.25rem',
        cursor: 'pointer', 
        transition: 'all 0.2s ease', 
        boxShadow: hover ? '0 10px 25px -5px rgba(0, 0, 0, 0.05)' : '0 1px 3px 0 rgba(0, 0, 0, 0.02)',
        transform: hover ? 'translateY(-2px)' : 'none',
        display: 'flex', 
        flexDirection: 'column',
        height: '340px',
        position: 'relative'
      }}>
      
      {/* Top Actions: Bookmark ONLY */}
      <div style={{ display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
          <button onClick={onToggleSave} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isSaved ? '#f59e0b' : '#cbd5e1', padding: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
          </button>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0.5rem 0 1.5rem 0', position: 'relative' }}>
         <img 
            src={imgUrl} 
            alt={ex.name} 
            style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', mixBlendMode: 'multiply' }} 
            loading="lazy" 
            onError={(e) => { 
                e.target.style.display = 'none'; 
                e.target.parentElement.innerHTML = `<div style="color: #cbd5e1; font-weight: 800; font-size: 3rem; opacity: 0.5;">${ex.name.charAt(0)}</div>`; 
            }} 
         />
      </div>

      <div style={{ marginTop: 'auto' }}>
        <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#0f172a', marginBottom: '0.25rem' }}>{ex.name}</div>
        <div style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'capitalize' }}>
          {ex.muscle_group}
          {ex.equipment && <span style={{ color: '#94a3b8' }}> • {ex.equipment}</span>}
        </div>
      </div>
    </div>
  )
}
