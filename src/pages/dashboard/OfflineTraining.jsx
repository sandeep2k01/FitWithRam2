import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import {
  GOALS, TRAINING_TIMES, STATUS_COLORS,
  RAM_WHATSAPP, whatsappMemberMessage
} from '../../lib/constants'

const S = {
  page: { maxWidth: 720 },
  heading: { fontSize: '1.5rem', fontWeight: 700, color: '#111', marginBottom: '0.2rem' },
  sub: { color: '#aaa', fontSize: '0.83rem', marginBottom: '2rem' },
  card: { background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' },
  step: { display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem 0', borderBottom: '1px solid #f5f5f5' },
  stepNum: { width: 32, height: 32, borderRadius: '50%', background: '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 },
  label: { fontSize: '0.68rem', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#aaa', display: 'block', marginBottom: '0.35rem', fontWeight: 600 },
  input: { width: '100%', padding: '0.65rem 0.85rem', background: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: '0.88rem', color: '#111', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' },
  btn: { padding: '0.75rem 2rem', background: '#111', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  btnWhatsApp: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#25d366', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none' },
}

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.pending
  return (
    <span style={{ padding: '0.3rem 0.75rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', background: c.bg, color: c.color }}>
      {status}
    </span>
  )
}

export default function OfflineTraining() {
  const { profile } = useAuthStore()
  const [inquiry, setInquiry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    fitness_goal: 'Muscle Building',
    preferred_time: 'Morning (6am-12pm)',
    location: '',
    message: '',
  })

  useEffect(() => {
    if (profile) {
      setForm(f => ({
        ...f,
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
      }))
      fetchInquiry()
    }
  }, [profile])

  const fetchInquiry = async () => {
    const { data } = await supabase
      .from('inquiries')
      .select('*, assigned_program:programs(name, goal, level), assigned_diet:diet_plans(name)')
      .eq('user_id', profile.id)
      .eq('training_type', 'offline')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    setInquiry(data)
    setLoading(false)
  }

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await supabase.from('inquiries').insert({
        user_id: profile.id,
        training_type: 'offline',
        ...form,
      }).select().single()
      setInquiry(data)
      setSubmitted(true)
    } finally { setSaving(false) }
  }

  const field = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  if (loading) return <div style={{ color: '#aaa', padding: '2rem', textAlign: 'center', fontSize: '0.85rem' }}>Loading...</div>

  const canSubmit = !inquiry || inquiry.status === 'closed'

  return (
    <div style={S.page}>
      <h1 style={S.heading}>Offline Training</h1>
      <p style={S.sub}>Train at the gym with Ram's personalized plan. Ram assigns your workout and diet plan, then contacts you directly on WhatsApp.</p>

      {/* How it works */}
      <div style={S.card}>
        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#111', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>How It Works</div>
        {[
          ['Step 1', 'Fill the form below with your details and fitness goal'],
          ['Step 2', 'Ram contacts you on WhatsApp within 24 hours'],
          ['Step 3', 'Get your personalized plan and start training at the gym'],
        ].map(([step, desc], i) => (
          <div key={step} style={{ ...S.step, borderBottom: i === 2 ? 'none' : '1px solid #f5f5f5' }}>
            <div style={S.stepNum}>{i + 1}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111', marginBottom: '0.2rem' }}>{step}</div>
              <div style={{ fontSize: '0.82rem', color: '#777' }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Existing inquiry status */}
      {inquiry && inquiry.status !== 'closed' && (
        <div style={{ ...S.card, borderColor: '#d1fae5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111', marginBottom: '0.25rem' }}>Your Training Request</div>
              <div style={{ fontSize: '0.78rem', color: '#aaa' }}>Submitted {new Date(inquiry.created_at).toLocaleDateString('en-IN')}</div>
            </div>
            <StatusBadge status={inquiry.status} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            {[
              ['Goal', inquiry.fitness_goal],
              ['Preferred Time', inquiry.preferred_time],
              ['Location', inquiry.location || '—'],
              ['Training Type', 'Offline at Gym'],
            ].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: '0.68rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>{l}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#111' }}>{v}</div>
              </div>
            ))}
          </div>

          {inquiry.ram_notes && (
            <div style={{ background: '#fafafa', border: '0.5px solid #e5e5e5', borderRadius: 8, padding: '0.85rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#aaa', marginBottom: '0.35rem', fontWeight: 700 }}>Ram's Notes</div>
              <div style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.6 }}>{inquiry.ram_notes}</div>
            </div>
          )}

          {inquiry.assigned_program && (
            <div style={{ background: '#f0fdf4', border: '0.5px solid #86efac', borderRadius: 8, padding: '0.85rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#16a34a', marginBottom: '0.35rem', fontWeight: 700 }}>✓ Program Assigned</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111' }}>{inquiry.assigned_program.name}</div>
              {inquiry.assigned_program.goal && <div style={{ fontSize: '0.78rem', color: '#666' }}>{inquiry.assigned_program.goal} · {inquiry.assigned_program.level}</div>}
            </div>
          )}

          <a
            href={`https://wa.me/${RAM_WHATSAPP}?text=${whatsappMemberMessage(inquiry.full_name, inquiry.fitness_goal)}`}
            target="_blank" rel="noopener noreferrer"
            style={S.btnWhatsApp}
          >
            💬 Message Ram on WhatsApp
          </a>
        </div>
      )}

      {/* Success message after submit */}
      {submitted && (
        <div style={{ ...S.card, borderColor: '#d1fae5', textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111', marginBottom: '0.5rem' }}>Request Sent!</div>
          <p style={{ color: '#777', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Ram will contact you within 24 hours on WhatsApp.</p>
          <a
            href={`https://wa.me/${RAM_WHATSAPP}?text=${whatsappMemberMessage(form.full_name || profile?.full_name, form.fitness_goal)}`}
            target="_blank" rel="noopener noreferrer"
            style={S.btnWhatsApp}
          >
            💬 Message Ram on WhatsApp
          </a>
        </div>
      )}

      {/* Inquiry Form */}
      {canSubmit && !submitted && (
        <div style={S.card}>
          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#111', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {inquiry?.status === 'closed' ? 'Submit New Request' : 'Fill Your Details'}
          </div>
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={S.label}>Full Name *</label>
                <input required style={S.input} value={form.full_name} onChange={field('full_name')} placeholder="Your name" />
              </div>
              <div>
                <label style={S.label}>WhatsApp Number *</label>
                <input required style={S.input} value={form.phone} onChange={field('phone')} placeholder="+91 90000 00000" />
              </div>
              <div>
                <label style={S.label}>Email</label>
                <input style={S.input} value={form.email} onChange={field('email')} placeholder="your@email.com" />
              </div>
              <div>
                <label style={S.label}>Gym / Location (optional)</label>
                <input style={S.input} value={form.location} onChange={field('location')} placeholder="e.g. Gold's Gym, Hyderabad" />
              </div>
              <div>
                <label style={S.label}>Fitness Goal *</label>
                <select required style={S.input} value={form.fitness_goal} onChange={field('fitness_goal')}>
                  {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Preferred Training Time *</label>
                <select required style={S.input} value={form.preferred_time} onChange={field('preferred_time')}>
                  {TRAINING_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={S.label}>Message to Ram (optional)</label>
              <textarea
                rows={4} style={{ ...S.input, resize: 'vertical' }}
                value={form.message} onChange={field('message')}
                placeholder="Tell Ram about your current fitness level, any injuries, or specific goals..."
              />
            </div>
            <button type="submit" style={S.btn} disabled={saving}>
              {saving ? 'Sending...' : 'Send Request to Ram →'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
