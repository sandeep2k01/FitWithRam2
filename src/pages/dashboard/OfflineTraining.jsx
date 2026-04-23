import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { GOAL_IDS, getGoal } from '../../lib/goals'
import { TRAINING_TIMES, STATUS_COLORS, RAM_WHATSAPP, whatsappMemberMessage } from '../../lib/constants'

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.pending
  return (
    <span style={{ padding: '0.3rem 0.75rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', background: c.bg, color: c.color }}>
      {status}
    </span>
  )
}

export default function OfflineTraining() {
  const { profile } = useAuthStore()
  const [inquiry, setInquiry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    full_name: '', phone: '', email: '',
    fitness_goal: 'Muscle Building',
    preferred_time: 'Morning (6am-12pm)',
    location: '', message: '',
  })

  useEffect(() => {
    if (!profile) return
    setForm(f => ({
      ...f,
      full_name: profile.full_name || '',
      email: profile.email || '',
      phone: profile.phone || '',
    }))
    fetchInquiry()
  }, [profile])

  const fetchInquiry = async () => {
    const { data } = await supabase
      .from('inquiries')
      .select('*, assigned_program:programs(name, fitness_goal, level, days_per_week, duration_weeks), assigned_diet:diet_plans(name)')
      .eq('user_id', profile.id)
      .eq('training_type', 'offline')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    setInquiry(data)
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await supabase.from('inquiries').insert({
        user_id: profile.id, training_type: 'offline', ...form,
      }).select().single()
      setInquiry(data)
      setSubmitted(true)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const f = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }))
  const goal = getGoal(form.fitness_goal)

  const inputStyle = {
    width: '100%', padding: '0.65rem 0.9rem', background: '#f9f9f9',
    border: '1px solid #e5e5e5', borderRadius: 8, fontSize: '0.88rem',
    color: '#111', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle = {
    fontSize: '0.68rem', letterSpacing: '0.5px', textTransform: 'uppercase',
    color: '#aaa', display: 'block', marginBottom: '0.35rem', fontWeight: 600,
  }
  const cardStyle = {
    background: '#fff', border: '1px solid #ebebeb', borderRadius: 12,
    padding: '1.5rem', marginBottom: '1.5rem',
  }

  if (loading) return <div style={{ color: '#aaa', padding: '2rem', textAlign: 'center' }}>Loading...</div>

  const canSubmit = !inquiry || inquiry.status === 'closed'
  const activeInquiry = inquiry && inquiry.status !== 'closed'

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#aaa', marginBottom: '0.5rem' }}>Training Type</div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', letterSpacing: '2px', color: '#111', lineHeight: 1 }}>OFFLINE TRAINING</h1>
        <p style={{ color: '#777', fontSize: '0.9rem', lineHeight: 1.7, marginTop: '0.75rem' }}>
          Train at the gym with Ram's personalized plan. Ram assigns your workout and diet plan, then contacts you directly on WhatsApp.
        </p>
      </div>

      {/* How it works */}
      <div style={cardStyle}>
        <div style={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#111', marginBottom: '1rem' }}>How It Works</div>
        {[
          ['1', 'Fill the form below', 'Share your goals and contact details.'],
          ['2', 'Ram contacts you on WhatsApp within 24 hours', 'Ram reviews your inquiry personally.'],
          ['3', 'Get your plan and start training', 'You receive a custom workout + diet plan.'],
        ].map(([num, title, desc]) => (
          <div key={num} style={{ display: 'flex', gap: '1rem', padding: '0.75rem 0', borderBottom: num !== '3' ? '1px solid #f5f5f5' : 'none' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>{num}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#111' }}>{title}</div>
              <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.15rem' }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Active inquiry status card */}
      {activeInquiry && (
        <div style={{ ...cardStyle, borderColor: '#d1fae5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111', marginBottom: '0.2rem' }}>Your Training Request</div>
              <div style={{ fontSize: '0.75rem', color: '#aaa' }}>Submitted {new Date(inquiry.created_at).toLocaleDateString('en-IN')}</div>
            </div>
            <StatusBadge status={inquiry.status} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            {[
              ['Goal', inquiry.fitness_goal],
              ['Time', inquiry.preferred_time || '—'],
              ['Location', inquiry.location || '—'],
            ].map(([l, v]) => (
              <div key={l}>
                <div style={labelStyle}>{l}</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#111' }}>{v}</div>
              </div>
            ))}
          </div>

          {inquiry.ram_notes && (
            <div style={{ background: '#fffbeb', border: '0.5px solid #fde68a', borderRadius: 8, padding: '0.85rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#b45309', marginBottom: '0.35rem', fontWeight: 700 }}>📝 Note from Ram</div>
              <div style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.6 }}>{inquiry.ram_notes}</div>
            </div>
          )}

          {inquiry.assigned_program && (
            <div style={{ background: '#f0fdf4', border: '0.5px solid #86efac', borderRadius: 8, padding: '0.85rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#16a34a', marginBottom: '0.35rem', fontWeight: 700 }}>✓ Program Assigned</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111' }}>{inquiry.assigned_program.name}</div>
              <div style={{ fontSize: '0.78rem', color: '#666', marginTop: '0.2rem' }}>{inquiry.assigned_program.fitness_goal} · {inquiry.assigned_program.level} · {inquiry.assigned_program.days_per_week} days/week · {inquiry.assigned_program.duration_weeks} weeks</div>
            </div>
          )}

          <a
            href={`https://wa.me/${RAM_WHATSAPP}?text=${whatsappMemberMessage(inquiry.full_name, inquiry.fitness_goal)}`}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.5rem', background: '#25d366', color: '#fff', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}
          >
            💬 Message Ram on WhatsApp
          </a>
        </div>
      )}

      {/* Success state after submit */}
      {submitted && (
        <div style={{ ...cardStyle, borderColor: '#d1fae5', textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111', marginBottom: '0.5rem' }}>Request Sent!</div>
          <p style={{ color: '#777', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Ram will contact you within 24 hours on WhatsApp.</p>
          <a
            href={`https://wa.me/${RAM_WHATSAPP}?text=${whatsappMemberMessage(form.full_name, form.fitness_goal)}`}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.5rem', background: '#25d366', color: '#fff', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}
          >
            💬 Message Ram on WhatsApp
          </a>
        </div>
      )}

      {/* Contact Form */}
      {canSubmit && !submitted && (
        <div style={cardStyle}>
          <div style={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#111', marginBottom: '1.5rem' }}>
            {inquiry?.status === 'closed' ? 'Submit New Request' : 'Fill Your Details'}
          </div>
          <form onSubmit={handleSubmit}>
            {/* Goal selector with visual cards */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Fitness Goal *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {GOAL_IDS.map(gid => {
                  const g = getGoal(gid)
                  const selected = form.fitness_goal === gid
                  return (
                    <button type="button" key={gid} onClick={() => setForm(p => ({ ...p, fitness_goal: gid }))}
                      style={{ padding: '0.65rem 0.5rem', border: `2px solid ${selected ? '#111' : '#e5e5e5'}`, borderRadius: 8, background: selected ? '#111' : '#fff', color: selected ? '#fff' : '#555', fontSize: '0.8rem', fontWeight: selected ? 600 : 400, cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                      {g.icon} {gid}
                    </button>
                  )
                })}
              </div>
              {goal && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#888', padding: '0.5rem 0.75rem', background: '#fafafa', borderRadius: 6 }}>
                  {goal.dietApproach}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input required style={inputStyle} value={form.full_name} onChange={f('full_name')} placeholder="Your name" />
              </div>
              <div>
                <label style={labelStyle}>WhatsApp Number *</label>
                <input required style={inputStyle} value={form.phone} onChange={f('phone')} placeholder="+91 90000 00000" />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} value={form.email} onChange={f('email')} placeholder="your@email.com" />
              </div>
              <div>
                <label style={labelStyle}>Preferred Training Time *</label>
                <select required style={inputStyle} value={form.preferred_time} onChange={f('preferred_time')}>
                  {TRAINING_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Gym / Location (optional)</label>
                <input style={inputStyle} value={form.location} onChange={f('location')} placeholder="e.g. Gold's Gym, Hyderabad" />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Message to Ram (optional)</label>
              <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }}
                value={form.message} onChange={f('message')}
                placeholder="Injuries, current fitness level, specific goals..."
              />
            </div>

            <button type="submit" disabled={saving}
              style={{ padding: '0.8rem 2rem', background: '#111', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Sending...' : 'Send Request to Ram →'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
