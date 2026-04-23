import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { initiatePayment, PLANS } from '../../lib/razorpay'

const FEATURES = [
  { label: 'Custom Plan',        offline: true,  online: true },
  { label: 'Diet Plan',          offline: true,  online: true },
  { label: 'Progress Tracking',  offline: true,  online: true },
  { label: 'Live Sessions',      offline: false, online: true },
  { label: 'Chat with Ram',      offline: false, online: true },
  { label: 'Form Check',         offline: false, online: true },
  { label: 'Advanced Analytics', offline: false, online: true },
  { label: 'Priority Support',   offline: false, online: true },
]

const ONLINE_PLANS = [
  { id: 'monthly',  label: 'Monthly',  price: '₹999',    period: 'per month',                  featured: false },
  { id: 'yearly',   label: 'Yearly',   price: '₹4,999',  period: 'per year — save 58%',        featured: true, badge: 'Best Value' },
  { id: 'lifetime', label: 'Lifetime', price: '₹14,999', period: 'one-time — never pay again', featured: false },
]

const S = {
  heading: { fontSize: '1.5rem', fontWeight: 700, color: '#111', marginBottom: '0.2rem' },
  sub: { color: '#aaa', fontSize: '0.83rem', marginBottom: '2rem' },
  card: { background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' },
  tableRow: (i) => ({ display: 'grid', gridTemplateColumns: '1fr 100px 100px', gap: '0.5rem', padding: '0.65rem 0', borderBottom: '1px solid #f5f5f5', alignItems: 'center', background: i % 2 === 0 ? '#fafafa' : '#fff', padding: '0.75rem 1rem' }),
  check: (v) => ({ textAlign: 'center', fontSize: '1rem', color: v ? '#16a34a' : '#d1d5db' }),
  planCard: (selected, featured) => ({
    background: '#fff', border: `2px solid ${selected ? '#111' : featured ? '#555' : '#ebebeb'}`,
    borderRadius: 12, padding: '1.5rem', cursor: 'pointer', position: 'relative',
    transition: 'all 0.2s', transform: featured ? 'scale(1.02)' : 'none',
  }),
  btn: { padding: '0.85rem 2rem', background: '#111', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', width: '100%', marginTop: '1.5rem' },
}

export default function OnlineTraining() {
  const { profile, setProfile } = useAuthStore()
  const [selected, setSelected] = useState('yearly')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handlePayment = () => {
    setLoading(true)
    initiatePayment({
      plan: selected,
      user: profile,
      onSuccess: () => {
        setProfile({ ...profile, plan: selected, is_premium: true })
        setSuccess(true)
        setLoading(false)
      },
      onError: (msg) => {
        if (msg !== 'Payment cancelled') alert('Payment failed: ' + msg)
        setLoading(false)
      },
    })
  }

  if (success) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111', marginBottom: '0.5rem' }}>You're Premium!</h1>
      <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '2rem' }}>Welcome to online training. Live sessions and full features are now unlocked.</p>
      <a href="/dashboard" style={{ padding: '0.75rem 2rem', background: '#111', color: '#fff', borderRadius: 10, fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}>Go to Dashboard</a>
    </div>
  )

  return (
    <div>
      <h1 style={S.heading}>Online Training</h1>
      <p style={S.sub}>Train anywhere with Ram's live guidance and full premium features.</p>

      {/* Feature Comparison Table */}
      <div style={S.card}>
        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#111', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>What You Get</div>

        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px', gap: '0.5rem', padding: '0.5rem 1rem', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Feature</div>
          <div style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Offline</div>
          <div style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#111', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Online ✦</div>
        </div>

        {FEATURES.map((f, i) => (
          <div key={f.label} style={{
            display: 'grid', gridTemplateColumns: '1fr 100px 100px', gap: '0.5rem',
            padding: '0.75rem 1rem', alignItems: 'center',
            background: i % 2 === 0 ? '#fafafa' : '#fff',
            borderRadius: 6,
          }}>
            <div style={{ fontSize: '0.88rem', color: '#333' }}>{f.label}</div>
            <div style={S.check(f.offline)}>{f.offline ? '✓' : '✗'}</div>
            <div style={{ textAlign: 'center', fontSize: '1rem', color: f.online ? '#16a34a' : '#d1d5db', fontWeight: f.online ? 700 : 400 }}>{f.online ? '✓' : '✗'}</div>
          </div>
        ))}
      </div>

      {/* Pricing or active plan */}
      {profile?.is_premium ? (
        <div style={{ ...S.card, textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⭐</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', padding: '0.3rem 0.75rem', background: '#dcfce7', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>Active</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111', textTransform: 'capitalize', marginBottom: '0.4rem' }}>{profile.plan} Plan</h2>
          <p style={{ color: '#aaa', fontSize: '0.82rem' }}>
            {profile.plan_expires_at
              ? `Renews on ${new Date(profile.plan_expires_at).toLocaleDateString('en-IN')}`
              : 'Lifetime access — never expires'}
          </p>
          <p style={{ color: '#888', fontSize: '0.82rem', marginTop: '0.75rem' }}>You have full access to all online training features including live sessions with Ram.</p>
        </div>
      ) : (
        <div style={S.card}>
          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#111', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Choose Your Plan</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {ONLINE_PLANS.map(plan => (
              <div key={plan.id} onClick={() => setSelected(plan.id)} style={S.planCard(selected === plan.id, plan.featured)}>
                {plan.badge && (
                  <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#111', color: '#fff', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', padding: '0.25rem 0.75rem', borderRadius: 999, whiteSpace: 'nowrap' }}>
                    {plan.badge}
                  </div>
                )}
                <div style={{ fontSize: '0.72rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>{plan.label}</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '1px', color: '#111', lineHeight: 1, marginBottom: '0.25rem' }}>{plan.price}</div>
                <div style={{ fontSize: '0.72rem', color: '#aaa', marginBottom: '0.5rem' }}>{plan.period}</div>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selected === plan.id ? '#111' : '#e0e0e0'}`, background: selected === plan.id ? '#111' : 'transparent', margin: '0.5rem 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selected === plan.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                </div>
              </div>
            ))}
          </div>
          <button style={S.btn} onClick={handlePayment} disabled={loading}>
            {loading ? 'Processing...' : `Start Online Training — ${ONLINE_PLANS.find(p => p.id === selected)?.price}`}
          </button>
          <p style={{ fontSize: '0.75rem', color: '#aaa', textAlign: 'center', marginTop: '0.75rem' }}>Secure payment via Razorpay · Cancel anytime</p>
        </div>
      )}
    </div>
  )
}
