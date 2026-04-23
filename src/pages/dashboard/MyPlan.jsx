import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { STATUS_COLORS } from '../../lib/constants'

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.pending
  return (
    <span style={{ padding: '0.3rem 0.75rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', background: c.bg, color: c.color }}>
      {status}
    </span>
  )
}

const cardStyle = {
  background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem',
}
const sectionLabel = {
  fontSize: '0.68rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem',
}

export default function MyPlan() {
  const { profile } = useAuthStore()
  const [inquiry, setInquiry] = useState(null)
  const [program, setProgram] = useState(null)
  const [dietPlan, setDietPlan] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (profile) fetchAll() }, [profile])

  const fetchAll = async () => {
    // Latest inquiry with assigned items
    const { data: inq } = await supabase
      .from('inquiries')
      .select('*, assigned_program:programs(*), assigned_diet:diet_plans(*, diet_meals(*))')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    setInquiry(inq)

    // Program — from profile's assigned_program_id first, else from inquiry
    const programId = profile.assigned_program_id || inq?.assigned_program_id
    if (programId) {
      const { data: prog } = await supabase.from('programs').select('*').eq('id', programId).maybeSingle()
      setProgram(prog || inq?.assigned_program)
    } else if (inq?.assigned_program) {
      setProgram(inq.assigned_program)
    }

    // Diet — from profile's diet_plan jsonb first, else from inquiry
    if (profile.diet_plan && (profile.diet_plan.calories || profile.diet_plan.protein)) {
      setDietPlan({ ...profile.diet_plan, diet_meals: [] })
    } else if (inq?.assigned_diet) {
      setDietPlan(inq.assigned_diet)
    }

    setLoading(false)
  }

  if (loading) return <div style={{ color: '#aaa', padding: '2rem', textAlign: 'center' }}>Loading...</div>

  const hasAnything = inquiry || program || dietPlan

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#aaa', marginBottom: '0.5rem' }}>Member Area</div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', letterSpacing: '2px', color: '#111', lineHeight: 1 }}>MY PLAN</h1>
        <p style={{ color: '#777', fontSize: '0.9rem', lineHeight: 1.7, marginTop: '0.75rem' }}>Everything Ram has assigned to you — your training status, program, and diet plan.</p>
      </div>

      {!hasAnything ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3.5rem 2rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📋</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111', marginBottom: '0.5rem' }}>Ram is preparing your plan</div>
          <p style={{ color: '#777', fontSize: '0.88rem', marginBottom: '2rem' }}>You will see your workout and diet plan here as soon as Ram assigns it.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/dashboard/offline-training" style={{ padding: '0.65rem 1.5rem', background: '#111', color: '#fff', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
              Contact Ram for Offline Training
            </Link>
            <Link to="/dashboard/online-training" style={{ padding: '0.65rem 1.5rem', background: 'transparent', color: '#111', border: '1px solid #111', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
              Upgrade to Online
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Training Status */}
          {inquiry && (
            <div style={cardStyle}>
              <div style={sectionLabel}>Training Status</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: inquiry.ram_notes ? '1rem' : 0, flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#111', marginBottom: '0.3rem' }}>
                    {inquiry.training_type === 'online' ? '🌐 Online Training' : '🏋️ Offline Training'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#aaa' }}>
                    Goal: <strong style={{ color: '#555' }}>{inquiry.fitness_goal}</strong> · Submitted {new Date(inquiry.created_at).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <StatusBadge status={inquiry.status} />
              </div>
              {inquiry.ram_notes && (
                <div style={{ background: '#fffbeb', border: '0.5px solid #fde68a', borderRadius: 8, padding: '0.85rem', marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#b45309', marginBottom: '0.35rem', fontWeight: 700 }}>📝 Ram's Notes for You</div>
                  <div style={{ fontSize: '0.88rem', color: '#444', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{inquiry.ram_notes}</div>
                </div>
              )}
            </div>
          )}

          {/* Assigned Program */}
          {program ? (
            <div style={cardStyle}>
              <div style={sectionLabel}>Assigned Workout Program</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111' }}>{program.name}</div>
                <span style={{ background: '#f0f0f0', padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600, color: '#555', textTransform: 'capitalize' }}>{program.level}</span>
              </div>
              {program.description && <p style={{ color: '#666', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1rem' }}>{program.description}</p>}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem' }}>
                {[
                  ['Goal', program.fitness_goal || '—'],
                  ['Duration', program.duration_weeks ? `${program.duration_weeks} weeks` : '—'],
                  ['Days/Week', program.days_per_week ? `${program.days_per_week} days` : '—'],
                  ['Type', program.training_type || '—'],
                ].map(([l, v]) => (
                  <div key={l} style={{ textAlign: 'center', padding: '0.75rem', background: '#fafafa', borderRadius: 8 }}>
                    <div style={{ fontSize: '0.65rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>{l}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111', textTransform: 'capitalize' }}>{v}</div>
                  </div>
                ))}
              </div>
              {program.ram_notes && (
                <div style={{ marginTop: '1rem', background: '#fafafa', borderRadius: 8, padding: '0.75rem', fontSize: '0.83rem', color: '#555', lineHeight: 1.6 }}>
                  <strong>Ram's Notes:</strong> {program.ram_notes}
                </div>
              )}
            </div>
          ) : (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '2rem', opacity: 0.6 }}>
              <div style={{ fontSize: '0.88rem', color: '#aaa' }}>🏋️ Workout program — Ram is preparing it</div>
            </div>
          )}

          {/* Assigned Diet */}
          {dietPlan ? (
            <div style={cardStyle}>
              <div style={sectionLabel}>Assigned Diet Plan</div>
              {dietPlan.name && <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111', marginBottom: '1rem' }}>{dietPlan.name}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {[
                  ['Calories', dietPlan.calories, 'kcal', '#111'],
                  ['Protein', dietPlan.protein, 'g', '#3b82f6'],
                  ['Carbs', dietPlan.carbs, 'g', '#f59e0b'],
                  ['Fat', dietPlan.fat, 'g', '#ef4444'],
                ].map(([l, v, u, c]) => (
                  <div key={l} style={{ textAlign: 'center', padding: '0.75rem', background: '#fafafa', borderRadius: 8 }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: c, lineHeight: 1 }}>{v || '—'}<span style={{ fontSize: '0.62rem', color: '#bbb', fontWeight: 400 }}> {u}</span></div>
                    <div style={{ fontSize: '0.65rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.2rem' }}>{l}</div>
                  </div>
                ))}
              </div>
              {dietPlan.diet_meals?.length > 0 && (
                <>
                  <div style={{ ...sectionLabel, marginBottom: '0.5rem' }}>Meals</div>
                  {dietPlan.diet_meals.map(meal => (
                    <div key={meal.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.65rem 0', borderBottom: '1px solid #f5f5f5' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111' }}>{meal.meal_name}</div>
                        {meal.time_of_day && <div style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{meal.time_of_day}</div>}
                        {meal.foods && <div style={{ fontSize: '0.82rem', color: '#666', marginTop: '0.2rem', lineHeight: 1.5 }}>{meal.foods}</div>}
                      </div>
                      {meal.calories && <span style={{ background: '#f5f5f5', padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600, color: '#555', flexShrink: 0 }}>{meal.calories} kcal</span>}
                    </div>
                  ))}
                </>
              )}
            </div>
          ) : (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '2rem', opacity: 0.6 }}>
              <div style={{ fontSize: '0.88rem', color: '#aaa' }}>🥗 Diet plan — Ram is preparing it</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
