import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { STATUS_COLORS } from '../../lib/constants'

const S = {
  heading: { fontSize: '1.5rem', fontWeight: 700, color: '#111', marginBottom: '0.2rem' },
  sub: { color: '#aaa', fontSize: '0.83rem', marginBottom: '2rem' },
  card: { background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' },
  sectionTitle: { fontSize: '0.72rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' },
  mealRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.65rem 0', borderBottom: '1px solid #f5f5f5' },
}

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.pending
  return (
    <span style={{ padding: '0.3rem 0.75rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', background: c.bg, color: c.color }}>
      {status}
    </span>
  )
}

export default function MyPlan() {
  const { profile } = useAuthStore()
  const [inquiry, setInquiry] = useState(null)
  const [program, setProgram] = useState(null)
  const [dietPlan, setDietPlan] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (profile) fetchAll() }, [profile])

  const fetchAll = async () => {
    // Latest inquiry (any type)
    const { data: inq } = await supabase
      .from('inquiries')
      .select('*, assigned_program:programs(*), assigned_diet:diet_plans(*, diet_meals(*))')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    setInquiry(inq)

    // Admin-assigned program via profile
    if (profile.assigned_program_id) {
      const { data: prog } = await supabase.from('programs').select('*').eq('id', profile.assigned_program_id).maybeSingle()
      setProgram(prog)
    } else if (inq?.assigned_program) {
      setProgram(inq.assigned_program)
    }

    // Admin-assigned diet via profile diet_plan JSONB
    const adminDiet = profile.diet_plan
    if (adminDiet && (adminDiet.calories || adminDiet.protein)) {
      setDietPlan({ type: 'admin', ...adminDiet })
    } else if (inq?.assigned_diet) {
      setDietPlan({ type: 'legacy', ...inq.assigned_diet })
    }

    setLoading(false)
  }

  if (loading) return <div style={{ color: '#aaa', padding: '2rem', textAlign: 'center', fontSize: '0.85rem' }}>Loading...</div>

  const hasAnything = inquiry || program || dietPlan

  return (
    <div>
      <h1 style={S.heading}>My Plan</h1>
      <p style={S.sub}>Everything Ram has assigned to you — your training status, program, and diet plan.</p>

      {!hasAnything ? (
        <div style={{ ...S.card, textAlign: 'center', padding: '3.5rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111', marginBottom: '0.5rem' }}>Ram is preparing your plan</div>
          <p style={{ color: '#777', fontSize: '0.88rem', marginBottom: '2rem' }}>You will see your workout and diet plan here as soon as Ram assigns it.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/dashboard/offline-training" style={{ padding: '0.65rem 1.5rem', background: '#111', color: '#fff', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
              Go to Offline Training
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
            <div style={S.card}>
              <div style={S.sectionTitle}>Training Status</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#111', marginBottom: '0.3rem' }}>
                    {inquiry.training_type === 'online' ? '🌐 Online Training' : '🏋️ Offline Training'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#aaa' }}>
                    Goal: <strong style={{ color: '#555' }}>{inquiry.fitness_goal}</strong> · 
                    Submitted {new Date(inquiry.created_at).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <StatusBadge status={inquiry.status} />
              </div>

              {inquiry.ram_notes && (
                <div style={{ background: '#fffbeb', border: '0.5px solid #fde68a', borderRadius: 8, padding: '0.85rem' }}>
                  <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#b45309', marginBottom: '0.35rem', fontWeight: 700 }}>📝 Ram's Notes for You</div>
                  <div style={{ fontSize: '0.88rem', color: '#444', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{inquiry.ram_notes}</div>
                </div>
              )}
            </div>
          )}

          {/* Assigned Program */}
          {program ? (
            <div style={S.card}>
              <div style={S.sectionTitle}>Assigned Workout Program</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111' }}>{program.name}</div>
                <span style={{ background: '#f0f0f0', padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600, color: '#555', textTransform: 'capitalize' }}>{program.level}</span>
              </div>
              {program.description && <p style={{ color: '#666', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1rem' }}>{program.description}</p>}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
                {[
                  ['Goal', program.fitness_goal || program.goal || '—'],
                  ['Duration', program.duration_weeks ? `${program.duration_weeks} weeks` : '—'],
                  ['Days/Week', program.days_per_week ? `${program.days_per_week} days` : '—'],
                  ['Type', program.training_type || '—'],
                ].map(([l, v]) => (
                  <div key={l} style={{ textAlign: 'center', padding: '0.75rem', background: '#fafafa', borderRadius: 8 }}>
                    <div style={{ fontSize: '0.68rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>{l}</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111', textTransform: 'capitalize' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ ...S.card, opacity: 0.7, textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '0.88rem', color: '#aaa' }}>🏋️ Workout program — coming soon from Ram</div>
            </div>
          )}

          {/* Assigned Diet Plan */}
          {dietPlan ? (
            <div style={S.card}>
              <div style={S.sectionTitle}>Assigned Diet Plan</div>

              {/* Macro targets */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {[
                  ['Calories', dietPlan.calories, 'kcal', '#111'],
                  ['Protein', dietPlan.protein, 'g', '#3b82f6'],
                  ['Carbs', dietPlan.carbs, 'g', '#f59e0b'],
                  ['Fat', dietPlan.fat, 'g', '#ef4444'],
                ].map(([l, v, u, c]) => (
                  <div key={l} style={{ textAlign: 'center', padding: '0.75rem', background: '#fafafa', borderRadius: 8 }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: c }}>{v || '—'}<span style={{ fontSize: '0.65rem', color: '#bbb', fontWeight: 400 }}>{u}</span></div>
                    <div style={{ fontSize: '0.68rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{l}</div>
                  </div>
                ))}
              </div>

              {/* Meal plan notes */}
              {dietPlan.meal_plan && (
                <div style={{ background: '#fafafa', border: '0.5px solid #e5e5e5', borderRadius: 8, padding: '1rem' }}>
                  <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#aaa', marginBottom: '0.5rem', fontWeight: 700 }}>Meal Plan</div>
                  <div style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{dietPlan.meal_plan}</div>
                </div>
              )}

              {/* Legacy diet_meals */}
              {dietPlan.diet_meals?.length > 0 && (
                <div>
                  <div style={{ ...S.sectionTitle, marginTop: '1rem' }}>Meals</div>
                  {dietPlan.diet_meals.map(meal => (
                    <div key={meal.id} style={S.mealRow}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111' }}>{meal.meal_name}</div>
                        {meal.time_of_day && <div style={{ fontSize: '0.72rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{meal.time_of_day}</div>}
                        {meal.foods && <div style={{ fontSize: '0.82rem', color: '#666', lineHeight: 1.5, marginTop: '0.2rem' }}>{meal.foods}</div>}
                      </div>
                      {meal.calories && <span style={{ background: '#f5f5f5', padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600, color: '#555', flexShrink: 0 }}>{meal.calories} kcal</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ ...S.card, opacity: 0.7, textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '0.88rem', color: '#aaa' }}>🥗 Diet plan — coming soon from Ram</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
