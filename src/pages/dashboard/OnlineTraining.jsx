import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { initiatePayment, PLANS } from '../../lib/razorpay'
import { GOALS } from '../../lib/goals'

const ONLINE_FEATURES = [
  { label: 'Custom Workout Plan',  offline: true,  online: true },
  { label: 'Diet Plan',            offline: true,  online: true },
  { label: 'Progress Tracking',    offline: true,  online: true },
  { label: 'Live Sessions',        offline: false, online: true },
  { label: 'Chat with Ram',        offline: false, online: true },
  { label: 'Form Check',           offline: false, online: true },
  { label: 'Advanced Analytics',   offline: false, online: true },
  { label: 'Priority Support',     offline: false, online: true },
]

const ONLINE_PLANS = [
  { id: 'monthly',  label: 'Monthly',  price: '₹999',    note: 'per month' },
  { id: 'yearly',   label: 'Yearly',   price: '₹4,999',  note: 'per year — save 58%', featured: true },
  { id: 'lifetime', label: 'Lifetime', price: '₹14,999', note: 'one-time payment' },
]

export default function OnlineTraining() {
  const { profile, setProfile } = useAuthStore()
  const [selected, setSelected] = useState('yearly')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handlePayment = () => {
    setLoading(true)
    initiatePayment({
      plan: selected, user: profile,
      onSuccess: () => { setProfile({ ...profile, plan: selected, is_premium: true }); setSuccess(true); setLoading(false) },
      onError: (msg) => { if (msg !== 'Payment cancelled') alert('Payment failed: ' + msg); setLoading(false) },
    })
  }

  if (success) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', letterSpacing: '2px', color: '#111', marginBottom: '0.5rem' }}>YOU'RE PREMIUM!</h1>
      <p style={{ color: '#aaa', fontSize: '0.88rem', marginBottom: '2rem' }}>Live sessions and all premium features are now unlocked.</p>
      <a href="/dashboard" style={{ padding: '0.75rem 2rem', background: '#111', color: '#fff', borderRadius: 10, fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}>Go to Dashboard</a>
    </div>
  )

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#aaa', marginBottom: '0.5rem' }}>Training Type</div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', letterSpacing: '2px', color: '#111', lineHeight: 1 }}>ONLINE TRAINING</h1>
        <p style={{ color: '#777', fontSize: '0.9rem', lineHeight: 1.7, marginTop: '0.75rem' }}>Train anywhere with Ram's live guidance and full premium features.</p>
      </div>

      {/* Comparison table */}
      <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#111', marginBottom: '1rem' }}>Online vs Offline</div>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px', gap: '0.5rem', padding: '0.5rem 0.75rem', marginBottom: '0.25rem' }}>
          <div style={{ fontSize: '0.68rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Feature</div>
          <div style={{ textAlign: 'center', fontSize: '0.68rem', color: '#999', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Offline</div>
          <div style={{ textAlign: 'center', fontSize: '0.68rem', color: '#111', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Online ✦</div>
        </div>
        {ONLINE_FEATURES.map((feat, i) => (
          <div key={feat.label} style={{
            display: 'grid', gridTemplateColumns: '1fr 90px 90px', gap: '0.5rem',
            padding: '0.65rem 0.75rem', borderRadius: 6,
            background: i % 2 === 0 ? '#fafafa' : '#fff', alignItems: 'center',
          }}>
            <div style={{ fontSize: '0.88rem', color: '#333' }}>{feat.label}</div>
            <div style={{ textAlign: 'center', color: feat.offline ? '#16a34a' : '#d1d5db', fontWeight: 600 }}>{feat.offline ? '✓' : '✗'}</div>
            <div style={{ textAlign: 'center', color: feat.online ? '#16a34a' : '#d1d5db', fontWeight: 700 }}>{feat.online ? '✓' : '✗'}</div>
          </div>
        ))}
      </div>

      {/* Pricing or active plan */}
      {profile?.is_premium ? (
        <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⭐</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', padding: '0.3rem 0.75rem', background: '#dcfce7', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>Active</div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', letterSpacing: '2px', color: '#111', textTransform: 'capitalize', marginBottom: '0.4rem' }}>{profile.plan} Plan</h2>
          <p style={{ color: '#aaa', fontSize: '0.82rem' }}>
            {profile.plan_expires_at ? `Renews on ${new Date(profile.plan_expires_at).toLocaleDateString('en-IN')}` : 'Lifetime access — never expires'}
          </p>
          <p style={{ color: '#888', fontSize: '0.82rem', marginTop: '0.75rem' }}>You have full access to live sessions, form checks, and direct chat with Ram.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 12, padding: '1.5rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#111', marginBottom: '1.25rem' }}>Choose Your Plan</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {ONLINE_PLANS.map(plan => (
              <div key={plan.id} onClick={() => setSelected(plan.id)} style={{
                background: '#fff', border: `2px solid ${selected === plan.id ? '#111' : plan.featured ? '#555' : '#e5e5e5'}`,
                borderRadius: 10, padding: '1.25rem', cursor: 'pointer', position: 'relative',
                transform: plan.featured ? 'scale(1.02)' : 'none', transition: 'all 0.2s',
              }}>
                {plan.featured && (
                  <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#111', color: '#fff', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '0.2rem 0.75rem', borderRadius: 999, whiteSpace: 'nowrap' }}>
                    Best Value
                  </div>
                )}
                <div style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>{plan.label}</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '1px', color: '#111', lineHeight: 1, marginBottom: '0.2rem' }}>{plan.price}</div>
                <div style={{ fontSize: '0.72rem', color: '#aaa' }}>{plan.note}</div>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selected === plan.id ? '#111' : '#e0e0e0'}`, background: selected === plan.id ? '#111' : 'transparent', marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selected === plan.id && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
                </div>
              </div>
            ))}
          </div>
          <button onClick={handlePayment} disabled={loading}
            style={{ width: '100%', padding: '0.85rem', background: '#111', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Processing...' : `Start Online Training — ${ONLINE_PLANS.find(p => p.id === selected)?.price}`}
          </button>
          <p style={{ fontSize: '0.72rem', color: '#aaa', textAlign: 'center', marginTop: '0.75rem' }}>Secure payment via Razorpay · Cancel anytime</p>
        </div>
      )}
    </div>
  )
}
