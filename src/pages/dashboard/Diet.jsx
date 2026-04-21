import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { Link } from 'react-router-dom'

const MACRO_COLORS = { Calories: '#111', Protein: '#3b82f6', Carbs: '#f59e0b', Fat: '#ef4444' }

function MacroRing({ value, max, color, label, unit }) {
  const pct = Math.min(1, (value || 0) / (max || 1))
  const r = 30, circ = 2 * Math.PI * r
  const dash = pct * circ
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#f0f0f0" strokeWidth="6" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 40 40)" style={{ transition: 'stroke-dasharray 0.6s ease' }} />
        <text x="40" y="44" textAnchor="middle" fontSize="13" fontWeight="700" fill={color}>{value || 0}</text>
      </svg>
      <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#aaa', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: '0.72rem', color: '#bbb' }}>{unit}</div>
    </div>
  )
}

function FoodLogRow({ item, onDelete }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 0', borderBottom: '1px solid #f5f5f5' }}>
      <div>
        <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#111' }}>{item.food_name}</div>
        <div style={{ fontSize: '0.72rem', color: '#bbb', marginTop: '0.15rem' }}>
          {item.protein_g && `Protein ${item.protein_g}g`}{item.carbs_g && ` · Carbs ${item.carbs_g}g`}{item.fat_g && ` · Fat ${item.fat_g}g`}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#111' }}>{item.calories} kcal</span>
        {onDelete && (
          <button onClick={() => onDelete(item.id)} style={{ background: 'none', border: 'none', color: '#ddd', cursor: 'pointer', fontSize: '0.9rem' }}
            onMouseEnter={e => e.target.style.color = '#ef4444'}
            onMouseLeave={e => e.target.style.color = '#ddd'}>✕</button>
        )}
      </div>
    </div>
  )
}

