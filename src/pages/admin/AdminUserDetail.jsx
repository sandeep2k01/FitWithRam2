import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const TABS = ['Overview', 'Workouts', 'Diet', 'Progress']

const S = {
  page: { maxWidth: 900, margin: '0 auto' },
  back: { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', marginBottom: '1.5rem', letterSpacing: '0.5px' },
  header: { display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', flexWrap: 'wrap' },
  avatar: { width: 56, height: 56, borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, color: '#fff', flexShrink: 0 },
  tabs: { display: 'flex', gap: '0.25rem', borderBottom: '0.5px solid var(--border)', marginBottom: '2rem' },
  tab: (active) => ({ padding: '0.6rem 1.25rem', fontSize: '0.78rem', fontWeight: active ? 700 : 400, color: active ? '#111' : 'var(--muted)', background: 'none', border: 'none', borderBottom: active ? '2px solid #111' : '2px solid transparent', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.5px', transition: 'all 0.15s' }),
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  label: { fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted)', marginBottom: '0.35rem' },
  input: { width: '100%', padding: '0.6rem 0.75rem', border: '0.5px solid var(--border)', borderRadius: 8, fontSize: '0.85rem', fontFamily: 'inherit', background: '#fafafa', color: '#111', outline: 'none', boxSizing: 'border-box' },
  btn: { padding: '0.6rem 1.5rem', background: '#111', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  btnDanger: { padding: '0.45rem 1rem', background: 'transparent', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: 8, fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' },
  btnGhost: { padding: '0.45rem 1rem', background: 'transparent', color: 'var(--muted)', border: '0.5px solid var(--border)', borderRadius: 8, fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' },
  card: { background: '#fff', border: '0.5px solid var(--border)', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' },
  row: { display: 'grid', alignItems: 'center', padding: '0.65rem 0', borderBottom: '0.5px solid var(--border)', fontSize: '0.83rem' },
  statBox: { background: '#fafafa', border: '0.5px solid var(--border)', borderRadius: 10, padding: '1rem', textAlign: 'center' },
}

export default function AdminUserDetail() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('Overview')
  const [profile, setProfile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Workouts tab
  const [workouts, setWorkouts] = useState([])
  const [loadingWorkouts, setLoadingWorkouts] = useState(false)

  // Diet tab
  const [dietPlan, setDietPlan] = useState({ calories: '', protein: '', carbs: '', fat: '', notes: '', meal_plan: '' })
  const [savingDiet, setSavingDiet] = useState(false)
  const [meals, setMeals] = useState([])

  // Progress tab
  const [progressStats, setProgressStats] = useState(null)

  useEffect(() => { fetchProfile() }, [userId])
  useEffect(() => {
    if (tab === 'Workouts') fetchWorkouts()
    if (tab === 'Diet') fetchDiet()
    if (tab === 'Progress') fetchProgress()
  }, [tab])

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) {
      setProfile(data)
      if (data.diet_plan) setDietPlan(data.diet_plan)
    }
  }

  const fetchWorkouts = async () => {
    setLoadingWorkouts(true)
    const { data } = await supabase
      .from('workouts')
      .select('*, workout_exercises(*, exercises(name, muscle_group))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    setWorkouts(data || [])
    setLoadingWorkouts(false)
  }

  const fetchDiet = async () => {
    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const { data } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', weekAgo)
      .order('created_at', { ascending: false })
    setMeals(data || [])
  }

  const fetchProgress = async () => {
    const { data: workoutData } = await supabase.from('workouts').select('created_at, total_volume, duration_minutes').eq('user_id', userId)
    const { data: mealData } = await supabase.from('food_logs').select('calories, protein_g, carbs_g, fat_g').eq('user_id', userId)
    const totalVol = workoutData?.reduce((a, w) => a + (w.total_volume || 0), 0) || 0
    const avgCals = mealData?.length ? Math.round(mealData.reduce((a, m) => a + (m.calories || 0), 0) / mealData.length) : 0
    const avgProtein = mealData?.length ? Math.round(mealData.reduce((a, m) => a + (m.protein_g || 0), 0) / mealData.length) : 0
    setProgressStats({ totalWorkouts: workoutData?.length || 0, totalVolume: totalVol, totalMeals: mealData?.length || 0, avgCalories: avgCals, avgProtein })
  }

  const saveProfile = async () => {
    setSaving(true)
    await supabase.from('profiles').update({
      full_name: profile.full_name,
      plan: profile.plan,
      is_premium: profile.plan !== 'free',
      fitness_level: profile.fitness_level,
      goal: profile.goal,
      age: profile.age,
      weight: profile.weight,
      height: profile.height,
    }).eq('id', userId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const saveDietPlan = async () => {
    setSavingDiet(true)
    await supabase.from('profiles').update({ diet_plan: dietPlan }).eq('id', userId)
    setSavingDiet(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const deleteWorkout = async (workoutId) => {
    if (!confirm('Delete this workout?')) return
    await supabase.from('workouts').delete().eq('id', workoutId)
    setWorkouts(prev => prev.filter(w => w.id !== workoutId))
  }

  if (!profile) return <div style={{ padding: '3rem', color: 'var(--muted)', fontSize: '0.85rem' }}>Loading member...</div>

  const initials = (profile.full_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div style={S.page}>
      <button style={S.back} onClick={() => navigate('/admin/members')}>← Back to Members</button>

      {/* Header */}
      <div style={S.header}>
        <div style={S.avatar}>{initials}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--ff-display)', fontSize: '1.75rem', letterSpacing: '2px' }}>{profile.full_name || 'Unknown'}</div>
          <div style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: '0.2rem' }}>{profile.email}</div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className={`badge badge-${profile.is_premium ? 'success' : 'neutral'}`} style={{ fontSize: '0.75rem' }}>{profile.plan || 'free'}</span>
          <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>Member</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={S.tabs}>
        {TABS.map(t => <button key={t} style={S.tab(tab === t)} onClick={() => setTab(t)}>{t}</button>)}
      </div>

      {/* ── Overview Tab ── */}
      {tab === 'Overview' && (
        <div>
          <div style={S.card}>
            <div style={{ fontFamily: 'var(--ff-display)', fontSize: '0.9rem', letterSpacing: '1px', marginBottom: '1.25rem' }}>PROFILE & PLAN</div>
            <div style={{ ...S.grid2, marginBottom: '1rem' }}>
              {[
                { label: 'Full Name', key: 'full_name' },
                { label: 'Age', key: 'age', type: 'number' },
                { label: 'Weight (kg)', key: 'weight', type: 'number' },
                { label: 'Height (cm)', key: 'height', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <div style={S.label}>{f.label}</div>
                  <input style={S.input} type={f.type || 'text'} value={profile[f.key] || ''} onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div style={{ ...S.grid2, marginBottom: '1rem' }}>
              <div>
                <div style={S.label}>Fitness Level</div>
                <select style={S.input} value={profile.fitness_level || 'beginner'} onChange={e => setProfile(p => ({ ...p, fitness_level: e.target.value }))}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="elite">Elite</option>
                </select>
              </div>
              <div>
                <div style={S.label}>Goal</div>
                <select style={S.input} value={profile.goal || 'general'} onChange={e => setProfile(p => ({ ...p, goal: e.target.value }))}>
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="endurance">Endurance</option>
                  <option value="strength">Strength</option>
                  <option value="general">General Fitness</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={S.label}>Plan / Subscription</div>
              <select style={{ ...S.input, maxWidth: 200 }} value={profile.plan || 'free'} onChange={e => setProfile(p => ({ ...p, plan: e.target.value, is_premium: e.target.value !== 'free' }))}>
                <option value="free">Free</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="lifetime">Lifetime</option>
              </select>
            </div>
            <button style={S.btn} onClick={saveProfile} disabled={saving}>
              {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* ── Workouts Tab ── */}
      {tab === 'Workouts' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Showing last 20 workouts for this user</div>
          </div>
          {loadingWorkouts ? (
            <div style={{ color: 'var(--muted)', fontSize: '0.85rem', padding: '2rem', textAlign: 'center' }}>Loading workouts...</div>
          ) : workouts.length === 0 ? (
            <div style={{ ...S.card, textAlign: 'center', color: 'var(--muted)', padding: '3rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🏋️</div>
              <div>No workouts logged yet.</div>
            </div>
          ) : workouts.map(w => (
            <div key={w.id} style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{w.name}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.72rem', marginTop: '0.15rem' }}>
                    {new Date(w.created_at).toLocaleString('en-IN')} · {w.duration_minutes || 0} min · {w.total_volume || 0} kg total vol
                  </div>
                </div>
                <button style={S.btnDanger} onClick={() => deleteWorkout(w.id)}>Delete</button>
              </div>
              {w.workout_exercises?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                  {w.workout_exercises.map((we, i) => (
                    <span key={i} style={{ fontSize: '0.72rem', background: '#f5f5f5', border: '0.5px solid var(--border)', borderRadius: 6, padding: '0.25rem 0.6rem', color: '#555' }}>
                      {we.exercises?.name || 'Exercise'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Diet Tab ── */}
      {tab === 'Diet' && (
        <div>
          {/* Admin-controlled diet plan */}
          <div style={S.card}>
            <div style={{ fontFamily: 'var(--ff-display)', fontSize: '0.9rem', letterSpacing: '1px', marginBottom: '0.4rem' }}>ASSIGNED DIET PLAN</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.75rem', marginBottom: '1.25rem' }}>Set daily macro targets and meal notes for this user. They will see this in their dashboard.</div>
            <div style={{ ...S.grid2, marginBottom: '1rem' }}>
              {[
                { label: 'Daily Calories (kcal)', key: 'calories', type: 'number' },
                { label: 'Protein (g)', key: 'protein', type: 'number' },
                { label: 'Carbs (g)', key: 'carbs', type: 'number' },
                { label: 'Fat (g)', key: 'fat', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <div style={S.label}>{f.label}</div>
                  <input style={S.input} type="number" placeholder="0" value={dietPlan[f.key] || ''} onChange={e => setDietPlan(d => ({ ...d, [f.key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={S.label}>Meal Plan / Notes (shown to user)</div>
              <textarea
                style={{ ...S.input, minHeight: 90, resize: 'vertical' }}
                placeholder="e.g. Breakfast: 3 eggs + oats. Lunch: Chicken rice. Post-workout: Protein shake..."
                value={dietPlan.meal_plan || ''}
                onChange={e => setDietPlan(d => ({ ...d, meal_plan: e.target.value }))}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={S.label}>Admin Notes (private)</div>
              <textarea
                style={{ ...S.input, minHeight: 60, resize: 'vertical' }}
                placeholder="Private notes for trainer reference..."
                value={dietPlan.notes || ''}
                onChange={e => setDietPlan(d => ({ ...d, notes: e.target.value }))}
              />
            </div>
            <button style={S.btn} onClick={saveDietPlan} disabled={savingDiet}>
              {saved ? '✓ Plan Saved' : savingDiet ? 'Saving...' : 'Save Diet Plan'}
            </button>
          </div>

          {/* User's recent meal logs */}
          <div style={S.card}>
            <div style={{ fontFamily: 'var(--ff-display)', fontSize: '0.9rem', letterSpacing: '1px', marginBottom: '1rem' }}>USER'S MEAL LOGS (LAST 7 DAYS)</div>
            {meals.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: '0.83rem', textAlign: 'center', padding: '1.5rem 0' }}>No meals logged recently.</div>
            ) : meals.map(meal => (
              <div key={meal.id} style={{ ...S.row, gridTemplateColumns: '1.5fr repeat(4, 1fr) 80px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{new Date(meal.created_at).toLocaleDateString('en-IN')}</span>
                <span>{meal.calories || 0} <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>kcal</span></span>
                <span>{meal.protein_g || 0}g <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>prot</span></span>
                <span>{meal.carbs_g || 0}g <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>carb</span></span>
                <span>{meal.fat_g || 0}g <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>fat</span></span>
                <button style={S.btnDanger} onClick={async () => {
                  await supabase.from('food_logs').delete().eq('id', meal.id)
                  setMeals(prev => prev.filter(m => m.id !== meal.id))
                }}>Del</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Progress Tab ── */}
      {tab === 'Progress' && (
        <div>
          {progressStats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Total Workouts', value: progressStats.totalWorkouts, icon: '🏋️' },
                { label: 'Total Volume', value: `${progressStats.totalVolume.toLocaleString()} kg`, icon: '⚖️' },
                { label: 'Meals Logged', value: progressStats.totalMeals, icon: '🥗' },
                { label: 'Avg Calories', value: `${progressStats.avgCalories} kcal`, icon: '🔥' },
                { label: 'Avg Protein', value: `${progressStats.avgProtein}g`, icon: '💪' },
              ].map(stat => (
                <div key={stat.label} style={S.statBox}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{stat.icon}</div>
                  <div style={{ fontFamily: 'var(--ff-display)', fontSize: '1.5rem', letterSpacing: '1px' }}>{stat.value}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '0.2rem' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}
          <div style={S.card}>
            <div style={{ fontFamily: 'var(--ff-display)', fontSize: '0.9rem', letterSpacing: '1px', marginBottom: '0.75rem' }}>USER INFO</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.83rem' }}>
              {[
                ['Fitness Level', profile.fitness_level || 'Not set'],
                ['Goal', (profile.goal || 'Not set').replace('_', ' ')],
                ['Age', profile.age || 'Not set'],
                ['Weight', profile.weight ? `${profile.weight} kg` : 'Not set'],
                ['Height', profile.height ? `${profile.height} cm` : 'Not set'],
                ['Member Since', new Date(profile.created_at).toLocaleDateString('en-IN')],
              ].map(([label, value]) => (
                <div key={label} style={{ background: '#fafafa', border: '0.5px solid var(--border)', borderRadius: 8, padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted)', marginBottom: '0.25rem' }}>{label}</div>
                  <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