export default function Diet() {
  const { profile } = useAuthStore()
  const [myPlan, setMyPlan] = useState(null)
  const [meals, setMeals] = useState([])
  const [todayLog, setTodayLog] = useState([])
  const [tab, setTab] = useState('today')
  const [loading, setLoading] = useState(true)
  const [addForm, setAddForm] = useState({ food_name: '', calories: '', protein_g: '', carbs_g: '', fat_g: '', meal_type: 'Lunch' })
  const [adding, setAdding] = useState(false)
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => { if (profile) fetchDiet() }, [profile])

  const fetchDiet = async () => {
    // Read admin-assigned diet_plan from profiles table
    const { data: profileData } = await supabase
      .from('profiles').select('diet_plan').eq('id', profile.id).single()
    if (profileData?.diet_plan) {
      // Merge into auth store so Diet page reads it reactively
      const store = await import('../../store/authStore')
      store.useAuthStore.setState(s => ({ ...s, profile: { ...s.profile, diet_plan: profileData.diet_plan } }))
    }
    // Fallback: legacy user_diet_plans table
    const { data: assigned } = await supabase
      .from('user_diet_plans')
      .select('*, diet_plan:diet_plans(*, diet_meals(*))')
      .eq('user_id', profile.id).maybeSingle()
    if (assigned?.diet_plan) {
      setMyPlan(assigned.diet_plan)
      setMeals(assigned.diet_plan.diet_meals || [])
    }
    const today = new Date().toISOString().split('T')[0]
    const { data: log } = await supabase.from('food_logs').select('*').eq('user_id', profile.id).gte('created_at', today).order('created_at', { ascending: false })
    setTodayLog(log || [])
    setLoading(false)
  }

  const logFood = async () => {
    if (!addForm.food_name || !addForm.calories) return
    setAdding(true)
    try {
      const payload = {
        user_id: profile.id,
        food_name: addForm.food_name,
        calories: parseInt(addForm.calories) || 0,
        protein_g: parseFloat(addForm.protein_g) || null,
        carbs_g: parseFloat(addForm.carbs_g) || null,
        fat_g: parseFloat(addForm.fat_g) || null,
        meal_type: addForm.meal_type,
      }
      const { data } = await supabase.from('food_logs').insert(payload).select().single()
      setTodayLog(prev => [data, ...prev])
      setAddForm({ food_name: '', calories: '', protein_g: '', carbs_g: '', fat_g: '', meal_type: 'Lunch' })
      setShowAdd(false)
    } finally { setAdding(false) }
  }

  const deleteLog = async (id) => {
    await supabase.from('food_logs').delete().eq('id', id)
    setTodayLog(prev => prev.filter(l => l.id !== id))
  }

  const totals = {
    calories: todayLog.reduce((a, l) => a + (l.calories || 0), 0),
    protein: todayLog.reduce((a, l) => a + (l.protein_g || 0), 0),
    carbs: todayLog.reduce((a, l) => a + (l.carbs_g || 0), 0),
    fat: todayLog.reduce((a, l) => a + (l.fat_g || 0), 0),
  }

  const adminPlan = profile?.diet_plan
  const target = {
    calories: adminPlan?.calories || myPlan?.daily_calories || 2000,
    protein: adminPlan?.protein || myPlan?.protein_g || 150,
    carbs: adminPlan?.carbs || myPlan?.carbs_g || 200,
    fat: adminPlan?.fat || myPlan?.fat_g || 60,
  }

  const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Pre-Workout', 'Post-Workout']

  const tabs = [
    { id: 'today', label: "Today's Meals" },
    { id: 'plan', label: 'My Plan' },
  ]

  if (loading) return <div style={{ color: '#aaa', padding: '2rem', textAlign: 'center', fontSize: '0.85rem' }}>Loading nutrition data...</div>

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111', marginBottom: '0.2rem' }}>Nutrition</h1>
          <p style={{ color: '#aaa', fontSize: '0.83rem' }}>Track your daily macros and meal plan</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', background: '#111', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          + Add Food
        </button>
      </div>

      {!profile?.is_premium && (
        <div style={{ background: '#fff9f0', border: '1px solid #fde68a', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#92400e', marginBottom: '0.2rem' }}>Premium Feature</div>
            <div style={{ fontSize: '0.78rem', color: '#b45309' }}>Unlock personalized diet plans with Premium</div>
          </div>
          <Link to="/dashboard/payments" style={{ padding: '0.45rem 1rem', background: '#f59e0b', color: '#fff', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>Upgrade</Link>
        </div>
      )}

      {/* Macro Rings Summary */}
      <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#111', marginBottom: '1.25rem' }}>Today's Macros</div>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <MacroRing value={Math.round(totals.calories)} max={target.calories} color="#111" label="Calories" unit="kcal" />
          <MacroRing value={Math.round(totals.protein)} max={target.protein} color="#3b82f6" label="Protein" unit="grams" />
          <MacroRing value={Math.round(totals.carbs)} max={target.carbs} color="#f59e0b" label="Carbs" unit="grams" />
          <MacroRing value={Math.round(totals.fat)} max={target.fat} color="#ef4444" label="Fat" unit="grams" />
        </div>
        {/* Calorie bar */}
        <div style={{ marginTop: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#aaa', marginBottom: '0.4rem' }}>
            <span>{totals.calories} kcal consumed</span>
            <span>{target.calories - totals.calories > 0 ? `${target.calories - totals.calories} remaining` : 'Target reached!'}</span>
          </div>
          <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, (totals.calories / target.calories) * 100)}%`, background: totals.calories > target.calories ? '#ef4444' : '#111', borderRadius: 4, transition: 'width 0.5s' }} />
          </div>
        </div>
      </div>

      {/* Add food form */}
      {showAdd && (
        <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#111', marginBottom: '1rem' }}>Add Food</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.68rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Food Name</label>
              <input placeholder="e.g. Chicken Rice" value={addForm.food_name} onChange={e => setAddForm(p => ({ ...p, food_name: e.target.value }))}
                style={{ width: '100%', padding: '0.6rem 0.75rem', background: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: '0.85rem', color: '#111', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            {[['calories', 'Calories'], ['protein_g', 'Protein g'], ['carbs_g', 'Carbs g'], ['fat_g', 'Fat g']].map(([k, l]) => (
              <div key={k}>
                <label style={{ fontSize: '0.68rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>{l}</label>
                <input type="number" placeholder="0" value={addForm[k]} onChange={e => setAddForm(p => ({ ...p, [k]: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', background: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: '0.85rem', color: '#111', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {MEAL_TYPES.map(mt => (
              <button key={mt} onClick={() => setAddForm(p => ({ ...p, meal_type: mt }))} style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', background: addForm.meal_type === mt ? '#111' : '#f0f0f0', color: addForm.meal_type === mt ? '#fff' : '#666', border: 'none', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit', fontWeight: addForm.meal_type === mt ? 600 : 400 }}>{mt}</button>
            ))}
            <button onClick={logFood} disabled={adding} style={{ marginLeft: 'auto', padding: '0.5rem 1.25rem', background: '#111', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              {adding ? 'Adding...' : 'Add Food'}
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', background: '#f0f0f0', borderRadius: 10, padding: '0.25rem', marginBottom: '1.5rem', width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: tab === t.id ? 600 : 400, background: tab === t.id ? '#fff' : 'transparent', color: tab === t.id ? '#111' : '#888', border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit', boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>{t.label}</button>
        ))}
      </div>

      {/* Today's Meals */}
      {tab === 'today' && (
        <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '1.5rem' }}>
          {todayLog.length === 0 ? (
            <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🥗</div>
              <div style={{ fontWeight: 700, fontSize: '1.25rem', color: '#111', marginBottom: '0.5rem' }}>Fuel Your Training Right</div>
              <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '2.5rem' }}>Here's how to manage your nutrition.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', textAlign: 'left', marginBottom: '2.5rem', background: '#fafafa', padding: '2rem', borderRadius: 12 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ccc', marginBottom: '0.2rem' }}>STEP 1</div>
                  <div style={{ fontWeight: 700, color: '#111', marginBottom: '0.4rem', fontSize: '1.05rem' }}>Check Your Plan</div>
                  <div style={{ color: '#777', fontSize: '0.82rem', lineHeight: 1.5 }}>Your trainer assigns your macro targets.</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ccc', marginBottom: '0.2rem' }}>STEP 2</div>
                  <div style={{ fontWeight: 700, color: '#111', marginBottom: '0.4rem', fontSize: '1.05rem' }}>Add Your Meals</div>
                  <div style={{ color: '#777', fontSize: '0.82rem', lineHeight: 1.5 }}>Record breakfast, lunch, and dinner.</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ccc', marginBottom: '0.2rem' }}>STEP 3</div>
                  <div style={{ fontWeight: 700, color: '#111', marginBottom: '0.4rem', fontSize: '1.05rem' }}>Hit Your Targets</div>
                  <div style={{ color: '#777', fontSize: '0.82rem', lineHeight: 1.5 }}>Track calories, protein & macros daily.</div>
                </div>
              </div>

              <div style={{ padding: '0.75rem 1.25rem', background: '#f8fafc', color: '#475569', borderRadius: 8, fontSize: '0.85rem', fontWeight: 500, display: 'inline-block' }}>
                📋 Your trainer (Ram) will assign a personalized diet plan
              </div>
            </div>
          ) : (
            <>
              {MEAL_TYPES.filter(mt => todayLog.some(l => l.meal_type === mt)).map(mt => (
                <div key={mt} style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#aaa', marginBottom: '0.5rem' }}>{mt}</div>
                  {todayLog.filter(l => l.meal_type === mt).map(item => <FoodLogRow key={item.id} item={item} onDelete={deleteLog} />)}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* My Plan */}
      {tab === 'plan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Admin-assigned macro targets */}
          {adminPlan && (
            <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '1.5rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#f0fdf4', border: '0.5px solid #86efac', borderRadius: 999, padding: '0.25rem 0.8rem', fontSize: '0.7rem', fontWeight: 700, color: '#16a34a', letterSpacing: '0.5px', marginBottom: '1rem' }}>
                ✓ Plan assigned by Ram
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: adminPlan.meal_plan ? '1.25rem' : 0 }}>
                {[['Calories', adminPlan.calories, 'kcal', '#111'], ['Protein', adminPlan.protein, 'g', '#3b82f6'], ['Carbs', adminPlan.carbs, 'g', '#f59e0b'], ['Fat', adminPlan.fat, 'g', '#ef4444']].map(([l, v, u, c]) => (
                  <div key={l} style={{ textAlign: 'center', padding: '0.75rem', background: '#fafafa', borderRadius: 8 }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: c }}>{v || '—'}<span style={{ fontSize: '0.65rem', color: '#bbb', fontWeight: 400 }}>{u}</span></div>
                    <div style={{ fontSize: '0.68rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{l}</div>
                  </div>
                ))}
              </div>
              {adminPlan.meal_plan && (
                <div style={{ background: '#fafafa', border: '0.5px solid #e5e5e5', borderRadius: 8, padding: '1rem' }}>
                  <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#aaa', marginBottom: '0.5rem', fontWeight: 700 }}>Meal Plan</div>
                  <div style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{adminPlan.meal_plan}</div>
                </div>
              )}
            </div>
          )}

          {/* Legacy plan from diet_plans table */}
          {myPlan && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '1.5rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111', marginBottom: '0.5rem' }}>{myPlan.name}</div>
                {myPlan.description && <div style={{ color: '#aaa', fontSize: '0.83rem', marginBottom: '1rem' }}>{myPlan.description}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                  {[['Calories', myPlan.daily_calories, 'kcal', '#111'], ['Protein', myPlan.protein_g, 'g', '#3b82f6'], ['Carbs', myPlan.carbs_g, 'g', '#f59e0b'], ['Fat', myPlan.fat_g, 'g', '#ef4444']].map(([l, v, u, c]) => (
                    <div key={l} style={{ textAlign: 'center', padding: '0.75rem', background: '#f9f9f9', borderRadius: 8 }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: c }}>{v}<span style={{ fontSize: '0.65rem', color: '#bbb', fontWeight: 400 }}>{u}</span></div>
                      <div style={{ fontSize: '0.68rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
              {meals.map(meal => (
                <div key={meal.id} style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111' }}>{meal.meal_name}</div>
                    {meal.calories && <span style={{ background: '#f5f5f5', padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>{meal.calories} kcal</span>}
                  </div>
                  {meal.time_of_day && <div style={{ fontSize: '0.68rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>{meal.time_of_day}</div>}
                  {meal.foods && <div style={{ fontSize: '0.82rem', color: '#777', lineHeight: 1.6 }}>{meal.foods}</div>}
                </div>
              ))}
            </div>
          )}

          {/* No plan at all */}
          {!adminPlan && !myPlan && (
            <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
              <div style={{ fontWeight: 700, color: '#111', marginBottom: '0.5rem' }}>No Plan Assigned Yet</div>
              <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Your trainer will assign a personalized diet plan. Check back soon.</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
